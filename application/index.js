const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const router = require('./router');

app.set('port', (process.env.PORT || 3001));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'dev' : 'combined'));
app.use('/api', router);

mongoose.Promise = global.Promise;

app.listen(app.get('port'), () => {
  if (process.env.MONGODB_URI) {
    const promise = mongoose.createConnection(process.env.MONGODB_URI, {
      useMongoClient: true,
    });

    promise.then(db => {
      const { host, port, name } = db;

      console.log(`MongoDB connected to: mongodb://${host}:${port}/${name}`);
    });
  }

  console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});

module.exports = app;
