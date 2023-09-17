const test = require('uvu').test;
const assert = require('uvu/assert');
const pactum = require('pactum');
const reporter = pactum.reporter;
const mock = pactum.mock;
const request = pactum.request;
const handler = pactum.handler;

const psc = require('../src/index');

test.before(() => {
  psc.swaggerYamlPath = './tests/testObjects/openapi3.yaml';
  psc.basePath = '/api/server/v2'
  psc.reportFile = 'report-openapi3.json'
  reporter.add(psc);
  request.setBaseUrl('http://localhost:9393');
  handler.addInteractionHandler('get all ninjas', () => {
    return {
      request: {
        method: 'GET',
        path: '/api/server/v2/getallninjas'
      },
      response: {
        status: 200
      }
    }
  });
  handler.addInteractionHandler('get ninjas by rank', (ctx) => {
    return {
      request: {
        method: 'GET',
        path: `/api/server/v2/getninjas/${ctx.data}`
      },
      response: {
        status: 200
      }
    }
  });
  handler.addInteractionHandler('get ninja by rank and name', (ctx) => {
    return {
      request: {
        method: 'GET',
        path: `/api/server/v2/getninja/${ctx.data.rank}/${ctx.data.name}`
      },
      response: {
        status: 200
      }
    }
  });

  handler.addInteractionHandler('get health', () => {
    return {
      request: {
        method: 'GET',
        path: `/api/server/v2/health`
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
    .get('/api/server/v2/getallninjas')
    .expectStatus(200);
});

test('spec passed - additional path params', async () => {
  await pactum.spec()
    .useInteraction('get ninjas by rank', "jounin")
    .get('/api/server/v2/getninjas/jounin')
    .expectStatus(200);
});

test('spec passed - no path params', async () => {
  await pactum.spec()
    .useInteraction('get health')
    .get('/api/server/v2/health')
    .expectStatus(200);
});

test('spec passed - different api path with path params', async () => {
  await pactum.spec()
    .useInteraction('get ninja by rank and name', {rank: "jounin", name: "kakashi"})
    .get('/api/server/v2/getninja/jounin/kakashi')
    .expectStatus(200);
});

test('spec failed', async () => {
  try {
    await pactum.spec()
      .get('/api/server/v2/getallninjas')
      .expectStatus(200);
  } catch (error) {
    console.log(error);
  }
});

test('run reporter', async () => {
  await reporter.end();
});

test('validate json reporter', async () => {
  const report = require('../reports/report-openapi3.json');
  console.log(JSON.stringify(report, null, 2));
  assert.equal(Object.keys(report).length, 7);
  assert.equal(report.hasOwnProperty("basePath"), true)
  assert.equal(report.hasOwnProperty("coverage"), true)
  assert.equal(report.hasOwnProperty("coveredApiCount"), true)
  assert.equal(report.hasOwnProperty("missedApiCount"), true)
  assert.equal(report.hasOwnProperty("totalApiCount"), true)
  assert.equal(report.hasOwnProperty("coveredApiList"), true)
  assert.equal(report.hasOwnProperty("missedApiList"), true)
  assert.equal(report.coverage, 0.57);
  assert.equal(report.coveredApiCount, 4);
  assert.equal(report.missedApiCount, 3);
  assert.equal(report.totalApiCount, 7);
  assert.equal(report.coveredApiList.length, 4);
  assert.equal(report.missedApiList.length, 3);
});

test.run();
