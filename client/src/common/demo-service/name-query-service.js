'use strict';
var _ = require('lodash');

/**
 * This service help the create a common filter name.
 */

module.exports =
	['partyService',
		function (partyService) {

			var service = {

				createFilterForStaff: function (query) {
					return function filterFn(resource) {
						var person = resource.resource;
						var name = (person.name.last + ' ' + person.name.maternal + ' ' + person.name.first + ' ' + person.name.middle).toLowerCase()
							.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
						var contains = name.toLowerCase().includes(query.toLowerCase());
						return contains;
					};
				},

				createFilterForClient: function (query) {
					return function filterFn(client) {
						var name = client.name.toLowerCase()
							.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
						var contains = name.toLowerCase().includes(query.toLowerCase());
						return contains;
					};
				},

				createFilterForPerson: function (query) {
					return function filterFn(person) {
						var name = (person.name.last + ' ' + person.name.maternal + ' ' + person.name.first + ' ' + person.name.middle).toLowerCase()
							.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
						var contains = name.toLowerCase().includes(query.toLowerCase());
						return contains;
					};
				},

				createLongNameLocalized: function (person) {
					if (person == null) {
						return '';
					}
					var result = (person.name.last != null ? person.name.last : '') + ' ' +
						(person.name.maternal != null ? person.name.maternal : '') + ' ' +
						(person.name.first != null ? person.name.first : '') + ' ' +
						(person.name.middle != null ? person.name.middle : '');
					return result;
				}

			};
			return service;
		}];
