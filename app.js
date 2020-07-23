'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const models = require('./models');
const {User, Course} = models;


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

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

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
