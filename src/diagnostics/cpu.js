const _ = require('lodash');
const Promise = require('bluebird');
const ps = require('./ps');
const os = require('os');

const INDEXES = {
  1: 0,
  5: 1,
  15: 2
};
const AVG_REGEX = /([0-9]{0,2})m?$/;

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

function getLoadAverageInterval(loadavg) {
  const match = AVG_REGEX.exec(loadavg);
  return match[1];
}

module.exports.ps = (query) => {
  if (_.isNumber(query)) return byPid(query);

  return byName(query);
};

module.exports.loadaverage = (query = '1m') => {
  const loadavg = getLoadAverageInterval(query);
  const i = INDEXES[loadavg];
  if (_.isUndefined(i)) {
    return Promise.reject(new Error(`Invalid loadaverage: ${query}`));
  }

  return Promise.resolve(os.loadavg()[i]);
};
