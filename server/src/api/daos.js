'use strict';

var   mongoose	 =	require('../../db/mongo/connection');

module.exports = {
	userDAOMongo: 	require('./user-dao-mongo').object(mongoose.App),
	userDAOLoki: 	require('janux-people.js').UserDAO.object('../server/janux-people.db')
};