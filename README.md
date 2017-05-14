# Personal Slack Bot

### What is Personal Slack Bot?
You want some coffee? Now you can! With this app you can setup auto responses with a few clicks. Add the responses you want. And when you get back from the coffee machine all you message's are logged. If there are new messages this will be streamed realtime to your browser! You will answer to btw;)

## Demo
You can visit the life app [here](http://socialscoutagency.com).

![Flow](https://raw.githubusercontent.com/royvanderzon/minor-realtimeweb-2/master/flow.jpg)

### Security
This app uses a few kind of security protecolls
- Bycrypt hashed password in MongoDB
- Email expire invite links (for signup)
- OAuth protecol from Slack
- Hashed sessions
- User management for admins

## Wish list
* [ ] Offline notifications when the client is disconnected with the server
* [ ] Offline notifications when the server is disconnected with Slack
* [ ] Graphs with averages of incoming messages per hour or day
* [ ] Add more Slack teams
* [ ] SSL connection

## Known issues
* Graph doesnt scale
* Some user info can't be edited
* The html list of in and out comming messages is endlesslong (no overflow)
* No SSL connection

## Featurelist
* [X] Add slack commands
* [X] Autoresponds to Slack messages
* [X] User management
* [X] Email invite's
* [X] Login system
* [X] Signup system
* [X] Passowrord forget system

## Events reference
### Server
* `start` there starts a realtime Slack engine for each user
* `connection` messages (based on commands) are send realtime to the namespace of the client
* `forget password` sends mail to user with secret reset token
* `register new user` add new user in database
* `edit user` edits user and stores in database
* `create invite link` creates and email invite link that an user can accept for 24 hours
* `incomming message 1` message is stored and can be used in history of for graphs
* `incomming message 2` if message has a command respond to that message
### Client
* `dashboard` starts stream with server
* `disconnect socket` trie to reconnect with socket
* `disconnect internet` alert no internet
### Slack messenger
* `on message` respond with message from command

### Design
Slackbots design is based on Google Material design. This design is a nice and smooth. It is functional to because it feels natural. In this way the users can navigate trough this website much easier!

### Security
This app is made in **NODEJS** in combination with **MongoDB**. The servers starts a Slackbot engine for every users that is connected with Slack. This only happens when the user **successfully** completed the OAuth protecol from Slack. After this engine is started the collected data can be retreived only by the user who walked trough the protecol. It is not possible to get back the stored passwords. The login system compares the hashed password on a login attempt. When the user loses his password, it can re reset. The email link will expire in 24 hours by default. When this expire date is expired, the user can request a new "forget" link when the password is typed in wrong more than (1) times.

## Install
#### NODEJS
- clone repo `$ git clone THIS_REPO`
- cd to cloned repo `$ cd TO_CLONED_REPO`
- set envoirement variables `nano .env`
- run `$ npm install`
- run `$ nodemon app.js`
#### MongoDB
*Setup MongoDB*
- cd to MongoDB `$ cd mongodb`
- run `$ /usr/local/bin/mongod`
- type `use rtw` in MongoShell
#### Setup PM2
*PM2 is the way to deploy this app to a online production server*
#### Envoirement variables
*Change the variables to your needs*
```
SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID
SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET
SLACK_APP_NAME=YOUR_SLACK_APP_NAME
WEB_HOST=localhost:3000
MONGODB=mongodb://127.0.0.1/rtw
```

## Tooling
In this project tooling is done with NPM scripts. You can find more information [here](https://docs.npmjs.com/misc/scripts).

#### NPM Run scripts
Minify the css to `/public/dist/css/styles.min.css`
```bash
$ npm run css:minify
```
Convert css/sass to `./public/dist/css/styles.css`
```bash
$ npm run css:compress
```
Rebuild css on filechange (*.css)
```bash
$ npm run css:watch
```
Minify js to `/public/dist/js/bundle.min.js`
```bash
$ npm run js:minify
```
Bundle js to `/public/dist/js/bundle.js`
```bash
$ npm run js:browserify
```
Bundle and minify js
```bash
$ npm run js:compress
```
Watch js on filechange (*.js) bundle and minify
```bash
$ npm run js:watch
```
Watch js and css on filechange bundle and minify
```bash
$ npm run client:watch
```
Watch server js on filechange restart app.js *(nodemon)*
```bash
$ npm run server:watch
```
Watch all server js, client js and css. Bundle, minify and restart on filechange
```bash
$ npm run all:watch
```
Minify all client js and css
```bash
$ npm run build
```
Watch server js on filechange restart app.js *(nodemon)*
```bash
$ npm run start
```