# ops-doctor

[![Build Status](https://travis-ci.org/nspragg/ops-doctor.svg)](https://travis-ci.org/nspragg/ops-doctor) [![Coverage Status](https://coveralls.io/repos/github/nspragg/ops-doctor/badge.svg?branch=master)](https://coveralls.io/github/nspragg/ops-doctor?branch=master)

> Moved to: https://github.com/bbc/ops-doctor
Find operational issues by running predefined diagnostics

* [Installation](#installation)
* [Features](#features)
* [Demo](#demo)
* [Usage](#usage)
* [API](#api)
* [Instance methods](#instance-methods)
* [Test](#test)
* [Contributing](#contributing)

## Installation

```
npm install --save ops-doctor
```

## Features

* Supports generic diagnostics such as process checks, ping and load average
* Support for custom diagnostics via plugins
* Simple fluent interface
* Supports promises and callbacks

## Demo

WIP

## Usage

```js
const OpsDoctor = require('ops-doctor');

OpsDoctor.create()
  .process('java', expect(true))
  .ping(someHost, expect(true))
  .loadaverage(lessThan(0.7))
  .run()
  .then(console.log);
```

#### Ping host

Check is www.example.com is alive:

```js
const OpsDoctor = require('ops-doctor');
const expect = OpsDoctor.expect;

OpsDoctor.create()
  .ping('www.example.com', expect(true))
  .run()
  .then(console.log);
```

#### Process by name

Check if Java is running

```js
const OpsDoctor = require('ops-doctor');
const expect = OpsDoctor.expect;

OpsDoctor.create()
  .process('java', expect(true))
  .run()
  .then(console.log);
```

#### Load average

Check that the load average (1m) is below 70% (single core):

```js
const OpsDoctor = require('ops-doctor');
const lessThan = OpsDoctor.lessThan;

OpsDoctor.create()
  .loadaverage('1m', lessThan(0.7))
  .run()
  .then(console.log);
```

#### Combine diagnostic checks

Check that the load average is not at capacity and that a cert exists:

```js
OpsDoctor.create()
  .loadaverage('1m', lessThan(1))
  .exists('/etc/pki/mycert.pem', expect(true))
  .run()
  .then(console.log)
```

#### Add custom diagnostics

Add a custom check:

```js
function sayCool() {
  return Promise.resolve('does something important');
}

const doctor = OpsDoctor.create();
// add custom plugin
doctor.plugin({
  'saySomething' : sayCool
});

doctor.saySomething(expect('cool'))
  .run()
  .then(console.log)
```

#### cli support
See [ops-doctor-cli](https://github.com/nspragg/ops-doctor-cli)

## API

### Static methods

### `OpsDoctor.create() -> OpsDoctor`

##### Parameters - None

##### Returns
Returns an OpsDoctor instance.

### `OpsDoctor.expect(v) -> boolean`

##### Parameters
* Any value

##### Returns
Returns a function that matches for equality against v

### `OpsDoctor.lessThan(v) -> boolean`

##### Parameters
* * Any value

##### Returns
Returns a function that asserts that a given value is less than v

## Instance methods

### `.ping(host, expect) -> OpsDoctor`

Registers a Ping check against `host`

##### Parameters
* host

##### Returns
Returns an OpsDoctor instance.

### `.process(query) -> OpsDoctor`

Registers a process check for `query`

##### Parameters
* query - either a PID or a process name

##### Returns
Returns an OpsDoctor instance.

### `.loadaverage(interval) -> OpsDoctor`

##### Parameters
* interval - 1m, 5m or 15m

##### Returns
Returns an OpsDoctor instance.

### `.exists(file, expect) -> OpsDoctor`

##### Parameters
* file - fully qualified file name

##### Returns
Returns an OpsDoctor instance.

### `.run() -> Promise`

##### Parameters - None

##### Returns
* Returns a Promise of all diagnostics checks. If the Promise fulfils, the fulfilment value is an array of diagnostics results.

## Test

```
npm test
```

To generate a test coverage report:

```
npm run coverage
```
## Contributing

* If you're unsure if a feature would make a good addition, you can always [create an issue](https://github.com/nspragg/ops-doctor/issues/new) first.
* We aim for 100% test coverage. Please write tests for any new functionality or changes.
* Any API changes should be fully documented.
* Make sure your code meets our linting standards. Run `npm run lint` to check your code.
* Maintain the existing coding style. There are some settings in `.jsbeautifyrc` to help.
* Be mindful of others when making suggestions and/or code reviewing.
