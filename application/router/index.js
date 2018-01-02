const express = require('express');
const passport = require('./passport-jwt');

const router = express.Router();

const getNotes = require('./routes/get-notes');
const getNote = require('./routes/get-note');
const getKeywords = require('./routes/get-keywords');
const getKeyword = require('./routes/get-keyword');
const postNote = require('./routes/post-note');
const deleteNote = require('./routes/delete-note');
const signup = require('./accounts/signup');
const login = require('./accounts/login');
const profile = require('./accounts/profile');

router.route('/v1/notes').get(getNotes);
router.route('/v1/notes/:name').get(getNote);
router.route('/v1/notes/:name').delete(deleteNote);
router.route('/v1/keywords').get(getKeywords);
router.route('/v1/keywords/:keyword').get(getKeyword);
router.route('/v1/notes').post(postNote);
router.route('/v1/notes/:name').delete(deleteNote);

router.route('/v1/signup').post(signup);
router.route('/v1/login').post(login);
router.route('/v1/profile').get(passport.authenticate('jwt', { session: false }), profile);

module.exports = router;
