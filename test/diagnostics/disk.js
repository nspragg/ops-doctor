const assert = require('assert');
const du = require('diskusage');
const sinon = require('sinon');
const disk = require('../../lib/diagnostics/disk');

const sandbox = sinon.sandbox.create();

const RESPONSE = {
  total: 2000,
  available: 1000,
  free: 1000
};

describe('disk', () => {
  beforeEach(() => {
    sandbox.stub(du, 'checkAsync').returns(Promise.resolve(RESPONSE));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns the percentage diskspace used for a given path', () => {
    return disk.usage('/')
      .then((used) => {
        assert.strictEqual(used, 50);
      });
  });
});
