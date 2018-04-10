const config = require('config');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();

const logger = require('./common/logger');
const router = require('./router');
const errorHandler = require('./common/error-handler');

const { port, env } = config.get('application');

app.use(helmet());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan(env === 'test' ? 'development' : 'combined'));
app.use('/api', router);
app.use(errorHandler);

app.listen(port, () => {
  // if (config.has('mongodb.uri')) {
  //   require('./db');
  // }

  logger.info('Find the server at: http://localhost:%s/api/v1/', port);
});

module.exports = app;
