const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();
const router = require('./router');

app.set('port', process.env.PORT);
app.use(helmet());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'dev' : 'combined'));
app.use('/api', router);

app.listen(app.get('port'), () => {
  if (process.env.MONGODB_URI) require('./db');

  console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});

module.exports = app;
