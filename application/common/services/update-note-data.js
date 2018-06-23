const mongoose = require('mongoose');
const application = require('requirefrom')('application');

const { tagSchema, emailSchema, attachmentSchema } = application('schemas');

const Tag = mongoose.model('Tag', tagSchema);
const Email = mongoose.model('Email', emailSchema);
const Attachment = mongoose.model('Attachment', attachmentSchema);

module.exports = (note, data) => {
  const keywords = data.keywords
    .reduce((list, keyword) => {
      const titles = list.map(item => item.title);

      if (!titles.includes(keyword)) {
        list.push(new Tag({ title: keyword }));
      }

      return list;
    }, note.keywords)
    .filter(keyword => data.keywords.includes(keyword.title));

  const emails = data.emails
    .reduce((list, email) => {
      const titles = list.map(item => item.email);

      if (!titles.includes(email)) {
        list.push(new Email({ email }));
      }

      return list;
    }, note.emails)
    .filter(email => data.emails.includes(email.email));

  const attachments = data.urls
    .reduce((list, attachment) => {
      const url = attachment.replace(/\/$/, '');
      const titles = list.map(item => item.url);

      if (!titles.includes(url)) {
        list.push(new Attachment({ url }));
      }

      return list;
    }, note.attachments)
    .filter(url => data.urls.includes(url.url));

  return { keywords, emails, attachments };
};
