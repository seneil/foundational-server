const config = require('config');
const mongoose = require('mongoose');
const logger = require('./../application/common/logger');

mongoose.Promise = global.Promise;

const application = async() => {
  const { uri } = config.get('mongodb');

  try {
    await mongoose.connect(uri);
  } catch (error) {
    Promise.reject(error);
  }

  logger.info('MongoDB connected to: %s', uri);
};

application()
  .catch(error => logger.error('MongoDB connection error %o', error));

module.exports = mongoose.connection;
