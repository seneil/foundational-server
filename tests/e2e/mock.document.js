module.exports = function(title) {
  return `
    <!doctype html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">

      <meta property="og:title" content="OpenGraph Title: ${title}" />
      <meta property="og:description" content="OpenGraph Description" />
      <meta property="og:image" content="http://example.com/images/example.png" />

      <title>${title}</title>
    </head>
    <body>
    </body>
    </html>
`;
};
