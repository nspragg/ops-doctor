import assert from 'assert';
import Doctor from '../lib/ops-doctor';
import sinon from 'sinon';

const expect = Doctor.expect;

const networkDiagnostics = require('../lib/diagnostics/network');

const sandbox = sinon.sandbox.create();
const HOST = 'www.example.com';

describe('OpsDoctor', () => {
  beforeEach(() => {
    sandbox.stub(networkDiagnostics, 'ping').returns(Promise.resolve(true));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('.process', () => {
    it('returns true when a given process is found by pid', () => {
      const pid = process.pid;
      return Doctor.create()
        .process(pid, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('returns false when a given process is not found by pid', () => {
      const pid = 32768; // TODO: 1) stub 2) need to be sure it's a valid id, but not running
      return Doctor.create()
        .process(pid, expect(false))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('returns true when a given process is found by name', () => {
      const name = 'node';
      return Doctor.create()
        .process(name, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('returns false when a given process is not found by name', () => {
      const name = 'az123notrunning';
      return Doctor.create()
        .process(name, expect(false))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].ok, true);
        });
    });

    it('sets the type property to process', () => {
      const pid = process.pid;
      return Doctor.create()
        .process(pid, expect(true))
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
      const pid = process.pid;
      const name = 'node';
      return Doctor.create()
        .ping(HOST, expect(true))
        .process(pid, expect(true))
        .process(name, expect(true))
        .run()
        .then((results) => {
          assert.strictEqual(results[0].type, 'ping');
          assert.strictEqual(results[1].type, 'process');
          assert.strictEqual(results[2].type, 'process');
        });
    });
  });

  describe('.plugin', () => {
    it('adds a given plugin with no args', () => {
      function sayCool() {
        return Promise.resolve('cool');
      };

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
      };

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
});
