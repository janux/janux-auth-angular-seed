'use strict';

var path = require('path');

var cfg = {
	dir: {
		src:     'src',
		bower:   'bower',
		css:     'css',
		dist:    'dist',
		img:     'img',
		lib:     'lib',
		js:      'app',
		partial: 'view',
		test:    'test'
	},
	file: {
		app: 'app.js'
	},
	fileset: {},
}; 

// the jade files to watch
cfg.fileset.jade = path.join(cfg.dir.src,'**','*.jade');

// the jade 'top-level' files that will be turned into html, excludes partials;
// relative to src folder
cfg.fileset.html = [
	path.join('**','*.jade'),
	path.join('!**',cfg.dir.partial,'*')
]

cfg.fileset.js = path.join(cfg.dir.src, cfg.dir.js, '**','*.js');

// files watched during the build
cfg.fileset.watch = [
	// path.join(cfg.dir.dist,'*.html'),
	cfg.fileset.jade,
	path.join(cfg.dir.src, cfg.dir.css,'**','*.css'),
	path.join(cfg.dir.src, cfg.dir.css,'**','*.less'),
	path.join(cfg.dir.src, cfg.dir.img,'**','*'),
	path.join(cfg.dir.dist, cfg.file.app)
]

// these are relative to the 'src' folder, and get copied to the dist folder
cfg.fileset.assets = [
	'favicon.ico',
	path.join(cfg.dir.img,'**','*.*'),
	path.join(cfg.dir.css,'font','**','*.*'),
	path.join(cfg.dir.css,'icon','**','*.*'),
	path.join('!**','*.less') 
];

// The 'target' less files that will be transformed into corresponding css files;
// included files are not in this set, and for 'watch' task we need all less files
cfg.fileset.less = [
	'typography.less',
	'util.less',
	'layout.less',
	'responsive.less'
];

// all less sources, used for 'watch' task
cfg.fileset.lessSrc = path.join(cfg.dir.src, cfg.dir.css, '*.less');

// any css libs that need to be copied to the dist/css folder
cfg.fileset.cssLibs = [
	path.join(cfg.dir.bower,'normalize.css', 'normalize.css')
];

// any javascript libs that need to be copied to dist/js
cfg.fileset.jsLibs = [
	path.join(cfg.dir.bower, 'jquery', 'dist', 'jquery.js'),
	path.join(cfg.dir.bower, 'angular', 'angular.js'),
	path.join(cfg.dir.bower, 'angular-ui-router', 'release', 'angular-ui-router.js')
];

cfg.jade = {
	debug:  false,
	pretty: true
};

cfg.jshint = {
	rcfile:   '.jshintrc',
	reporter: 'default'
}

// the connect or other server config
cfg.server = {
	root: [cfg.dir.dist],
	port: 9000,
	host: '0.0.0.0',
	open: false,
	livereload: false
};


module.exports = cfg;
