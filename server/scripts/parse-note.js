module.exports = function(note) {
  const urlRegexp = /([--:\w?@%&+~#=]*\.[a-z]{2,4}\/{0,2})((?:[?&](?:\w+)=(?:\w+))+|[--:\w?@%&+~#=]+)?/g;
  const emailRegexp = /[a-z0-9]+[_a-z0-9.-]*[a-z0-9]+@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})/g;
  const hashtagRegexp = /(?:^|\s)(?:#+)([a-z]+)(?![#a-z])/ig;
  const transformations = [{
    regexp: /^(https?:\/\/vk.com\/)feed(\?w=)(wall-[0-9_]+)$/gi,
    replace: '$1$3',
  }, {
    regexp: /^(https?:\/\/medium.com\/)(.*\/)(.*)-([a-z0-9]+)$/gi,
    replace: '$1$2$4',
  }];

  const assets = { hashtags: [], emails: [], urls: [] };

  note
    .replace(hashtagRegexp, hashtag => {
      const hashtagWord = hashtag.trim().replace(/^#+/, '');

      if (!assets.hashtags.includes(hashtagWord)) {
        assets.hashtags.push(hashtagWord);
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

  assets.html = note
    ? `<p>${note.replace(/\n([\s\t]*\n)/g, '</p><p>').replace(/\n/g, '<br />')}</p>`
    : '';

  return assets;
};
