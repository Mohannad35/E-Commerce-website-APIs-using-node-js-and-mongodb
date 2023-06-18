<h1 align="center">E-Commerce-API</h1>

## Table of Contents
- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Environmental variables](#environmental-variables)
- [Built With](#built-with)
- [Installation](#installation)
- [Run in Postman](#run-in-postman)

## About The Project
This is an e-commerce back-end server built with NodeJs and MongoDB to serve an e-commerce front-end built with React.
The API documentation can be found at [API Documentation](https://mohannad35.github.io/Api-Documentation/).
Front-end can be found at [React Ecommerce Project](https://github.com/zeyadkhaled1/React-Ecommerce-project.git).
## Environmental variables
- `PROJECT_ISSUER` (Name of the website that will be used when sending emails)
- `NODE_ENV` (development, production, testing)
- `PORT` (port number for the server to run on)
- `DEBUG` (debug level)
- `MONGODB_URL` (string url to [mongodb](https://www.mongodb.com/) cluster to connect to.)
- `ECOMMERCE_JWT_PRIVATE_KEY` (JsonWebToken private key to encrypt user tokens)
- `LOGTAIL_SOURCE_TOKEN` ([LogTail](https://betterstack.com/logs) souce token to use in logging function file `middleware\logger.js`)
- `SENDGRID_API_KEY` ([sendgrid](https://sendgrid.com/) api key used to send emails)
- `FACEBOOK_CLIENT_ID` (client id from facebook developer account to implement facebook authentication)
- `FACEBOOK_SECRET_KEY` (secret key from facebook developer account to implement facebook authentication)
- `FACEBOOK_CALLBACK_URL` (url to function which will be called by facebook to get the user data)
- `GOOGLE_CLIENT_ID` (client id from google developer account to implement google authentication)
- `GOOGLE_SECRET_KEY` (secret key from google developer account to implement google authentication)
- `GOOGLE_CALLBACK_URL` (url to function which will be called by google to get the user data)
- `DSN` (DSN key from [sentry](https://sentry.io/) for application performance monitoring and error reporting services)

## Built With
- [NodeJs](http://nodejs.org)
  - [express](https://expressjs.com/)
  - [express-async-errors](https://github.com/davidbanham/express-async-errors#readme)
  - [cookie-parser](https://github.com/expressjs/cookie-parser#readme)
  - [mongoose](https://mongoosejs.com/)
  - [mongoose-slug-updater](https://github.com/YuriGor/mongoose-slug-updater#readme)
  - [validator](https://github.com/validatorjs/validator.js)
  - [joi](https://github.com/hapijs/joi#readme)
  - [joi-objectid](https://github.com/mkg20001/joi-objectid#readme)
  - [joi-password-complexity](https://github.com/kamronbatman/joi-password-complexity#readme)
  - [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#readme)
  - [bcryptjs](https://github.com/dcodeIO/bcrypt.js#readme)
  - [js-sha256](https://github.com/emn178/js-sha256)
  - [passport](https://www.passportjs.org/)
  - [passport-facebook](https://github.com/jaredhanson/passport-facebook#readme)
  - [passport-google-oauth](https://github.com/jaredhanson/passport-google-oauth#readme)
  - [winston](https://github.com/winstonjs/winston#readme)
  - [logtail](https://betterstack.com/logtail)
  - [@logtail/node](https://github.com/logtail/logtail-js/tree/master/packages/node#readme)
  - [@logtail/winston](https://github.com/logtail/logtail-js/tree/master/packages/winston#readme)
  - [@sendgrid/mail](https://sendgrid.com/)
  - [@sentry/node](https://github.com/getsentry/sentry-javascript/tree/master/packages/node#readme)
  - [debug](https://github.com/debug-js/debug#readme)
  - [config](https://github.com/node-config/node-config#readme)
  - [lodash](https://lodash.com/)
  - [moment](https://momentjs.com/)
  - [morgan](https://github.com/expressjs/morgan#readme)
  - [helmet](https://helmetjs.github.io/)
  - [compression](https://github.com/expressjs/compression#readme)
  - [multer](https://github.com/expressjs/multer#readme)
  - For testing [jest](https://jestjs.io/docs/getting-started)
- [MongoDB](https://mongodb.com)

## Installation
- First, you need NodeJS, MongoDB server (or online MongoDB Atlas) and preferably MongoDB compass to view changes in database, as well as internet connection (for the styling of the bootstrap) and at last an IDE to edit code you can use VScode. Links:
  - [VS code](https://code.visualstudio.com/Download)
  - [Node js](https://nodejs.org/en/download/)
  - [MongoDB](https://www.mongodb.com/try/download/community)
  - [MongoDB Compass](https://www.mongodb.com/try/download/compass)

- After installing:
	1. Clone or download the repository from [GitHub](https://github.com/Mohannad35/e-commerce-api.git)
	2. Make a new file `/config/.env` and configure the [Environmental variables](#environmental-variables) as written or you will need to change their names in `/config/custom-environment-variables.json`.
	3. Open the project folder with VS code.
	4. In the integrated terminal, write the command `npm install --also=dev` to install the dependencies packages.
	5. (optional) To seed the database with samples for testing run `npm run seed` then go to MongoDB compass and see the results.
	6. Now run `npm run dev` in terminal to run the server.
	7. now you can call any API from postman or the front-end.

## Run in Postman
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/26351215-a3f8a6e0-ef0e-4931-91f7-d03709772cfc?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D26351215-a3f8a6e0-ef0e-4931-91f7-d03709772cfc%26entityType%3Dcollection%26workspaceId%3D44184b38-ae88-40e2-a7c7-82e8b255a00e#?env%5Be-commerce-api%5D=W3sia2V5IjoiUE9SVCIsInZhbHVlIjoiNTAwMCIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0Iiwic2Vzc2lvblZhbHVlIjoiNTAwMCIsInNlc3Npb25JbmRleCI6MH0seyJrZXkiOiJ1cmwiLCJ2YWx1ZSI6Imh0dHA6Ly9sb2NhbGhvc3Q6IiwiZW5hYmxlZCI6dHJ1ZSwidHlwZSI6ImRlZmF1bHQiLCJzZXNzaW9uVmFsdWUiOiJodHRwOi8vbG9jYWxob3N0OiIsInNlc3Npb25JbmRleCI6MX0seyJrZXkiOiJjdXJyZW50VG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJhbnkiLCJzZXNzaW9uVmFsdWUiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKZmFXUWlPaUkyTkRkbE5HWmpNRGhsWmpFNE1qQXpabVZqTVRRME1qRWlMQ0p1WVcxbElqb2lZV2h0WldRaUxDSmhZMk52ZFc1MFZIbHdaU0k2SW1Ga2JXbHVJaXdpWlcxaC4uLiIsInNlc3Npb25JbmRleCI6Mn1d)
