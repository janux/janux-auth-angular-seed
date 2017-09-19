# Janux Authorization Angular Seed - server-side

* Install by running:

	$ npm install

* To run server-side tests run:

	$ mocha -R spec

* To generate test users compatible with the janux people package, simply run

	$ npm run generate-demo-users

	Since the generated users contain associated roles, you will also need to generate
	the test authorization scheme as follows:

* To generate test authorization contexts and roles compatible with the janux
authorize package, simply run

	$ npm run generate-demo-auth

    Check the file server/config/default.js in order to define the database is
    going to be used for user, authorization context and role generation.