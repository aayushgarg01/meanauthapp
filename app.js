//************************************************************************************************************ */
//This is the main JS file which initiates the server and is ready to listes and route requests
//-------------------------------------------------------------------------------------------------------------//
//           ******** EXPRESS FUNCTIONS USED IN THIS FILE ARE: ********
//use() ==> This is nothing but enabling Middle-ware i.e using bodyParser, CORS, Routing
//get() ==> fucntion to receive the get request of http
//listen() ==> To start server and listen at a decided port
//-------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------//
//           ******** MONGOOSE FUNTIONS USED ARE ********
//connect() ==> To connect to database
//connection.on() ==> To check its "connected" or there us some "error" in connection
//-------------------------------------------------------------------------------------------------------------//
//************************************************************************************************************ */
//Below are the dependencies which we have installed via package.json for our package and we are going to use them
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');

//Now we are going to include locally created modules:
const config = require('./config/database');

//This is done in order to establish a connection with local MongoDB database
//Inside the connect() we need to pass the location of our database and we will create config file for it
//I have written config.database because I have written word "database" inside the ./config/database file
mongoose.connect(config.database);

//write something to check if we are connected or not
//So we will use use connection.on()
mongoose.connection.on('connected', () => {
  console.log('Connected to database: ' + config.database);
});

//write something to check if there is an error in connection
//So we will use use connection.on()
mongoose.connection.on('error', (err) => {
  console.log('Database error: ' + err);
});

//Creating express object which will be majorly used here in app.js
const app = express();

//We are bringing in users file from ./routes folder
const users = require('./routes/users');

//Port at which the request will be heard
const port = 3000;

//Cross-origin resource sharing (CORS) is a mechanism that allows restricted resources
//(e.g. fonts) on a web page to be requested from another domain outside the domain
//from which the first resource was served
app.use(cors());

//We are also going to need a static folder where we are going to keep all Angular stuff inside public folder
//If we write app.get() below in this file it would only execute if there is nothing inside this public folder
//express.static() -->
//path.join() --> By writing this we make sure that wherever we are on the cmd promt
//                the application will find public folders exact path in reference to this app.je file
//                i.e. it will look in the exact sub-directories on level on app.js and will find public
app.use(express.static(path.join(__dirname, 'public')));

//Body parser middle-ware.
//For now lets understand it as a way by which we will be able to take data from users at Front end
//And be able to parse it and send to MongoDB to fetch data.
//We want to parse JSON
app.use(bodyParser.json());

//Creating our routes
//Below means that when someone wouls access http://localhost:3000/users/****
//Then it will go and look into users.js inside ./routes folder
app.use('/users', users);

//Adding Passport middle-ware
app.use(passport.initialize());
app.use(passport.session());

//Including passport.js here, if you go in passport.js you will find the
//function(passport) and thus we have written it like that below
require('./config/passport')(passport);

//Instead of writing function () we can also write it like "() =>"
//If there are any params to be used in function you directly write it
//Below will be rendered when asked for home page http://localhost:3000/
//This is one method of rendering a view, other is via ROUTES
app.get('/', (req, res) => {

//If we were to just test the connection we would run the below stmt by send() a simple text
  res.send('Invalid Endpoint');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

//Starting server at port declared above
app.listen(port, () => {
  console.log('Server started on Port: ' + port);
});
