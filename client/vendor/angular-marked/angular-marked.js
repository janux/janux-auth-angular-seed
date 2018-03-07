/*
 * angular-marked
 * (c) 2014 - 2016 J. Harshbarger
 * Licensed MIT
 */

// From strip-indent
var unindent = function(text) {
	if (!text) {
		return text;
	}

	var lines = text
		.replace(/\t/g, '  ')
		.split(/\r?\n/);

	var min = null;
	var len = lines.length;
	var i;

	for (i = 0; i < len; i++) {
		var line = lines[i];
		var l = line.match(/^(\s*)/)[0].length;
		if (l === line.length) {
			continue;
		}
		min = (l < min || min === null) ? l : min;
	}

	if (min !== null && min > 0) {
		for (i = 0; i < len; i++) {
			lines[i] = lines[i].substr(min);
		}
	}
	return lines.join('\n');
};

(function () {
	'use strict';

	function isUndefinedOrNull(val) {
		return angular.isUndefined(val) || val === null;
	}

	function requireMarked() {
		try {
			return require('marked'); // Using nw.js or browserify?
		} catch (e) {
			throw new Error('Please install marked via npm.');
		}
	}

	function angularMarked(angular, marked) {

		if(typeof marked === 'undefined') {
			if(typeof require === 'function') {
				marked = requireMarked();
			}else{
				throw new Error('Marked cannot be found by angular-marked!');
			}
		}

		angular.module('hc.marked', [])

			/**
			 * @ngdoc object
			 * @name angularMarked.object:marked
			 *
			 * @description
			 * marked global (as provided by the marked.js library)
			 */
			.constant('marked', marked)

			/**
			 * @ngdoc directive
			 * @name angularMarked.directive:amTimeAgo
			 * @module angularMarked
			 *
			 * @restrict A
			 */
			.directive('marked', ['marked', '$templateRequest', '$compile' , function (marked, $templateRequest, $compile) {
				return {
					restrict: 'AE',
					replace: true,
					scope: {
						opts: '=',
						marked: '=',
						compile: '@',
						src: '='
					},
					link: function (scope, element, attrs) {
						if (attrs.marked) {
							set(scope.marked);
							scope.$watch('marked', set);
						} else if (attrs.src) {
							scope.$watch('src', function (src) {
								$templateRequest(src, true).then(function (response) {
									set(response);
								}, function () {
									set('');
									scope.$emit('$markedIncludeError', attrs.src);
								});
							});
						} else {
							set(element.text());
						}

						function set(text) {
							text = unindent(String(text || ''));
							element.html(marked(text, scope.opts || null));
							if (scope.$eval(attrs.compile)) {
								$compile(element.contents())(scope.$parent);
							}
						}
					}
				};
			}])

			.provider('marked', function markedProvider() {
				var self = this;

				/**
				 * @ngdoc method
				 * @name markedProvider#setRenderer
				 * @methodOf hc.marked.service:markedProvider
				 *
				 * @param {object} opts Default renderer options for [marked](https://github.com/chjj/marked#overriding-renderer-methods).
				 */

				self.setRenderer = function (opts) {
					this.renderer = opts;
				};

				/**
				 * @ngdoc method
				 * @name markedProvider#setOptions
				 * @methodOf hc.marked.service:markedProvider
				 *
				 * @param {object} opts Default options for [marked](https://github.com/chjj/marked#options-1).
				 */

				self.setOptions = function (opts) {  // Store options for later
					this.defaults = opts;
				};

				self.$get = ['$log', '$window', function ($log, $window) {
					var m;

					try {
						m = require('marked');
					} catch (err) {
						m = $window.marked || marked;
					}

					if (angular.isUndefined(m)) {
						$log.error('angular-marked Error: marked not loaded.  See installation instructions.');
						return;
					}

					var r = new m.Renderer();

					// override rendered markdown html
					// with custom definitions if defined
					if (self.renderer) {
						var o = Object.keys(self.renderer);
						var l = o.length;

						while (l--) {
							r[o[l]] = self.renderer[o[l]];
						}
					}

					// Customize code and codespan rendering to wrap default or overriden output in a ng-non-bindable span
					function wrapNonBindable(string) {
						return '<span ng-non-bindable>' + string + '</span>';
					}

					var renderCode = r.code.bind(r);
					r.code = function (code, lang, escaped) {
						return wrapNonBindable(renderCode(code, lang, escaped));
					};
					var renderCodespan = r.codespan.bind(r);
					r.codespan = function (code) {
						return wrapNonBindable(renderCodespan(code));
					};

					// add the new renderer to the options if need be
					self.defaults = self.defaults || {};
					self.defaults.renderer = r;

					m.setOptions(self.defaults);

					return m;
				}];
			});

		return 'angularMarked';
	}

	var isElectron = window && window.process && window.process.type;
	if (typeof define === 'function' && define.amd) {
		define(['angular', 'marked'], angularMarked);
	} else if (typeof module !== 'undefined' && module && module.exports && (typeof require === 'function') && !isElectron) {
		module.exports = angularMarked(require('angular'), require('marked'));
	} else {
		angularMarked(angular, (typeof global !== 'undefined' && typeof global.marked !== 'undefined' ? global : window).marked);
	}
})();
