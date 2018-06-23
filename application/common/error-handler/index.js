module.exports = ({ error }, request, response, next) => {
  response.status(200)
    .json(error);
  next(error);
};
