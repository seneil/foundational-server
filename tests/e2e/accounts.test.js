const mongoose = require('mongoose');
const request = require('supertest');

const { OK, NO_VALIDATE, NOT_FOUND, UNAUTHORIZED } = require('../../application/router/constants/answer-codes');

let db;
let application;

const getCredentials = () => ({
  username: `test${+new Date()}`,
  email: `test${+new Date()}@example.ru`,
  password: '-=test-password=-',
});

const signupAccount = (credentials = getCredentials()) =>
  request(application)
    .post('/api/v1/profile/signup')
    .send(credentials)
    .expect(200);

describe.skip('Управление аккаунтами', () => {
  beforeAll(() => {
    db = mongoose.connection;
    application = require('../../application/index');
  });

  afterAll(done => {
    db.close();
    application.close(done);
  });

  it('POST /profile/signup', done => {
    signupAccount()
      .then(response => {
        const { body: { status, result } } = response;

        expect(status).toBe(OK);
        expect(result).toHaveProperty('token');
        done();
      });
  });

  it('POST /profile/signup dublicate data', done => {
    const credentials = {
      username: `test${+new Date()}`,
      email: `test${+new Date()}@example.ru`,
      password: '-=test-password=-',
    };

    signupAccount(credentials)
      .then(response => {
        const { body } = response;

        expect(body.status).toBe(OK);

        signupAccount(credentials)
          .then(response2 => {
            const { body: { status } } = response2;

            expect(status).toBe(NO_VALIDATE);
            done();
          });
      });
  });

  it('POST /profile/signup wrong form', done => {
    request(application)
      .post('/api/v1/profile/signup')
      .send({
        username: 'dshster',
      })
      .expect(200)
      .then(response => {
        const { body: { status } } = response;

        expect(status).toBe(NO_VALIDATE);
        done();
      });
  });

  it('POST /profile Wrong token', done => {
    request(application)
      .get('/api/v1/profile')
      .set('Authorization', 'Bearer Wrong.token')
      .expect(401)
      .then(response => {
        const { text } = response;

        expect(text).toBe(UNAUTHORIZED);
        done();
      });
  });

  it('POST /profile', done => {
    const credentials = {
      username: `test${+new Date()}`,
      email: `test${+new Date()}@example.ru`,
      password: '-=test-password=-',
    };

    signupAccount(credentials)
      .then(response => {
        const { body } = response;

        expect(body.status).toBe(OK);

        request(application)
          .get('/api/v1/profile')
          .set('Authorization', `Bearer ${body.result.token}`)
          .expect(200)
          .then(response2 => {
            const { body: { status, result } } = response2;

            expect(status).toBe(OK);
            expect(result).toHaveProperty('username', credentials.username);
            expect(result).toHaveProperty('email', credentials.email);
            expect(result).toHaveProperty('privilege', 'manager');
            done();
          });
      });
  });

  it('POST /profile/login', done => {
    const credentials = {
      username: `test${+new Date()}`,
      email: `test${+new Date()}@example.ru`,
      password: '-=test-password=-',
    };

    signupAccount(credentials)
      .then(response => {
        const { body } = response;

        expect(body.status).toBe(OK);

        request(application)
          .post('/api/v1/profile/login')
          .send({
            email: credentials.email,
            password: credentials.password,
          })
          .expect(200)
          .then(response2 => {
            const { body: { status, result } } = response2;

            expect(status).toBe(OK);
            expect(result).toHaveProperty('token');
            done();
          });
      });
  });

  it('POST /profile/login wrong form data', done => {
    signupAccount()
      .then(response => {
        const { body } = response;

        expect(body.status).toBe(OK);

        request(application)
          .post('/api/v1/profile/login')
          .send({
            email: 'wrong-email@example.ru',
            password: '-=wrong-password=-',
          })
          .expect(200)
          .then(response2 => {
            const { body: { status } } = response2;

            expect(status).toBe(NOT_FOUND);
            done();
          });
      });
  });

  it('POST /profile/login empty form data', done => {
    signupAccount()
      .then(response => {
        const { body } = response;

        expect(body.status).toBe(OK);

        request(application)
          .post('/api/v1/profile/login')
          .send({
            email: '',
            password: '',
          })
          .expect(200)
          .then(response2 => {
            const { body: { status } } = response2;

            expect(status).toBe(NO_VALIDATE);
            done();
          });
      });
  });

  it('POST /profile/login without registration', done => {
    request(application)
      .post('/api/v1/profile/login')
      .send({
        email: 'anything@example.ru',
        password: '-=anything-password=-',
      })
      .expect(200)
      .then(response2 => {
        const { body: { status } } = response2;

        expect(status).toBe(NOT_FOUND);
        done();
      });
  });
});
