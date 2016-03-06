module.exports = {
	appenders: [
		{ 
			type: 'file',
			filename: 'server.log',
			layout : {
				type : 'pattern',
				pattern : '%d | %p | %c | %m'
			}
		},
		{
			type:'logLevelFilter',
			level: 'INFO',
			appender: {
				type: 'console',
				layout: {
					type: 'pattern',
					pattern: '%[%d | %p | %c |%] %m'
				}
			}
		}
	],
	replaceConsole : false
	,levels: {
		'AppContext': 'DEBUG',
		'Server':     'DEBUG'
	}
}
