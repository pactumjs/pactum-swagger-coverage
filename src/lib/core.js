const http = require('../helpers/http');
const config = require('../config');
const yaml = require('js-yaml');
const fs = require('fs');
const { PSCConfigurationError, PSCClientError, PSCSwaggerLoadError } = require('../helpers/errors');

/**
 * Function to Load the Swagger Yaml file
 * @returns {Object} Swagger file object
 */
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

/**
 * Function to load the swagger Json file
 * @returns {Object} Swagger file object
 */
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

/**
 * Fuction to all get api path's from swagger file
 * @param {Object} swaggerInfo 
 * @returns {Array} Array of API paths
 */
function getApiPaths(swaggerInfo) {
  const apiPaths = Object.keys(swaggerInfo.paths);
  apiPaths.forEach((apiPath, index) => apiPaths[index] = `${swaggerInfo.basePath}${apiPath}`);
  return apiPaths;
}

/**
 * Function to get swagger coverage stats
 * @param {Array} testsCoveredApis 
 * @returns {object} Swagger coverage stats
 */
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

/**
 * Function to RegEx match api paths
 * @param {String} apiPath 
 * @param {String} rPath 
 * @returns {Boolean} Match result
 */
function regExMatchOfPath(apiPath, rPath) {
  const regex = RegExp(apiPath.replace(/{[^\/]+}/g,'.*'));
  const extractedApiPath = rPath.match(regex);
  const extractedPathSepCount = (extractedApiPath ? extractedApiPath[0].match(/\//g) : []).length;
  const apiPathSepCount = (apiPath.match(/\//g) || []).length;
  return regex.test(rPath) && (extractedPathSepCount === apiPathSepCount);
}

module.exports = {
  getSwaggerCoverage
}
