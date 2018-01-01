const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const promise = mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true,
});

promise.then(db => {
  const { host, port, name } = db;

  console.log(`MongoDB connected to: mongodb://${host}:${port}/${name}`);
});

module.exports = mongoose.connection;
