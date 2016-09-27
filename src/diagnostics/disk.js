const Promise = require('bluebird');
const du = Promise.promisifyAll(require('diskusage'));

module.exports.usage = (path) => {
  return du.checkAsync(path)
    .then((info) => {
      return info.available / info.total * 100;
    });
};
