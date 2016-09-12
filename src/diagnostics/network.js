const Ping = require('ping');

module.exports.ping = (host) => {
  return Ping.promise.probe(host)
    .then((reply) => {
      return reply.alive;
    });
};
