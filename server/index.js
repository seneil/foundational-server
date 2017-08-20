const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const router = express.Router();

const config = require('../config/config');

const postAccount = require('./routes/post-account');

const getNotesRoute = require('./routes/get-notes');
const getNoteRoute = require('./routes/get-note');
const postNoteRoute = require('./routes/post-note');

mongoose.Promise = global.Promise;

router.route('/notes').get(getNotesRoute);
router.route('/notes/:name').get(getNoteRoute);
router.route('/notes').post(postNoteRoute);
router.route('/account').post(postAccount);

router.use((request, response, next) => {
  request.moderated = false;
  next();
});

app.set('port', (process.env.PORT || 3001));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'test' ? 'dev' : 'combined'));
app.use('/api', router);

app.listen(app.get('port'), () => {
  switch (process.env.NODE_ENV) {
    case 'test':
      mongoose.connect(config.mongodb.test);
      break;
    case 'production':
      mongoose.connect(config.mongodb.mlab);
      break;
    default:
      mongoose.connect(config.mongodb.local);
      break;
  }
  console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});

module.exports = app;
