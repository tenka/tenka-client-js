'use strict';
module.exports = tenkaClient;

var request = require('request');
//tenkaClient allows developers access to tenka API, responses data is formatted  in JSON.
//options parameter is stored in an object but can be overwritten
function tenkaClient(options) {
  //Create an empty object with some default options
  var c = {};
  c.options = {
    host: 'api.tenka.io',
    https: true,
    apiToken: null
  };
  //overwriting options based on params
  for(var i in options) {
    c.options[i] = options[i]
  };
  //An HTTP Request function, which uses callbacks to handle the asynchronous network requests.
  var makeRequest = function(path, params, callback) {
    // Handle network requests for http(s)
    var proto = "https";
    if(!c.options.https) {proto = "http"};
    //default options for makeRequest
    var options = {
        host: c.options.host,
        url: `${proto}://${c.options.host}${path}`,
        qs: params,
        headers: {
         'API-Token': c.options.apiToken
        },
        json: true
    };
        //Default options are passed in as the first parameter
      request.get(options, function(err, response, body) {
          //lastRequest for better response/error handling
          var lastRequest = { url: path, code: response && response.statusCode, body: body, error: err, raw_response: response };
          c.lastRequest = lastRequest;
          //response/err handling for rate limits/calls remaining
          if(response) {
            c.callRemaing = parseInt(response.headers['api-token-calls-remaining'], 10);
            c.rateLimit = parseInt(response.headers['rate-limit-calls-left'], 10);
          };
          callback(err, lastRequest);
        });
     };
      //Methods for hitting the four API endpoints
      c.contains_lat_long = function(lat, long, c) {return makeRequest('/containing/lat-long', {lat, long}, c) };
      c.contains_zip = function(zip, c) {return makeRequest('/containing/zip', {zip: zip}, c) };
      c.nearby_zip = function(zip, radius, units, c) {return makeRequest('/nearby/zip', {zip, radius, units}, c) };
      c.tokens_remaining = function(c) {return makeRequest('/tokens-remaining', {}, c) };
    return c;
}
