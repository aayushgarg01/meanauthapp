//************************************************************************************************************ */
//ROUTER JS file
//This will help render (get) different pages when written as http://localhost:3000/users/****
//************************************************************************************************************ */
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

//We want to use express Router, which would help us decide where to route the request to
const router = express.Router();

//including the model user in Router from models folder
const User = require('../models/user');

//----------------------------------------//
//REGISTER Route
//----------------------------------------//
//This is invoked when register page ('/users/register') is asked on browser you need to execute fucntion
//You will notice I have only written /register and not /users/register bcoz it has already taken /users from app.js
//I have used post here because I want to save users data in our database and pick it up from req.body
router.post('/register', (req, res, next) => {
  //Creating an object of type User into which we will pass value received from body of request
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  //after newUser we have (err, user) as arguments these are actually callbacks
  User.addUser(newUser, (err, user) => {
    if(err){
      res.json({success: false, msg:'Failed to register user'});
    } else {
      res.json({success: true, msg:'User Registered'});
    }
  });
});
//----------------------------------------//
//AUTHENTICATE Route
//----------------------------------------//
//After we have done coding around passport, decided Strategy we will come here to make changes
router.post('/authenticate', (req, res, next) => {
  //We first need to collect username and password from body for authentication
  const username = req.body.username;
  const password = req.body.password;

  //We will call our fucntion in user.js to fetch details by username
  //We pass username as first param and get either err or the user details in return (callback)
  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user){
      res.json({success: false, msg:'User not found'});
    }

    //This will be another user defined function inside user.js model
    //It will take first the password that the user has entered
    //Second the password successfully fetched from database above
    //Third is a callback with err details and a boolean value to know it has matched or not
    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;

      //If it has matched we will create our token, this token will then be carried throught the application
      //It will also carry the secret key we have kept in database config file
      if(isMatch){
        //This means that the token which we are generating will be hashed/ encrypted internally
        //by sign() using our secret key which is the the database config file.
        //This token takes in the user details and the key and produces a hashed value which is nothing
        //but the token which will be used to handle session of this user
        const token = jwt.sign(user, config.secret, {
          //Here we are setting the time after which this token gets expirted
          //This time is in seconds and we have kept it for a week as of now (604800 sec)
          expiresIn: 604800
        });

        //We also want to send our response back in form of json
        res.json({
          success: true,
          //Sending back token as it can then be carried forward
          token: 'JWT ' + token,
          //We are building an object to be sent and we only want to send selective fields
          //bcoz we don't want to send back password
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      } else { //This is an else of isMatch, so this means it hasn't matched
        return res.json({success: false, msg:'Wrong Password'});
      }
    });
  });
});

//----------------------------------------//
//PROFILE Route
//----------------------------------------//
//This is a profile page which ideally should only come after a successful login
//If someone tries to put the link http://localhost:3000/users/profile directly in URL
//The should not be able to see profile page and thus we protect this page by passport
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  res.json({user: req.user});
});

//And we want to export this router function so that can be used elsewhere in our project
//Bcoz you can see get request is handled by router object, app.js should be capable enough to
//access this object
module.exports = router;
