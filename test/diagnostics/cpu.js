const assert = require('assert');
const os = require('os');
import sinon from 'sinon';
const cpu = require('../../lib/diagnostics/cpu');
const ps = require('../../lib/diagnostics/ps');

const sandbox = sinon.sandbox.create();

describe('cpu', () => {
  beforeEach(() => {
    sandbox.stub(ps, 'lookupAsync').returns(Promise.resolve(['some process']));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('name', () => {
    it('returns true when a process is running', () => {
      return cpu.ps('node')
        .then((isRunning) => {
          assert.strictEqual(isRunning, true);
        });
    });

    it('returns false when a process is not running', () => {
      ps.lookupAsync.returns(Promise.resolve([]));

      return cpu.ps('gorocks')
        .then((isRunning) => {
          assert.strictEqual(isRunning, false);
        });
    });
  });

  describe('pid', () => {
    it('returns true when a process is running', () => {
      const pid = process.pid;
      return cpu.ps(pid)
        .then((isRunning) => {
          assert.strictEqual(isRunning, true);
        });
    });

    it('returns false when a process is not running', () => {
      return cpu.ps(657899)
        .then((isRunning) => {
          assert.strictEqual(isRunning, false);
        });
    });
  });

  describe('loadaverage', () => {
    beforeEach(() => {
      sandbox.stub(os, 'loadavg').returns([1.76513671875, 1.93408203125, 1.96533203125]);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('returns the 1 min load average', () => {
      return cpu.loadaverage('1m')
        .then((avg) => {
          assert.equal(avg, 1.76513671875);
        });
    });

    it('returns the 5 min load average', () => {
      return cpu.loadaverage('5m')
        .then((avg) => {
          assert.equal(avg, 1.93408203125);
        });
    });

    it('returns the 15 min load average', () => {
      return cpu.loadaverage('15m')
        .then((avg) => {
          assert.equal(avg, 1.96533203125);
        });
    });

    it('throws when an invalid load average is specified', () => {
      return cpu.loadaverage('16m')
        .catch((err) => {
          assert.equal(err.message, 'Invalid loadaverage: 16m');
        });
    });
  });
});
