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

  const assets = { keywords: new Set(), emails: new Set(), urls: new Set() };

  note
    .replace(keywordRegexp, keyword => {
      const keywordItem = keyword.trim()
        .replace(/^#+/, '');

      assets.keywords.add(keywordItem);
      return '';
    })
    .replace(emailRegexp, email => {
      assets.emails.add(email);
      return '';
    })
    .replace(urlRegexp, url => {
      let transformedUrl;

      if (!url.match(/^[a-zA-Z]+:\/\//)) {
        url = `http://${url}`;
      }

      transformations.forEach(form => {
        if (form.regexp.test(url)) {
          transformedUrl = url.replace(form.regexp, form.replace);
        }
      });

      assets.urls.add(transformedUrl || url);

      return '';
    });

  return {
    keywords: Array.from(assets.keywords),
    emails: Array.from(assets.emails),
    urls: Array.from(assets.urls),
  };
};
