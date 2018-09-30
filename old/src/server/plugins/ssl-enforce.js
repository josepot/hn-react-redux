module.exports = function sslEnforce(req, res, next) {
  return req.headers['x-forwarded-proto'] === 'http'
    ? res.redirect(`https://${req.hostname}${req.originalUrl}`)
    : next();
};
