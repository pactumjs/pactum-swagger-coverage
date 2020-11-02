const fs = require('fs');
const path = require('path');
const config = require('./config');
const core = require('./lib/core');

const testsCoveredApis = [];

const psc = {

  name: config.name,
  reportPath: config.path,
  file: config.file,
  swaggerJsonUrl: config.swaggerJsonUrl,
  swaggerYamlPath: config.swaggerYamlPath,

  afterSpec(spec) {
    const _specApiPath = {}
    _specApiPath.path = spec.request.path;
    _specApiPath.method = spec.request.method;
    testsCoveredApis.push(_specApiPath);
  },

  afterStep(step) { },

  afterTest(test) { },

  async end() {
    config.swaggerJsonUrl = this.swaggerJsonUrl;
    config.swaggerYamlPath = this.swaggerYamlPath;
    const coverage = await core.getSwaggerCoverage(testsCoveredApis)

    if (!fs.existsSync(this.reportPath)) {
      fs.mkdirSync(this.reportPath, { recursive: true });
    }

    fs.writeFileSync(path.resolve(this.reportPath, this.file), JSON.stringify(coverage, null, 2));

  },

  reset() {
    testsCoveredApis.length = 0;
  }

}

module.exports = psc;
