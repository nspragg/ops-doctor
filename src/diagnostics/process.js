const _ = require('lodash');
const Promise = require('bluebird');
const ps = Promise.promisifyAll(require('ps-node'));

function byPid(pid) {
  try {
    return Promise.resolve(process.kill(pid, 0));
  } catch (e) {
    return Promise.resolve(false);
  }
}

function byName(query) {
  return ps
    .lookupAsync({
      command: query,
      psargs: 'ux'
    })
    .then((processList) => {
      return processList.length > 0;
    });
}

module.exports = (query) => {
  if (_.isNumber(query)) return byPid(query);

  return byName(query);
};
