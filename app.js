'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const models = require('./models');
const {User, Course} = models;
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');

//FROM STACKOVERFLOW https://stackoverflow.com/questions/9177049/express-js-req-body-undefined
var bodyParser = require('body-parser')


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//FROM STACKOVERFLOW https://stackoverflow.com/questions/9177049/express-js-req-body-undefined
// create application/json parser
var jsonParser = bodyParser.json()

//FROM STACKOVERFLOW https://stackoverflow.com/questions/9177049/express-js-req-body-undefined
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// setup morgan which gives us http request logging
app.use(morgan('dev'));

//uses the stackoverflow thing
app.use(jsonParser);

// TODO setup your api routes here

//set up authentication middleware 
const authenticateUser = async (req, res, next) => {
  const credentials = auth(req);
  console.log(credentials);
  if (credentials) {
    const user = await User.findAll({
      where: {
        emailAddress: credentials.name
      }
    });
   await console.log(user);
    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);
      if (authenticated) {
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.username}`;
    } 
  } else {
    message = 'Auth header not found';
  }
  }
  if (message) {
    console.warn(message);

    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
  next();
  }
};

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

//get route to get the current user
app.get('/api/users', authenticateUser, async (req, res) => {
  const user = await req.currentUser;
  //console.log(user);
  res.json({
    name: user.name,
    username: user.username,
  });
})

// app.get('/api/users', async (req, res) => {
//   console.log(req.body)

//   //console.log(user);
//   // res.json({
//   //   email: user.name,
//   //   name: user.username
//   // });
// })

//post route to create a user
//urlencondedParser is from stackoverflow: https://stackoverflow.com/questions/9177049/express-js-req-body-undefined
app.post('/api/users', urlencodedParser, async (req, res) => {
  await console.log(req.body);
  //let newUser; 
  try {
    //console.log(req.body);
    await User.create(req.body);
    res.status(201).end();
  } catch (error) {
      throw error;
     }  
  }
);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
