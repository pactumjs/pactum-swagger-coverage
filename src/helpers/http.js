const phin = require('phin');
const { PSCClientError } = require('./errors.js');

async function get(url) {
  const res = await phin({
    url,
    method: 'GET',
    parse: 'json'
  });
  if (res.statusCode === 200) {
    return res.body;
  }
  throw new PSCClientError(res.body.toString());
}

module.exports = {
  get
}
