'use strict';

module.exports = {
	staff: [
		{
			'displayName': 'Gilberto Hernandez',
			'name': {
				'honorificPrefix': 'Mr.',
				'first': 'Gilberto',
				'middle': '',
				'last': 'Hernandez',
				'honorificSuffix': 'Sr.'
			},
			'typeName': 'PersonImpl',
			'id': 'b1cbaaf7-bd66-4918-8130-7824b95c37e4',
			'dateCreated': '2017-09-18T15:22:55.246Z'
		},
		{
			'displayName': 'German Cadena',
			'name': {
				'honorificPrefix': 'Mr.',
				'first': 'German',
				'middle': '',
				'last': 'Cadena',
				'honorificSuffix': 'DDS'
			},
			'typeName': 'PersonImpl',
			'id': 'c31361b1-71b2-4852-8508-c29cd84f3686',
			'dateCreated': '2017-09-18T15:22:55.250Z'
		},
		{
			'displayName': 'Harold Ramis',
			'name': {
				'honorificPrefix': 'General',
				'first': 'Harold',
				'last': 'Ramis',
				'honorificSuffix': 'Prisioner'
			},
			'typeName': 'PersonImpl',
			'id': '8294520d-fdab-45ce-89fa-a1ca66b7c78a',
			'lastUpdate': '2017-10-20T17:29:51.439Z'
		}
	],
	operations: [
		{
			'id': 'O100100',
			'name': 'driver for Sasaki',
			'idClient': '11000',
			'type': 'DRIVER',
			'dateCreated': '2017-10-26T00:00:00Z'
		},
		{
			'id': 'O100200',
			'name': 'driver for Shimizu',
			'idClient': '11000',
			'type': 'DRIVER',
			'dateCreated': '2017-10-26T00:00:00Z'
		},
		{
			'id': 'O100300',
			'name': 'driver for Inoue',
			'idClient': '11000',
			'type': 'DRIVER',
			'dateCreated': '2017-10-26T00:00:00Z'
		},
		{
			'id': 'O100400',
			'name': 'driver for Kuroda',
			'idClient': '11000',
			'type': 'DRIVER',
			'dateCreated': '2017-10-26T00:00:00Z'
		},
		{
			'id': 'O100500',
			'name': 'driver for Sato',
			'idClient': '11000',
			'type': 'DRIVER',
			'dateCreated': '2017-10-26T00:00:00Z'
		},
		{
			'id': 'O100600',
			'name': 'driver for Guillen',
			'idClient': '16000',
			'type': 'DRIVER',
			'dateCreated': '2017-10-26T00:00:00Z'
		}
	],
	clients: [
		{
			'id': '15000',
			'name': 'THOMAS DALE & ASSOCIATES',
			'typeName': 'OrganizationImpl',
			'addresses': [{
				'primary': true,
				'type': 'work',
				'line1': '869 N. Douglas Street',
				'cityText': 'El segundo',
				'stateText': 'CA',
				'countryText': 'US'
			}]
		},
		{
			'id': '16000',
			'name': 'ALPHA GROUP INTERNATIONAL INC.',
			'typeName': 'OrganizationImpl',
			'addresses': [{
				'primary': true,
				'type': 'work',
				'line1': '94, Main Street',
				'cityText': 'Chatham',
				'stateText': 'NJ',
				'countryText': 'US'
			}]
		},
		{
			'id': '11000',
			'name': 'Honda de México, S.A. de C.V.',
			'typeName': 'OrganizationImpl',
			'addresses': [{
				'primary': true,
				'type': 'work',
				'line1': 'Carretera a el Castillo 7250 Parque Industrial El Salto',
				'cityText': 'Jalisco',
				'stateText': 'Guadalajara',
				'countryText': 'MX'
			}]
		}
	],
	providers: [
		{
			'id': '10000',
			'name': 'Glarus',
			'typeName': 'OrganizationImpl',
			'addresses': [{
				'primary': true,
				'type': 'work',
				'line1': 'Concepción Beistegui 807 Col. del Valle',
				'cityText': 'CDMX',
				'stateText': 'CDMX',
				'countryText': 'MX'
			}]
		}
	]
};