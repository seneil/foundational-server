const mongoose = require('mongoose');
const shortID = require('mongodb-short-id');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const nock = require('nock');

const mockDocument = require('./mock.document');
const mockDummyDocument = require('./mock.dummy.document');

const { OK, NOT_FOUND } = require('../application/router/constants/answer-codes');

const server = require('../application');

const noteSchema = require('../application/schemas/note-schema');
const openGraphSchema = require('../application/schemas/opengraph-schema');
const accountSchema = require('../application/schemas/account-schema');
const sessionSchema = require('../application/schemas/session-schema');

const Note = mongoose.model('Note', noteSchema);
const OpenGraph = mongoose.model('OpenGraph', openGraphSchema);
const Account = mongoose.model('Account', accountSchema);
const Session = mongoose.model('Session', sessionSchema);

chai.use(chaiHttp);

// TODO нужно сделать все ответы с кодом 200 и status: 'ok'

describe('Запросы к серверу', function() {
  beforeEach(function() {
    nock('http://example.com')
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .get('/')
      .reply(200, mockDocument('Scratched document'));

    nock('http://google.com')
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .get('/')
      .reply(200, mockDocument('Google template title'));

    nock('http://dummy.com')
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .get('/')
      .reply(200, mockDummyDocument());

    nock('http://example.com')
      .defaultReplyHeaders({
        'Content-Type': 'image/png',
      })
      .get('/images/example.png')
      .reply(200, '');
  });

  beforeEach(function(done) {
    const commands = [
      Note.remove({}).exec(),
      OpenGraph.remove({}).exec(),
      Account.remove({}).exec(),
      Session.remove({}).exec(),
    ];

    Promise.all(commands).then(() => {
      done();
    });
  });

  describe('/GET notes', function() {
    it('Должен возвращаться пустой список заметок', function(done) {
      chai.request(server)
        .get('/api/notes')
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.deep.equal({
            status: OK,
            result: {
              notes: [],
              count: 0,
            },
          });
          done();
        });
    });
  });

  describe('/GET note/:noteName', function() {
    it('Должна вернуться ошибка ненайденной заметки', function(done) {
      chai.request(server)
        .get('/api/notes/note404')
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.deep.equal({
            status: NOT_FOUND,
          });
          done(error);
        });
    });

    it('Должна вернуться заметка по переданному имени', function(done) {
      const text = `The BDD styles are expect and should.
        Both use the same chainable language to construct assertions, but they differ in the way an assertion is initially constructed.
        Check out the Style Guide for a comparison.
        http://chaijs.com/api/bdd/`;

      const note = Note.parseNote({ body: text });

      note.name = shortID.objectIDtoShort(note._id);

      note.save(error => {
        if (error) return done(error);

        return chai.request(server)
          .get(`/api/notes/${note.name}`)
          .end((error, response) => {
            const { result: { note } } = response.body;

            expect(response.status).to.equal(200);
            expect(response.body.status).to.equal(OK);

            expect(note).to.have.a.property('body');
            expect(note.body).to.equal(text);
            expect(note.attachments.length)
              .to.equal(1);
            expect(note.attachments[0].url)
              .to.equal('http://chaijs.com/api/bdd/');
            done(error);
          });
      });
    });
  });

  describe('/POST note', function() {
    it('Должна быть сохранена и вернуться оформленная заметка', function(done) {
      const text = `MLab Note-keeper database
        https://mlab.com/databases/note-keeper#collections`;

      chai.request(server)
        .post('/api/notes')
        .send({ body: text })
        .end((error, response) => {
          const { result: { note } } = response.body;

          expect(response.status).to.equal(200);
          expect(response.body.status).to.equal(OK);

          expect(note).to.have.a.property('body');
          expect(note.body).to.equal(text);
          expect(note.attachments.length)
            .to.equal(1);
          expect(note.attachments[0].url)
            .to.equal('https://mlab.com/databases/note-keeper#collections');
          done(error);
        });
    });

    it('Должна вернуться оформленная заметка c одним вложением', function(done) {
      const text = `This domain is established to be used for illustrative examples in documents.
        You may use this domain in examples without prior coordination or asking for permission.
        http://example.com/`;

      chai.request(server)
        .post('/api/notes')
        .send({ body: text })
        .end((error, response) => {
          if (error) done(error);

          setTimeout(() => {
            chai.request(server)
              .get(`/api/notes/${response.body.result.note.name}`)
              .end((getError, getResponse) => {
                const { result: { note } } = getResponse.body;

                expect(getResponse.status).to.equal(200);
                expect(getResponse.body.status).to.equal(OK);

                expect(note.attachments.length)
                  .to.equal(1);
                expect(note.attachments[0].opengraph.title)
                  .to.equal('OpenGraph Title: Scratched document');
                done(error);
              });
          }, 300);
        });
    });

    it('Должна вернуться оформленная заметка c одним вложением без opengraph', function(done) {
      const text = `This domain is established to be used for illustrative examples in documents.
        You may use this domain in examples without prior coordination or asking for permission.
        http://dummy.com`;

      chai.request(server)
        .post('/api/notes')
        .send({ body: text })
        .end((error, response) => {
          if (error) done(error);

          setTimeout(() => {
            chai.request(server)
              .get(`/api/notes/${response.body.result.note.name}`)
              .end((getError, getResponse) => {
                const { result: { note } } = getResponse.body;

                expect(getResponse.status).to.equal(200);
                expect(getResponse.body.status).to.equal(OK);

                expect(note.attachments.length)
                  .to.equal(1);
                expect(note.attachments[0].opengraph.title)
                  .to.equal('');
                expect(note.attachments[0].opengraph.html)
                  .to.equal('<p></p>');
                done();
              });
          }, 300);
        });
    });

    it('Должна вернуться оформленная заметка c двумя вложениями', function(done) {
      const text = `This domain is established to be used for illustrative examples in documents.
        You may use this domain in examples without prior coordination or asking for permission.
        
        Example site: http://example.com/
        Google search: http://google.com`;

      chai.request(server)
        .post('/api/notes')
        .send({ body: text })
        .end((error, response) => {
          if (error) done(error);

          setTimeout(() => {
            chai.request(server)
              .get(`/api/notes/${response.body.result.note.name}`)
              .end((getError, getResponse) => {
                const { result: { note } } = getResponse.body;

                expect(getResponse.status).to.equal(200);
                expect(getResponse.body.status).to.equal(OK);

                expect(note.attachments.length)
                  .to.equal(2);
                expect(note.attachments[0].opengraph.title)
                  .to.equal('OpenGraph Title: Scratched document');
                expect(note.attachments[1].opengraph.title)
                  .to.equal('OpenGraph Title: Google template title');
                done();
              });
          }, 300);
        });
    });

    it('Должна вернуться оформленная заметка c вложением картинкой', function(done) {
      const text = `This domain is established to be used for illustrative examples in documents.
        You may use this domain in examples without prior coordination or asking for permission.
        http://example.com/images/example.png`;

      chai.request(server)
        .post('/api/notes')
        .send({ body: text })
        .end((error, response) => {
          if (error) done(error);

          chai.request(server)
            .get(`/api/notes/${response.body.result.note.name}`)
            .end((getError, getResponse) => {
              const { result: { note } } = getResponse.body;

              expect(getResponse.status).to.equal(200);
              expect(getResponse.body.status).to.equal(OK);

              expect(note.attachments.length)
                .to.equal(1);
              expect(note.attachments[0].opengraph.type)
                .to.equal('image');
              expect(note.attachments[0].opengraph.image)
                .to.equal('http://example.com/images/example.png');
              done();
            });
        });
    });
  });

  describe('/POST account', function() {
    it('Должны быть сохранены данные аккаунта', function(done) {
      const data = {
        username: 'dshster',
        email: 'account@example.com',
        password: 'password',
      };

      chai.request(server)
        .post('/api/account')
        .send(data)
        .end((error, response) => {
          const { result: { account } } = response.body;

          expect(response.status).to.equal(200);
          expect(response.body.status).to.equal(OK);

          expect(account).to.have.a.property('username');
          expect(account).to.have.a.property('sessionId');
          expect(account).to.not.have.a.property('password');
          expect(account).to.not.have.a.property('email');
          expect(account.username).to.equal('dshster');
          return done(error);
        });
    });

    it('Должна быть ошибка при дублировании данных аккаунта', function(done) {
      const data = {
        username: 'dshster',
        email: 'account@example.com',
        password: 'password',
      };

      chai.request(server)
        .post('/api/account')
        .send(data)
        .end(error => {
          if (error) return done(error);

          return chai.request(server)
            .post('/api/account')
            .send(data)
            .end((result, response) => {
              expect(response.status).to.equal(200);
              expect(response.body).to.have.a.property('status');

              expect(response.body.status).to.have.a.property('email');
              expect(response.body.status).to.have.a.property('username');
              return done();
            });
        });
    });
  });
});
