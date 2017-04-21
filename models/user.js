//************************************************************************************************************ */
//We want to create a modle for our users, this model will contain definition of user fields
//Fields like name, password, email etc.
//This file will also contain function() that are going to interact with the database
//************************************************************************************************************ */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('../config/database');

// USer Schema creation
const UserSchema = mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

//we want to access User object from outside hence using module.export
//model() uses Name of the model 'User' and second the schema defined above
const User = module.exports = mongoose.model('User', UserSchema);

//----------------------------------------------------------------------------//
//SELECT QUERY in form of findById() with callback
//----------------------------------------------------------------------------//
module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
}

//----------------------------------------------------------------------------//
//SELECT QUERY in form of findOne() with callback
//----------------------------------------------------------------------------//
module.exports.getUserByUsername = function(username, callback){

  //Preparing the WHERE clause for the findOne fucntion
  const query = {username: username};
  User.findOne(query, callback);
}

//----------------------------------------------------------------------------//
//HASHING OF PASSWORD AND INSERTING INTO DB
//----------------------------------------------------------------------------//
module.exports.addUser = function(newUser, callback){

  //We have to encrypt the password passed from UI before storing it in DB
  //For that we will generate a Salt which is a random key used by hash fucntion
  //10 is the number of rounds (I guess no of times it goes for hashing)
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) throw err;
      //Whatever hash has been generated will be passed to password var for storage
      newUser.password = hash;
      //This will save the newUser's value in collection "users" on DB
      newUser.save(callback);
    });
  });
}

//----------------------------------------------------------------------------//
//COMPARING PASSWORD when user tries to login
//----------------------------------------------------------------------------//
module.exports.comparePassword = function(candidatePassword, hash, callback){
  //using bcrypt's inbuilt compare fucntion
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
}
