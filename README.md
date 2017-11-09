# Janux Authorization Angular Seed

This is was initially based on the 
[angular-app project](https://github.com/angular-app/angular-app). That project was simplified to 
focus solely on providing Authentication and Authorization functionality based on the 
[Janux Authorize](https://github.com/janux/janux-authorize.js.git) library.

The Janux Service library includes a flexible permission-based scheme that makes it possible to
declare in the configuration of an application the permissions that are available to a user, and to
then aggregate these permissions into Roles in a declarative way.

The main advantage of this approach is that new Roles can be added, or existing Roles can be easily
redefined via configuration, without having to modify the business logic of the application or the
source code of the UI.

This project is still under construction.  If you are interested in learning more, please send an
email to pparavicini@janux.org, and come back soon.

**Requirements**

1.- Git.

2.- Node latest stable version.

3.- Bower and gulp installed globally.

4.- Optional: A running mongo database.

`npm install -g gulp`

`npm install -g bower`

This project depends on janux-persist , janux-people and janux-authorize. You need do the following.

*1.- Install janux-people.*

a.- Get janux-people at 'https://github.com/janux/janux-people.js.git'

b.- Checkout branch dev (`git fetch && git checkout dev`).

c.- Run 'npm install' and then run 'gulp'

*2.- Install janux-authorize.*

a.- Get janux-authorize at 'https://github.com/janux/janux-authorize.js.git'.

b.- Checkout branch develop (`git fetch && git checkout develop`)

c.- Run 'npm install' and then run 'gulp'

*3.- Install janux-persist.*

a.- Get janux-persist at 'https://github.com/janux/janux-persist.js.git'.

b.- Checkout branch dev (`git fetch && git checkout dev`)

c.- Create vendor directory (`mkdir -p $JANUX_PERSIST/vendor`)

d.- Create symlinks of janux-people and janux-authorize. Inside the vendor directory execute ...

`ln -s $PATH_JANUX_PEOPLE && ln -s $PATH_JANUX_AUTHORIZE`

For windows users you need to modify package.json and replace the path of janux-people and janux-persist with the correct paths.

e.-Run `npm install`

**How to install the project.**

a.- Get the project at 'https://github.com/janux/janux-authorize.js.git'.

b.- Switch to branch develop ('git fetch && git checkout develop').

c.-  Create symlinks of janux-people, janux-authorize and janux-persist. Inside the server/vendor directory execute ...

`ln -s $PATH_JANUX_PEOPLE && ln -s $PATH_JANUX_AUTHORIZE $$ ln -s $PATH_JANUX-PERSIST`

For windows users you need to modify server/package.json and replace the path of janux-people and janux-persist with the correct paths.

d.- At the root of the directory run `npm install`.

**How to run the project.**

Run the following tasks.

1.- Create users sample data by running `npm run generate-demo-users`

2.- Create auth-context sample data by running `npm run generate-demo-auth`\

3.- Execute `npm run watch`.

At this moment there is a server running at http://localhost:9000.
