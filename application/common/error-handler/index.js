module.exports = ({ status, error }, request, response, next) => {
  response.status(status)
    .json({ error });
  next(error);
};
