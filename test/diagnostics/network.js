const _ = require('lodash');
const assert = require('assert');
import sinon from 'sinon';
const network = require('../../lib/diagnostics/network');
const Ping = require('ping');

const sandbox = sinon.sandbox.create();
const HOST = 'www.example.com';

const ALIVE = {
  host: HOST,
  alive: true,
  output: 'diagnostics',
  time: Date.now(),
};

describe('network', () => {
  beforeEach(() => {
    sandbox.stub(Ping.promise, 'probe').returns(Promise.resolve(ALIVE));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns true when a host is alive', () => {
    return network.ping(HOST)
      .then((alive) => {
        assert.strictEqual(alive, true);
      });
  });

  it('returns false when a host is not responding', () => {
    const reply = _.clone(ALIVE);
    reply.alive = false;
    Ping.promise.probe.returns(Promise.resolve(reply));

    return network.ping(HOST)
      .then((alive) => {
        assert.strictEqual(alive, false);
      });
  });
});
