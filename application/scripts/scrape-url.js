const MetaInspector = require('node-metainspector');

module.exports = function(href) {
  return new Promise((resolve, reject) => {
    const client = new MetaInspector(href, { timeout: 5500 });

    client.on('fetch', () => {
      const {
        response: { headers },
        url,
        title,
        ogTitle,
        description,
        ogDescription,
        ogLocale,
        charset,
        image,
        ogType,
      } = client;

      if (headers['content-type'].includes('text/html')) {
        return resolve({
          title,
          ogTitle,
          description,
          ogDescription,
          ogLocale,
          charset,
          type: ogType,
          image,
        });
      } else if (headers['content-type'].includes('image/')) {
        return resolve({
          image: url,
          type: 'image',
        });
      }

      return reject();
    });

    client.on('error', reject);

    client.fetch();
  });
};
