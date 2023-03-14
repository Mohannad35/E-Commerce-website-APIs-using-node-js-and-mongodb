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

## Environmental variables
- `PROJECT_ISSUER`
- `NODE_ENV`
- `PORT`
- `DEBUG`
- `MONGODB_URL` (string url to mongodb cluster to connect to.)
- `ECOMMERCE_JWT_PRIVATE_KEY` (jsonwebtoken private key)
- `LOGTAIL_SOURCE_TOKEN` (logtail token to log errors, info, etc.)
- `SENDGRID_API_KEY` (sendgrid api key to send emails)
- `FACEBOOK_CLIENT_ID` (client id from facebook developer account to implement facebook authentication)
- `FACEBOOK_SECRET_KEY` (secret key from facebook developer account to implement facebook authentication)
- `FACEBOOK_CALLBACK_URL` (url to function which will be called by facebook to get the user data)
- `GOOGLE_CLIENT_ID` (client id from google developer account to implement google authentication)
- `GOOGLE_SECRET_KEY` (secret key from google developer account to implement google authentication)
- `GOOGLE_CALLBACK_URL` (url to function which will be called by google to get the user data)

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
  - [debug](https://github.com/debug-js/debug#readme)
  - [config](https://github.com/node-config/node-config#readme)
  - [lodash](https://lodash.com/)
  - [moment](https://momentjs.com/)
  - [morgan](https://github.com/expressjs/morgan#readme)
  - [helmet](https://helmetjs.github.io/)
  - [compression](https://github.com/expressjs/compression#readme)
- [MongoDB](https://mongodb.com)

## Installation
- First, you need NodeJS, MongoDB server and preferably MongoDB compass to view changes in database, as well as internet connection (for the styling of the bootstrap).
The links to the required programs:
  - [VS code](https://code.visualstudio.com/Download)
  - [Node js](https://nodejs.org/en/download/)
  - [MongoDB](https://www.mongodb.com/try/download/community)
  - [MongoDB Compass](https://www.mongodb.com/try/download/compass)

- after installing:
	1. clone or download the repository from [GitHub](https://github.com/Mohannad35/e-commerce-api.git)
	2. Make a new file `/config/.env` and configure the [Environmental variables](#environmental-variables) as written or you will need to change their names in `/config/custom-environment-variables.json`.
	3. open the project folder with VS code.
	4. in the integrated terminal, write the command npm `install --also=dev` to install the dependencies packages.
	5. (optional) to seed the database with samples for testing run `npm run seed` then go to MongoDB compass and see the results.
	6. if you're on windows run `npm run dev` to run the server.
	7. now you can call any apis from postman or the front-end

## Run in Postman
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/25005733-1fdbf488-474b-40c2-ad87-0f50a8dc4e97?action=collection%2Ffork&collection-url=entityId%3D25005733-1fdbf488-474b-40c2-ad87-0f50a8dc4e97%26entityType%3Dcollection%26workspaceId%3D44184b38-ae88-40e2-a7c7-82e8b255a00e#?env%5Be-commerce-api%5D=W3sia2V5IjoiUE9SVCIsInZhbHVlIjoiNTAwMCIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0Iiwic2Vzc2lvblZhbHVlIjoiNTAwMCIsInNlc3Npb25JbmRleCI6MH0seyJrZXkiOiJ1cmwiLCJ2YWx1ZSI6Imh0dHA6Ly9sb2NhbGhvc3Q6IiwiZW5hYmxlZCI6dHJ1ZSwidHlwZSI6ImRlZmF1bHQiLCJzZXNzaW9uVmFsdWUiOiJodHRwOi8vbG9jYWxob3N0OiIsInNlc3Npb25JbmRleCI6MX0seyJrZXkiOiJjdXJyZW50VG9rZW4iLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJhbnkiLCJzZXNzaW9uVmFsdWUiOiIiLCJzZXNzaW9uSW5kZXgiOjJ9XQ==)
