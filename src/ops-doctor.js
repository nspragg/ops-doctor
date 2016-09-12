const Promise = require('bluebird');

const cpu = require('./diagnostics/cpu');
const networkDiagnostics = require('./diagnostics/network');

function createTaskResult(type) {
  return (ok) => {
    return {
      type: type,
      ok: ok
    };
  }
}

class OpsDoctor {
  constructor() {
    this.taskQueue = [];
    this.results = [];
  }

  process(query, expect) {
    const task = () => {
      return cpu.ps(query).then(expect);
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

  request() {}

  loadaverage(expect) {
    const task = () => {
      return cpu.loadaverage().then(expect);
    };
    task.type = this.loadaverage.name;
    this.taskQueue.push(task);

    return this;
  }

  diskspace() {}

  exists() {}

  freeMemory() {}

  totalMemory() {}

  uptime() {}

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
    return new OpsDoctor();
  }

  // TODO: extract to matchers
  static lessThan(value) {
    return (actual) => {
      return actual < value;
    };
  }

  static expect(value) {
    return (actual) => {
      return actual === value;
    };
  }

  static greaterThan(value) {
    return (actual) => {
      return actual > value;
    };
  }
}

module.exports = OpsDoctor;
