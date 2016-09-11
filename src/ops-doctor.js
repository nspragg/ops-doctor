const Promise = require('bluebird');

const verifyProcess = require('./diagnostics/process');
const networkDiagnostics = require('./diagnostics/network');

function createTaskResult(type) {
  return (ok) => {
    return {
      type: type,
      ok: ok
    };
  }
}

class Doctor {
  constructor() {
    this.taskQueue = [];
    this.results = [];
  }

  process(query, expect) {
    const task = () => {
      return verifyProcess(query)
        .then(expect);
    };
    task.type = this.process.name;
    this.taskQueue.push(task);

    return this;
  }

  ping(host, expect) {
    const task = () => {
      return networkDiagnostics.ping(host).then(expect);
    };
    task.type = this.ping.name;
    this.taskQueue.push(task);

    return this;
  }

  request() {

  }

  loadaverage() {

  }

  diskspace() {

  }

  exists() {

  }

  freeMemory() {

  }

  totalMemory() {

  }

  uptime() {

  }

  plugin(plugin) {
    const method = Object.keys(plugin).pop();
    this[method] = (...args) => {
      const task = () => {
        const expect = args.pop();
        return plugin[method](...args).then(expect);
      };
      task.type = method;
      this.taskQueue.push(task);

      return this;
    };

    return this;
  }

  _startTasks() {
    return this.taskQueue.map((fn) => {
      return Promise.resolve({
        type: fn.type,
        fn: fn()
      });
    });
  }

  run() {
    const pending = this._startTasks();

    return Promise.all(pending)
      .map((task) => {
        return task.fn.then(createTaskResult(task.type));
      });
  }

  static create() {
    return new Doctor();
  }

  static expect(value) {
    return (actual) => {
      return actual === value;
    };
  }
}

module.exports = Doctor;
