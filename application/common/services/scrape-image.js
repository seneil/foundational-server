const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const config = require('config');
const Hashids = require('hashids');
const generate = require('nanoid/generate');

const request = require('request-promise')
  .defaults({ encoding: null });

const { promisify } = require('util');

const common = require('requirefrom')('application/common');

const logger = common('logger');

const open = promisify(fs.open);
const write = promisify(fs.write);
const close = promisify(fs.close);

const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const { salt, quality, storage, folderLength, filenameLength } = config.get('attachment');

const createFilename = ({ formats, date, ext }) => {
  const hashids = new Hashids(salt, folderLength, characters);

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const folderFirst = hashids.encode(year, month);
  const folderSecond = hashids.encode(day);

  const generatedName = generate(characters, filenameLength);
  const filePath = path.join(storage, folderFirst, folderSecond);

  return {
    original: {
      path: path.join(filePath),
      file: `${path.join(filePath, generatedName)}-original${ext ? `.${ext}` : ''}`,
    },
    relative: {
      path: path.join(folderFirst, folderSecond),
      name: generatedName,
      ext,
    },
    set: formats.map(format => {
      const fileName = `${generatedName}${format.prefix ? `-${format.prefix}` : ''}`;

      return {
        ...format,
        path: `${path.join(filePath, fileName)}${ext ? `.${ext}` : ''}`,
      };
    }),
  };
};

const getImageAspectRation = (width, height) => {
  const ratio = width / height;

  if (ratio < 0.7) {
    return Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP; // eslint-disable-line no-bitwise
  } else if (ratio > 1.7) {
    return Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_MIDDLE; // eslint-disable-line no-bitwise
  }

  return Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE; // eslint-disable-line no-bitwise
};

module.exports = async({ uri, date = new Date() }) => {
  if (!uri) return Promise.reject('No uri');

  logger.info('Found image %s', uri);

  if (uri.slice(0, 2) === '//') uri = `http:${uri}`;

  try {
    const body = await request.get(uri);
    logger.info('Image %s from %s', 'downloaded', uri);

    const original = await Jimp.read(body);
    const mime = original.getMIME();
    const extension = mime.split('/')[1];
    const types = createFilename({
      date,
      ext: extension,
      formats: [{
        prefix: 't800',
        method: 'scaleToFit',
        size: [800, 800],
      }, {
        prefix: 't320',
        method: 'scaleToFit',
        size: [320, 320],
      }, {
        prefix: 'c180',
        method: 'cover',
        size: [180, 180],
      }, {
        prefix: 'c90',
        method: 'cover',
        size: [90, 90],
      }],
    });

    logger.info('Image readed');

    const writeOriginalImage = async type => {
      const fd = await open(type.original.file, 'w');
      await write(fd, body, 0, body.length, null);
      logger.info('Original image copied to %s', type.original.file);
      await close(fd);
      return types.relative;
    };

    await Promise.all(types.set.map(async type => {
      const copy = await original.clone()
        .quality(quality);

      if (type.method === 'cover') {
        const { width, height } = copy.bitmap;
        const ratio = getImageAspectRation(width, height);

        logger.info('Image %d x %d cover as ration %d and %d', width, height, width / height, ratio);
        type.size.push(ratio);
      }

      await copy[type.method](...type.size);
      await copy.write(type.path);

      logger.info('Image resized to %s', type.path);
    }));

    return await writeOriginalImage(types);
  } catch (error) {
    return Promise.reject(error);
  }
};
