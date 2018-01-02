const mongoose = require('mongoose');
const nock = require('nock');
const request = require('supertest');
const mockDocument = require('./mock.document');
const mockDummyDocument = require('./mock.dummy.document');

const { OK, NOT_FOUND } = require('../../application/router/constants/answer-codes');

let db;
let token;
let application;

const getCredentials = () => ({
  username: `test${+new Date()}`,
  email: `test${+new Date()}@example.ru`,
  password: '-=test-password=-',
});

const signupAccount = (credentials = getCredentials()) =>
  request(application)
    .post('/api/v1/signup')
    .send(credentials)
    .expect(200);

describe('Запросы к серверу', () => {
  beforeAll(done => {
    db = mongoose.connection;
    application = require('../../application/index');

    signupAccount()
      .then(response => {
        const { body: { status, result } } = response;

        expect(status).toBe(OK);
        token = result.token;
        done();
      });
  });

  afterAll(done => {
    db.close();
    application.close(done);
  });

  beforeEach(done => {
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

    db.collections.notes.remove(done);
  });

  describe('GET /notes', () => {
    it('Должен возвращаться пустой список заметок', done => {
      request(application)
        .get('/api/v1/notes')
        .expect(200)
        .then(response => {
          const { body: { status, result } } = response;

          expect(status).toBe(OK);
          expect(result).toHaveProperty('notes', []);
          done();
        });
    });
  });

  describe('GET /keywords', () => {
    it('Должен вернуться пустой список ключевых слов', done => {
      request(application)
        .get('/api/v1/keywords')
        .expect(200)
        .then(response => {
          const { body: { status, result } } = response;

          expect(status).toBe(OK);
          expect(result).toHaveProperty('keywords', []);
          done();
        });
    });

    it('Должен вернуться список ключевых слов', done => {
      const text = `This domain is established to be used for illustrative examples in documents.
        
        #mlab #development`;

      request(application)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ body: text })
        .expect(200)
        .then(() => {
          request(application)
            .get('/api/v1/keywords')
            .expect(200)
            .then(response => {
              const { body: { status, result } } = response;

              expect(status).toBe(OK);
              expect(result).toHaveProperty('keywords', ['development', 'mlab']);
              done();
            });
        });
    });

    it('Должна вернуться заметка по ключевому слову', done => {
      const text = `This domain is established to be used for illustrative examples in documents.
        
        #mlab #development`;

      request(application)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ body: text })
        .expect(200)
        .then(() => {
          request(application)
            .get('/api/v1/keywords/development')
            .expect(200)
            .then(response => {
              const { body: { status, result } } = response;
              const { notes } = result;

              expect(status).toBe(OK);
              expect(notes.length).toBe(1);
              done();
            });
        });
    });

    it('Должна вернуться ошибка отсутствия заметок', done => {
      request(application)
        .get('/api/v1/keywords/not-found')
        .expect(200)
        .then(response => {
          const { body: { status } } = response;

          expect(status).toBe(NOT_FOUND);
          done();
        });
    });
  });

  describe('GET /note/:noteName', () => {
    it('Должна вернуться ошибка ненайденной заметки', done => {
      request(application)
        .get('/api/v1/notes/not-found')
        .expect(200)
        .then(response => {
          const { body: { status } } = response;

          expect(status).toBe(NOT_FOUND);
          done();
        });
    });
  });

  describe('POST /note', () => {
    it('Должна быть сохранена и вернуться оформленная заметка', done => {
      const text = `This domain is established to be used for illustrative examples in documents.
        You may use this domain in examples without prior coordination or asking for permission.
        http://example.com/
        
        #mlab #development`;

      request(application)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ body: text })
        .expect(200)
        .then(response => {
          const { body: { status, result } } = response;
          const { attachments, keywords } = result;

          expect(status).toBe(OK);
          expect(result).toHaveProperty('type', 'article');
          expect(attachments[0].url).toBe('http://example.com');
          expect(keywords[0].title).toBe('mlab');
          expect(keywords[1].title).toBe('development');
          done();
        });
    });

    it('Должна вернуться оформленная заметка c вложением сайтом', done => {
      const text = `This domain is established to be used for illustrative examples in documents.
        You may use this domain in examples without prior coordination or asking for permission.
        
        http://example.com/`;

      request(application)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ body: text })
        .expect(200)
        .then(response => {
          const { body } = response;

          expect(body.status).toBe(OK);

          setTimeout(() => {
            request(application)
              .get(`/api/v1/notes/${body.result.name}`)
              .expect(200)
              .then(response2 => {
                const { body: { status, result } } = response2;
                const { attachments } = result;

                expect(status).toBe(OK);
                expect(attachments[0]).toHaveProperty('title', 'Scratched document');
                expect(attachments[0]).toHaveProperty('ogTitle', 'OpenGraph Title: Scratched document');
                expect(attachments[0]).toHaveProperty('ogDescription', 'OpenGraph Description');
                expect(attachments[0]).toHaveProperty('image', 'http://example.com/images/example.png');
                done();
              });
          }, 1000);
        });
    });

    it('Должна вернуться оформленная заметка c вложением картинкой', done => {
      const text = `This domain is established to be used for illustrative examples in documents.
        You may use this domain in examples without prior coordination or asking for permission.
        
        http://example.com/images/example.png`;

      request(application)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ body: text })
        .expect(200)
        .then(response => {
          const { body } = response;

          expect(body.status).toBe(OK);

          setTimeout(() => {
            request(application)
              .get(`/api/v1/notes/${body.result.name}`)
              .expect(200)
              .then(response2 => {
                const { body: { status, result } } = response2;
                const { attachments } = result;

                expect(status).toBe(OK);
                expect(attachments[0]).toHaveProperty('type', 'image');
                expect(attachments[0]).toHaveProperty('image', 'http://example.com/images/example.png');
                done();
              });
          }, 1000);
        });
    });
  });

  describe('DELETE /note', () => {
    it('Должна быть ошибка удаления при неизвестном имени', done => {
      request(application)
        .delete('/api/v1/notes/not-found')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then(response2 => {
          const { body: { status } } = response2;

          expect(status).toBe(NOT_FOUND);
          done();
        });
    });

    it('Должна удалиться заметка по переданному имени', done => {
      const text = 'This domain is established to be used for illustrative examples in documents.';

      request(application)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ body: text })
        .expect(200)
        .then(response => {
          const { body } = response;

          expect(body.status).toBe(OK);

          setTimeout(() => {
            request(application)
              .delete(`/api/v1/notes/${body.result.name}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(200)
              .then(response2 => {
                const { body: { status } } = response2;

                expect(status).toBe(OK);
                done();
              });
          }, 1000);
        });
    });
  });
});
