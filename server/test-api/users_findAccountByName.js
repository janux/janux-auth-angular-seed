'use strict';

var 
		cfg      = require('config')
		,fs      = require('fs')
    ,log     = require('log4js').getLogger('sandbox')
    ,fmt     = require('util').format
    ,request = require('request')
		,util    = require('util')
		,uuid    = require('node-uuid')
;

// var url = cfg.base_url + '/users';
var url = cfg.base_url + '/v1/users';
var uname = 'widget';

console.log("posting to url:", url);

request.post(_jsonrpc2(url, 'findByAccountName', 'widget')
, function(err, resp, body) {
    if (err) {
        var msg = fmt("Error when searching  for user '%s'", uname);
        log.error(msg);
				log.error(util.inspect(err));
    } else {
        console.log(fmt('response: %j', body));
        // callback(null, user.uid);
    }
});

function _jsonrpc2(url, method, params, msgId) {
	msgId = msgId || uuid.v4();

	var out = {
		url: url,
		body: {
			method: method,
			params: params,
			id: msgId,
			jsonrpc: '2.0',
		},
		json: true
	};

	// out.auth = { user: 'aUser', pass: 'aPass' };

	log.trace('"method" command is %j', method, out);
	return out;
};
