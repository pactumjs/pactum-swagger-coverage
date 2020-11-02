const test = require('uvu').test;
const assert = require('uvu/assert');
const pactum = require('pactum');
const reporter = pactum.reporter;
const mock = pactum.mock;
const request = pactum.request;
const handler = pactum.handler;

const psc = require('../src/index');

test.before(() => {
  psc.swaggerYamlPath = './tests/testObjects/swagger.yaml';
  psc.file = 'report.json'
  reporter.add(psc);
  request.setBaseUrl('http://localhost:9393');
  handler.addMockInteractionHandler('get ninjas', () => {
    return {
      withRequest: {
        method: 'GET',
        path: '/api/server/v1/getallninjas'
      },
      willRespondWith: {
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
    .useMockInteraction('get ninjas')
    .get('/api/server/v1/getallninjas')
    .expectStatus(200);
});

test('spec failed', async () => {
  try {
    await pactum.spec()
      .get('/api/server/v1/getallninjas')
      .expectStatus(200);
  } catch (error) {
    console.log(error);
  }
});

test('spec error', async () => {
  try {
    await pactum.spec()
      .get('http://localhost:9001/api/user')
      .expectStatus(200);
  } catch (error) {
    console.log(error);
  }
});

test('run reporter', async () => {
  await reporter.end();
});

test('validate json reporter', async () => {
  const report = require('../reports/report.json');
  console.log(JSON.stringify(report, null, 2));
  assert.equal(Object.keys(report).length, 7);
  assert.equal(report.hasOwnProperty("basePath"), true)
  assert.equal(report.hasOwnProperty("coverage"), true)
  assert.equal(report.hasOwnProperty("coveredApiCount"), true)
  assert.equal(report.hasOwnProperty("missedApiCount"), true)
  assert.equal(report.hasOwnProperty("totalApiCount"), true)
  assert.equal(report.hasOwnProperty("coveredApiList"), true)
  assert.equal(report.hasOwnProperty("missedApiList"), true)
  assert.equal(report.coverage, 0.2);
  assert.equal(report.coveredApiCount, 1);
  assert.equal(report.missedApiCount, 4);
  assert.equal(report.totalApiCount, 5);
  assert.equal(report.coveredApiList.length, 1);
  assert.equal(report.missedApiList.length, 4);
});

test.run();
