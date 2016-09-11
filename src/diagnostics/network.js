const Ping = require('ping');

module.exports.ping = (host, cb) => {
  return Ping.promise.probe(host)
    .then((reply) => {
      return reply.alive;
    });
};
