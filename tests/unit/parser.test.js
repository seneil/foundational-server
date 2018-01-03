const parseNote = require('../../application/scripts/parse-note');

let note;

describe('Тестирование парсинга пустой заметки', () => {
  beforeEach(() => {
    note = parseNote('');
  });

  it('Должно быть поле keywords с пустым массивом', () => {
    expect(note).toHaveProperty('keywords', []);
  });

  it('Должно быть поле emails с пустым массивом', () => {
    expect(note).toHaveProperty('emails', []);
  });

  it('Должно быть поле urls с пустым массивом', () => {
    expect(note).toHaveProperty('urls', []);
  });
});

describe('Проверка парсинга хештегов', () => {
  it('Должно быть поле keywords с массивом из одного хештега', () => {
    expect(parseNote('Тестовая заметка #test'))
      .toHaveProperty('keywords', ['test']);
  });

  it('Должно быть поле keywords с массивом хештегов', () => {
    expect(parseNote('Тестовая заметка #test #twitter #foo#bar #brok/en'))
      .toHaveProperty('keywords', ['test', 'twitter', 'brok']);
  });

  it('Должны быть только уникальные хештеги в поле keywords', () => {
    expect(parseNote('Тестовая заметка #test #twitter #foo#bar #twitter #brok/en #test'))
      .toHaveProperty('keywords', ['test', 'twitter', 'brok']);
  });
});

describe('Проверка парсинга емайл адресов', () => {
  it('Должно быть поле emails с массивом из одного емайла', () => {
    expect(parseNote('Тестовая заметка email@domain.com'))
      .toHaveProperty('emails', ['email@domain.com']);
  });

  it('Должно быть поле emails с массивом емайлов', () => {
    expect(parseNote('Тестовая заметка email@domain.com broken @domain.com test@test.net'))
      .toHaveProperty('emails', ['email@domain.com', 'test@test.net']);
  });

  it('Должны быть только уникальные адреса емайл в поле emails', () => {
    expect(parseNote('Тестовая заметка email@domain.com test@test.net broken @domain.com, email@domain.com broken @domain.com test@test.net'))
      .toHaveProperty('emails', ['email@domain.com', 'test@test.net']);
  });
});

describe('Проверка парсинга ссылок', () => {
  it('Должно быть парсинг адреса без http', () => {
    expect(parseNote('Тестовая заметка google.com'))
      .toHaveProperty('urls', ['http://google.com']);
  });

  it('Должно быть парсинг адреса c http', () => {
    expect(parseNote('Тестовая заметка http://amazon.com'))
      .toHaveProperty('urls', ['http://amazon.com']);
  });

  it('Должно быть парсинг нескольких адресов', () => {
    expect(parseNote('Тестовая заметка http://amazon.com google.com'))
      .toHaveProperty('urls', ['http://amazon.com', 'http://google.com']);
  });

  it('Должно быть только уникальные адреса', () => {
    expect(parseNote('Тестовая заметка http://amazon.com google.com amazon.com http://google.com'))
      .toHaveProperty('urls', ['http://amazon.com', 'http://google.com']);
  });

  it('Должно быть парсинг нескольких адресов разных зон', () => {
    expect(parseNote('Тестовая заметка amazon.com google.net ya.ru https://vk.com/ вот тут всё'))
      .toHaveProperty('urls', [
        'http://amazon.com',
        'http://google.net',
        'http://ya.ru',
        'https://vk.com/',
      ]);
  });

  it('Должно быть преобразование длинного адреса vk-wall в короткий', () => {
    expect(parseNote('Тестовая заметка https://vk.com/feed?w=wall-54530371_143755'))
      .toHaveProperty('urls', ['https://vk.com/wall-54530371_143755']);
  });

  it('Должно быть преобразование длинного адреса medium в короткий', () => {
    expect(parseNote('Тестовая заметка https://medium.com/@ddavisgraphics/programming-isnt-easy-coding-is-a1efcf97a264'))
      .toHaveProperty('urls', ['https://medium.com/@ddavisgraphics/a1efcf97a264']);
  });

  it('Должно быть преобразование адресов vk-wall и medium', () => {
    expect(parseNote(`
      Тестовая заметка
      https://medium.com/@ddavisgraphics/programming-isnt-easy-coding-is-a1efcf97a264
      https://vk.com/feed?w=wall-54530371_143755
     `))
      .toHaveProperty('urls', [
        'https://medium.com/@ddavisgraphics/a1efcf97a264',
        'https://vk.com/wall-54530371_143755',
      ]);
  });

  it('Должно быть парсинг ссылки с путями', () => {
    expect(parseNote('Тестовая заметка https://regex101.com/r/URKgLt/1'))
      .toHaveProperty('urls', ['https://regex101.com/r/URKgLt/1']);
  });

  it('Должно быть парсинг ссылки на изображение', () => {
    expect(parseNote('Тестовая заметка http://chaijs.com/img/chai-logo-small.png - картинка'))
      .toHaveProperty('urls', ['http://chaijs.com/img/chai-logo-small.png']);
  });
});
