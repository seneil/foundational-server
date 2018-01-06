const express = require('express');
const passport = require('./passport-jwt');

const router = express.Router();

const getPublicNotes = require('./routes/get-public-notes');
const getPublicNote = require('./routes/get-public-note');
const getKeywords = require('./routes/get-keywords');
const getKeyword = require('./routes/get-keyword');

const getNotes = require('./routes/get-notes');
const getNote = require('./routes/get-note');
const postNote = require('./routes/post-note');
const deleteNote = require('./routes/delete-note');

const signup = require('./accounts/signup');
const login = require('./accounts/login');
const profile = require('./accounts/profile');

router.route('/v1/public').get(getPublicNotes);
router.route('/v1/public/:name').get(getPublicNote);
router.route('/v1/keywords').get(getKeywords);
router.route('/v1/keywords/:keyword').get(getKeyword);

router.route('/v1/notes').get(passport.authenticate('jwt', { session: false }), getNotes);
router.route('/v1/notes/:name').get(passport.authenticate('jwt', { session: false }), getNote);
router.route('/v1/notes').post(passport.authenticate('jwt', { session: false }), postNote);
router.route('/v1/notes/:name').delete(passport.authenticate('jwt', { session: false }), deleteNote);

router.route('/v1/profile').get(passport.authenticate('jwt', { session: false }), profile);
router.route('/v1/profile/signup').post(signup);
router.route('/v1/profile/login').post(login);

module.exports = router;
