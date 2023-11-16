const test = require('uvu').test;
const assert = require('uvu/assert');
const pactum = require('pactum');
const reporter = pactum.reporter;
const mock = pactum.mock;
const request = pactum.request;
const handler = pactum.handler;

const psc = require('../src/index');

test.before(() => {
  psc.swaggerYamlPath = './tests/testObjects/emptyBasePath.yaml';
  psc.reportFile = 'emptyBasePath.json'
  reporter.add(psc);
  request.setBaseUrl('http://localhost:9393');
  handler.addInteractionHandler('get all ninjas', () => {
    return {
      request: {
        method: 'GET',
        path: '/getallninjas'
      },
      response: {
        status: 200
      }
    }
  });
  return mock.start();
});

test.after(() => {
  return mock.stop();
});

test('spec passed', async () => {
  await pactum.spec()
      .useInteraction('get all ninjas')
      .get('/getallninjas')
      .expectStatus(200);
});

test('run reporter', async () => {
  await reporter.end();
});

test('validate json reporter', async () => {
  const report = require('../reports/emptyBasePath.json');
  console.log(JSON.stringify(report, null, 2));
  assert.equal(Object.keys(report).length, 7);
  assert.equal(report.hasOwnProperty("basePath"), true)
  assert.equal(report.hasOwnProperty("coverage"), true)
  assert.equal(report.hasOwnProperty("coveredApiCount"), true)
  assert.equal(report.hasOwnProperty("missedApiCount"), true)
  assert.equal(report.hasOwnProperty("totalApiCount"), true)
  assert.equal(report.hasOwnProperty("coveredApiList"), true)
  assert.equal(report.hasOwnProperty("missedApiList"), true)
  assert.equal(report.coverage, 0.5);
  assert.equal(report.coveredApiCount, 1);
  assert.equal(report.missedApiCount, 1);
  assert.equal(report.totalApiCount, 2);
  assert.equal(report.coveredApiList.length, 1);
  assert.equal(report.missedApiList.length, 1);
  assert.equal(report.basePath, ''); // should return config basePath if not specified
});

test.run();
