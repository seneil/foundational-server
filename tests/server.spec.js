const mongoose = require('mongoose');
const shortID = require('mongodb-short-id');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const nock = require('nock');

const mockDocument = require('./mock.document');
const mockDummyDocument = require('./mock.dummy.document');

const server = require('../server');

const noteSchema = require('../server/schemas/note-schema');
const openGraphSchema = require('../server/schemas/opengraph-schema');

const Note = mongoose.model('Note', noteSchema);
const OpenGraph = mongoose.model('OpenGraph', openGraphSchema);

chai.use(chaiHttp);

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
    Note.remove({}, noteError => {
      OpenGraph.remove({}, openGraphError => {
        done(openGraphError || noteError);
      });
    });
  });

  describe('/GET notes', function() {
    it('Должен возвращаться пустой список заметок', function(done) {
      chai.request(server)
        .get('/api/notes')
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.be.an('object');
          expect(response.body).to.deep.equal({ notes: [], count: 0 });
          done();
        });
    });
  });

  describe('/GET note/:noteName', function() {
    it('Должна вернуться ошибка ненайденной заметки', function(done) {
      chai.request(server)
        .get(`/api/notes/note404`)
        .end((error, response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.be.an('object');
          expect(response.body).to.have.a.property('error');
          expect(response.body).to.deep.equal({ error: true });
          done();
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
        if (error) done(error);

        chai.request(server)
          .get(`/api/notes/${note.name}`)
          .end((error, response) => {
            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('object');
            expect(response.body.note).to.have.a.property('body');
            expect(response.body.note.body).to.equal(text);
            expect(response.body.note.attachments.length)
              .to.equal(1);
            expect(response.body.note.attachments[0].url)
              .to.equal('http://chaijs.com/api/bdd/');
            done();
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
          expect(response.status).to.equal(200);
          expect(response.body).to.be.an('object');
          expect(response.body.note).to.have.a.property('body');
          expect(response.body.note.body).to.equal(text);
          expect(response.body.note.attachments.length)
            .to.equal(1);
          expect(response.body.note.attachments[0].url)
            .to.equal('https://mlab.com/databases/note-keeper#collections');
          done();
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

          chai.request(server)
            .get(`/api/notes/${response.body.note.name}`)
            .end((getError, getResponse) => {
              expect(getResponse.status).to.equal(200);
              expect(getResponse.body.note.attachments.length)
                .to.equal(1);
              expect(getResponse.body.note.attachments[0].opengraph.title)
                .to.equal('OpenGraph Title: Scratched document');
              done();
            });
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

          chai.request(server)
            .get(`/api/notes/${response.body.note.name}`)
            .end((getError, getResponse) => {
              expect(getResponse.status).to.equal(200);
              expect(getResponse.body.note.attachments.length)
                .to.equal(1);
              expect(getResponse.body.note.attachments[0].opengraph.title)
                .to.equal('');
              expect(getResponse.body.note.attachments[0].opengraph.html)
                .to.equal('<p></p>');
              done();
            });
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

          chai.request(server)
            .get(`/api/notes/${response.body.note.name}`)
            .end((getError, getResponse) => {
              expect(getResponse.status).to.equal(200);
              expect(getResponse.body.note.attachments.length)
                .to.equal(2);
              expect(getResponse.body.note.attachments[0].opengraph.title)
                .to.equal('OpenGraph Title: Scratched document');
              expect(getResponse.body.note.attachments[1].opengraph.title)
                .to.equal('OpenGraph Title: Google template title');
              done();
            });
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
            .get(`/api/notes/${response.body.note.name}`)
            .end((getError, getResponse) => {
              expect(getResponse.status).to.equal(200);
              expect(getResponse.body.note.attachments.length)
                .to.equal(1);
              expect(getResponse.body.note.attachments[0].opengraph.type)
                .to.equal('image');
              expect(getResponse.body.note.attachments[0].opengraph.image)
                .to.equal('http://example.com/images/example.png');
              done();
            });
        });
    });
  });
});
