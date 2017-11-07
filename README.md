# Janux Authorization Angular Seed

This is was initially based on the 
[angular-app project](https://github.com/angular-app/angular-app). That project was simplified to 
focus solely on providing Authentication and Authorization functionality based on the 
[Janux Security](https://github.com/janux/janux-security.js) library.

The Janux Service library includes a flexible permission-based scheme that makes it possible to
declare in the configuration of an application the permissions that are available to a user, and to
then aggregate these permissions into Roles in a declarative way.

The main advantage of this approach is that new Roles can be added, or existing Roles can be easily
redefined via configuration, without having to modify the business logic of the application or the
source code of the UI.

This project is still under construction.  If you are interested in learning more, please send an
email to pparavicini@janux.org, and come back soon.


**How to install the project.**

This project depends on janux-persist , janux-people and janux-authorize. You need to provide the references inside the directory `server/vendor`.

Then, you just need to call `npm install` in the project root directory. This command prepare the project for both the server module and client module.
