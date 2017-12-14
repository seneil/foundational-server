const express = require('express');
const router = express.Router();

const postAccount = require('./routes/post-account');
const getNotesRoute = require('./routes/get-notes');
const getNoteRoute = require('./routes/get-note');
const postNoteRoute = require('./routes/post-note');

router.route('/v1/notes').get(getNotesRoute);
router.route('/v1/notes/:name').get(getNoteRoute);
router.route('/v1/notes').post(postNoteRoute);
router.route('/v1/account').post(postAccount);

router.use((request, response, next) => {
  request.moderated = false;
  next();
});

module.exports = router;
