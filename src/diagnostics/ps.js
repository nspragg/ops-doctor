const Promise = require('bluebird');
const ps = Promise.promisifyAll(require('ps-node'));

module.exports = ps;
