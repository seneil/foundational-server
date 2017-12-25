const express = require('express');

const router = express.Router();

const getNotes = require('./routes/get-notes');
const getNote = require('./routes/get-note');
const getKeywords = require('./routes/get-keywords');
const getKeyword = require('./routes/get-keyword');
const postNote = require('./routes/post-note');
const deleteNote = require('./routes/delete-note');
// const postAccount = require('./routes/post-account');

router.route('/v1/notes').get(getNotes);
router.route('/v1/notes/:name').get(getNote);
router.route('/v1/notes/:name').delete(deleteNote);
router.route('/v1/keywords').get(getKeywords);
router.route('/v1/keywords/:keyword').get(getKeyword);
router.route('/v1/notes').post(postNote);
// router.route('/v1/account').post(postAccount);

router.use((request, response, next) => {
  request.moderated = false;
  next();
});

module.exports = router;
