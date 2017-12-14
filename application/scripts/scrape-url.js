const MetaInspector = require('node-metainspector');

module.exports = function(href) {
  return new Promise((resolve, reject) => {
    const client = new MetaInspector(href, { timeout: 1500 });

    client.on('fetch', () => {
      const {
        response: { headers },
        url,
        title = '',
        ogTitle,
        description = '',
        ogDescription,
        image = '',
        ogType,
      } = client;

      if (headers['content-type'].includes('text/html')) {
        return resolve({
          title: ogTitle || title,
          description: ogDescription || description,
          html: `<p>${(ogDescription || description).replace(/\n([\s\t]*\n)/g, '</p><p>').replace(/\n/g, '<br />')}</p>`,
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
