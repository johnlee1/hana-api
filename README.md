# hana api
This is the server side code for the prayer app. 


## prerequisites
- node and npm
- mongodb


## setup
The following environment variables are needed for the api to work:

```
DB_CONNECTION
JWT_PRIVATE_KEY
MAIL_EMAIL
MAIL_USERNAME
MAIL_PASSWORD
```


## developing
1. Run `npm install` to install server dependencies.
2. Run `mongod` in a separate shell to keep an instance of the mongodb daemon running.
3. Run `node index`.