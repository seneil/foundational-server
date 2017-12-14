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
  switch (process.env.NODE_ENV) {
    case 'test':
      mongoose.connect('mongodb://localhost:27017/note-keeper-test');
      break;
    case 'production':
      mongoose.connect(process.env.MONGODB_URI);
      break;
    default:
      mongoose.connect(process.env.MONGODB_URI);
      break;
  }

  console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});

module.exports = app;
