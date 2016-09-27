import assert from 'assert';
import Doctor from '../lib/ops-doctor';
import sinon from 'sinon';

const cpu = require('../lib/diagnostics/cpu.js');
const disk = require('../lib/diagnostics/disk');

const expect = Doctor.expect;
const lessThan = Doctor.lessThan;
const greaterThan = Doctor.greaterThan;

const networkDiagnostics = require('../lib/diagnostics/network');

const sandbox = sinon.sandbox.create();
const HOST = 'www.example.com';
const RUNNING_PID = 12345;

describe('OpsDoctor', () => {
  beforeEach(() => {
    sandbox.stub(networkDiagnostics, 'ping').returns(Promise.resolve(true));
    sandbox.stub(cpu, 'ps').withArgs(RUNNING_PID).returns(Promise.resolve(true));
    sandbox.stub(cpu, 'loadaverage').returns(Promise.resolve(0.5));
    sandbox.stub(disk, 'usage').returns(Promise.resolve(50));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('.process', () => {
    it('returns true when a given process is found by pid', () => {
      return Doctor.create()
        .process(RUNNING_PID, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('returns false when a given process is not found by pid', () => {
      const pid = 66879;
      cpu.ps.withArgs(pid).returns(Promise.resolve(false));

      return Doctor.create()
        .process(pid, expect(false))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('returns true when a given process is found by name', () => {
      const name = 'node';
      cpu.ps.withArgs(name).returns(Promise.resolve(true));

      return Doctor.create()
        .process(name, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('returns false when a given process is not found by name', () => {
      const name = 'az123notrunning';
      cpu.ps.withArgs(name).returns(Promise.resolve(false));

      return Doctor.create()
        .process(name, expect(false))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('sets the type property to process', () => {
      return Doctor.create()
        .process(RUNNING_PID, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].type, 'process');
        });
    });
  });

  describe('.ping', () => {
    it('returns true when a host is responding', () => {
      return Doctor.create()
        .ping(HOST, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('returns false when a host is not responding', () => {
      networkDiagnostics.ping.returns(Promise.resolve(false));

      return Doctor.create()
        .ping(HOST, expect(false))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('sets the type property to ping', () => {
      return Doctor.create()
        .ping(HOST, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].type, 'ping');
        });
    });

    it('returns error when ping throws', () => {
      networkDiagnostics.ping.returns(Promise.reject(new Error('ad infinitum:)')));

      return Doctor.create()
        .ping(HOST, expect(false))
        .run()
        .catch(assert.ok);
    });
  });

  describe('.run', () => {
    it('retains execution order', () => {
      return Doctor.create()
        .ping(HOST, expect(true))
        .process(RUNNING_PID, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].type, 'ping');
          assert.strictEqual(results[1].type, 'process');
        });
    });
  });

  describe('.plugin', () => {
    it('adds a given plugin with no args', () => {
      function sayCool() {
        return Promise.resolve('cool');
      }

      return Doctor.create()
        .plugin({
          'sayCool': sayCool
        })
        .sayCool(expect('cool'))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('adds a given plugin with args', () => {
      function sayCoolWhenXandYAreEven(x, y) {
        if (x % 2 === 0 && y % 2 === 0) return Promise.resolve('cool');
        return Promise.resolve('not cool');
      }

      return Doctor.create()
        .plugin({
          'sayCool': sayCoolWhenXandYAreEven
        })
        .sayCool(2, 4, expect('cool'))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });
  });

  describe('.loadaverage', () => {
    it('returns true when the load average is less than N', () => {
      const n = 0.7;

      return Doctor.create()
        .loadaverage(lessThan(n))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('returns false when the load average not is less than N', () => {
      const n = 0.2;

      return Doctor.create()
        .loadaverage(lessThan(n))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, false);
        });
    });

    it('returns false when the load average is greater than N', () => {
      const n = 0.4;

      return Doctor.create()
        .loadaverage(greaterThan(n))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });
  });

  describe('diskspace', () => {
    it('returns the percentage of diskspace used on a given mount', () => {
      return Doctor.create()
        .diskusage('/', expect(50))
        .run()
        .then((results) => {
          assert.equal(results[0].ok, true);
        });
    });
  });
});
