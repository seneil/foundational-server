const config = require('config');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { uri } = config.get('mongodb');

const promise = mongoose.connect(uri, {
  useMongoClient: true,
});

promise
  .then(db => {
    const { host, port, name } = db;

    console.log(`MongoDB connected to: mongodb://${host}:${port}/${name}`);
  })
  .catch(error => {
    console.log(`MongoDB ${error.message}`);
    process.exit(1);
  });

module.exports = mongoose.connection;
