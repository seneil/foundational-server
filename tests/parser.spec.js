const expect = require('chai').expect;
const parseNote = require('../server/scripts/parse-note');

let note;

describe('Тестирование парсинга пустой заметки', function() {
  beforeEach(function() {
    note = parseNote('');
  });

  it('Должно быть поле hashtags с пустым массивом', function() {
    expect(note).to.deep.include({ hashtags: [] });
  });

  it('Должно быть поле emails с пустым массивом', function() {
    expect(note).to.deep.include({ emails: [] });
  });

  it('Должно быть поле urls с пустым массивом', function() {
    expect(note).to.deep.include({ urls: [] });
  });

  it('Должно быть поле html с пустой строкой', function() {
    expect(note).to.include({ html: '' });
  });
});

describe('Проверка парсинга содержимого заметки', function() {
  it('Должно быть поле html с тестом заметки', function() {
    expect(parseNote('Тестовая заметка'))
      .to.include({ html: '<p>Тестовая заметка</p>' });
  });

  it('Должно быть поле html с тестом заметки с переносом строки', function() {
    expect(parseNote('Тестовая\nзаметка'))
      .to.include({ html: '<p>Тестовая<br />заметка</p>' });
  });

  it('Должно быть поле html с тестом заметки с переносом строки', function() {
    expect(parseNote('Тестовая\n\nзаметка'))
      .to.include({ html: '<p>Тестовая</p><p>заметка</p>' });
  });
});

describe('Проверка парсинга хештегов', function() {
  it('Должно быть поле hashtags с массивом из одного хештега', function() {
    expect(parseNote('Тестовая заметка #test'))
      .to.deep.include({ hashtags: ['test'] });
  });

  it('Должно быть поле hashtags с массивом хештегов', function() {
    expect(parseNote('Тестовая заметка #test #twitter #foo#bar #brok/en'))
      .to.deep.include({ hashtags: ['test', 'twitter', 'brok'] });
  });
});

describe('Проверка парсинга емайл адресов', function() {
  it('Должно быть поле emails с массивом из одного емайла', function() {
    expect(parseNote('Тестовая заметка email@domain.com'))
      .to.deep.include({ emails: ['email@domain.com'] });
  });

  it('Должно быть поле emails с массивом емайлов', function() {
    expect(parseNote('Тестовая заметка email@domain.com broken @domain.com test@test.net'))
      .to.deep.include({ emails: ['email@domain.com', 'test@test.net'] });
  });
});

describe('Проверка парсинга ссылок', function() {
  it('Должно быть парсинг адреса без http', function() {
    expect(parseNote('Тестовая заметка google.com'))
      .to.deep.include({ urls: ['http://google.com'] });
  });

  it('Должно быть парсинг адреса c http', function() {
    expect(parseNote('Тестовая заметка http://amazon.com'))
      .to.deep.include({ urls: ['http://amazon.com'] });
  });

  it('Должно быть парсинг нескольких адресов', function() {
    expect(parseNote('Тестовая заметка http://amazon.com google.com'))
      .to.deep.include({ urls: ['http://amazon.com', 'http://google.com'] });
  });

  it('Должно быть парсинг нескольких адресов разных зон', function() {
    expect(parseNote('Тестовая заметка amazon.com google.net ya.ru https://vk.com/ вот тут всё'))
      .to.deep.include({
      urls: [
        'http://amazon.com',
        'http://google.net',
        'http://ya.ru',
        'https://vk.com/',
      ],
    });
  });

  it('Должно быть преобразование длинного адреса vk-wall в короткий', function() {
    expect(parseNote('Тестовая заметка https://vk.com/feed?w=wall-54530371_143755'))
      .to.deep.include({ urls: ['https://vk.com/wall-54530371_143755'] });
  });

  it('Должно быть преобразование длинного адреса medium в короткий', function() {
    expect(parseNote('Тестовая заметка https://medium.com/@ddavisgraphics/programming-isnt-easy-coding-is-a1efcf97a264'))
      .to.deep.include({ urls: ['https://medium.com/@ddavisgraphics/a1efcf97a264'] });
  });

  it('Должно быть преобразование адресов vk-wall и medium', function() {
    expect(parseNote(`
      Тестовая заметка
      https://medium.com/@ddavisgraphics/programming-isnt-easy-coding-is-a1efcf97a264
      https://vk.com/feed?w=wall-54530371_143755
     `))
      .to.deep.include({
      urls: [
        'https://medium.com/@ddavisgraphics/a1efcf97a264',
        'https://vk.com/wall-54530371_143755',
      ],
    });
  });

  it('Должно быть парсинг ссылки с путями', function() {
    expect(parseNote('Тестовая заметка https://regex101.com/r/URKgLt/1'))
      .to.deep.include({ urls: ['https://regex101.com/r/URKgLt/1'] });
  });

  it('Должно быть парсинг ссылки на изображение', function() {
    expect(parseNote('Тестовая заметка http://chaijs.com/img/chai-logo-small.png - картинка'))
      .to.deep.include({ urls: ['http://chaijs.com/img/chai-logo-small.png'] });
  });
});

describe('Проверка парсинга всего вместе', function() {
});
