const http = require('../helpers/http');
const config = require('../config');
const yaml = require('js-yaml');
const fs = require('fs');
const { PSCConfigurationError, PSCClientError, PSCSwaggerLoadError } = require('../helpers/errors');


async function loadSwaggerYaml() {
  // Get swagger yaml document, or throw exception on error
  const swaggerYAMLPath = config.swaggerYamlPath.trim();
  if (!swaggerYAMLPath || swaggerYAMLPath === null) {
    throw new PSCConfigurationError("Swagger definition cannot be empty! Provide 'swaggerYamlPath' or 'swaggerJsonUrl'.");
  }

  try {
    const swaggerYamlDoc = fs.readFileSync(swaggerYAMLPath, 'utf8');
    return yaml.safeLoad(swaggerYamlDoc);
  } catch (err) {
    throw new PSCSwaggerLoadError(err)
  }
}

async function loadSwaggerJson() {
  let swaggerInfo = {};
  let swaggerJsonUrl = config.swaggerJsonUrl.trim();
  if (!swaggerJsonUrl || swaggerJsonUrl === null) {
    throw new PSCConfigurationError("Swagger definition cannot be empty! Provide 'swaggerYamlPath' or 'swaggerJsonUrl'.");
  }

  try {
    swaggerInfo = await http.get(swaggerJsonUrl);
    return swaggerInfo;
  } catch (error) {
    throw new PSCClientError(error);
  }
}

function getApiPaths(swaggerInfo) {
  const apiPaths = Object.keys(swaggerInfo.paths);
  apiPaths.forEach((apiPath) => { apiPath = `${swaggerInfo.basePath}${apiPath}` })
  return apiPaths
}

async function getSwaggerCoverage(testsCoveredApis) {
  const swaggerInfo = config.swaggerYamlPath ? await loadSwaggerYaml() : await loadSwaggerJson();
  const apiPaths = getApiPaths(swaggerInfo);
  const apiCovList = apiPaths.map(apiPath =>
    !!testsCoveredApis.find(({ path }) => {
      return !!regExMatchOfPath(apiPath, path);
    }));

  return {
    basePath: swaggerInfo.basePath,
    coverage: apiCovList.reduce((total, result, index, results) => result ? total + 1 / results.length : total, 0),
    coveredApiCount: apiPaths.filter((_, idx) => apiCovList[idx]).length,
    missedApiCount: apiPaths.filter((_, idx) => !apiCovList[idx]).length,
    totalApiCount: apiCovList.length,
    coveredApiList: apiPaths.filter((_, idx) => apiCovList[idx]),
    missedApiList: apiPaths.filter((_, idx) => !apiCovList[idx])
  }
}

function regExMatchOfPath(apiPath, rPath) {
  if (apiPath.includes("{")) {
    const idx = apiPath.indexOf("{");
    apiPath = apiPath.substring(0, idx);
  }
  const regex = RegExp(apiPath);
  return regex.test(rPath);
}

module.exports = {
  getSwaggerCoverage
}
