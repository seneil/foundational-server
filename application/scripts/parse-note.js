module.exports = function(note) {
  const urlRegexp = /([--:\w?@%&+~#=]*\.[a-z]{2,4}\/{0,2})((?:[?&](?:\w+)=(?:\w+))+|[--:\w?@%&+~#=]+)?/g;
  const emailRegexp = /[a-z0-9]+[_a-z0-9.-]*[a-z0-9]+@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})/g;
  const keywordRegexp = /(?:^|\s)(?:#+)([a-zA-Zа-яА-ЯЁё]+)(?![#a-zA-Zа-яА-ЯЁё])/ig;
  const transformations = [{
    regexp: /^(https?:\/\/vk.com\/)feed(\?w=)(wall-[0-9_]+)$/gi,
    replace: '$1$3',
  }, {
    regexp: /^(https?:\/\/medium.com\/)(.*\/)(.*)-([a-z0-9]+)$/gi,
    replace: '$1$2$4',
  }];

  const assets = { keywords: [], emails: [], urls: [] };

  note
    .replace(keywordRegexp, keyword => {
      const keywordItem = keyword.trim().replace(/^#+/, '');

      if (!assets.keywords.includes(keywordItem)) {
        assets.keywords.push(keywordItem);
      }

      return '';
    })
    .replace(emailRegexp, email => {
      assets.emails.push(email);
      return '';
    })
    .replace(urlRegexp, url => {
      if (!url.match(/^[a-zA-Z]+:\/\//)) {
        url = `http://${url}`;
      }

      if (!assets.urls.includes(url)) {
        let transformedUrl;

        transformations.forEach(form => {
          if (form.regexp.test(url)) {
            transformedUrl = url.replace(form.regexp, form.replace);
          }
        });

        assets.urls.push(transformedUrl || url);
      }

      return '';
    });

  return assets;
};
