# pactum-swagger-coverage

![Build](https://github.com/leelaprasadv/pactum-swagger-coverage/workflows/Build/badge.svg?branch=main)
![Downloads](https://img.shields.io/npm/dt/pactum-swagger-coverage)
![Size](https://img.shields.io/bundlephobia/minzip/pactum-swagger-coverage)
![Platform](https://img.shields.io/node/v/pactum)

JSON swagger coverage reporter for [Pactum](https://www.npmjs.com/package/pactum) tests. It's capable of reading the swagger definitions from either `swagger.yaml` or `swagger.json` (served on a http server endpoint).

## Installation

```shell
npm install --save-dev pactum pactum-swagger-coverage
```

## Usage

```javascript
const pactum = require('pactum');
const psc = require('pactum-swagger-coverage');
const reporter = pactum.reporter;

// global before block
before(() => {
  reporter.add(psc);
});

// global after block
after(() => {
  return reporter.end();
});
```

## Reporter Options

```javascript
const psc = require('pactum-swagger-coverage');

// name of the report file - defaults to "swagger-cov-report.json"
psc.file = 'report-name.json';

// folder path for the report file - defaults to "./reports"
psc.path = './reports-path';

// Swagger json url of the server - defaults to ""
psc.swaggerJsonUrl = "http://localhost:3010/api/server/v1/json";

// Swagger Yaml file path - defaults to ""
psc.swaggerYamlPath = './tests/testObjects/swagger.yaml';

```

### Report Json Output (example)
```javascript
{
  "basePath": "/api/server/v1",
  "coverage": 0.2,
  "coveredApiCount": 1,
  "missedApiCount": 4,
  "totalApiCount": 5,
  "coveredApiList": [
    "/getallninjas"
  ],
  "missedApiList": [
    "/health",
    "/getninjabyid/{id}",
    "/getninjabyname/{name}",
    "/getninjabyrank/{rank}"
  ]
}
```

> **Note**: Either 'swaggerJsonUrl' or 'swaggerYamlPath' should be provided for reporter to work.


## Notes

Read more about Pactum [here](https://www.npmjs.com/package/pactum).


Inspired by [swagger-coverage-postman](https://github.com/abelmokadem/swagger-coverage-postman).

----------------------------------------------------------------------------------------------------------------

<a href="https://github.com/ASaiAnudeep/pactum/wiki" >
  <img src="https://img.shields.io/badge/NEXT-Pactum-blue" alt="API Testing" align="right" style="display: inline;" />
</a>
