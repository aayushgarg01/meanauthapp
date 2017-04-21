const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('../config/database');

module.exports = function(passport){
  let opts = {};
  //There could be different ways of passing tokesn back and forth
  //We are using Authorization in the header
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = config.secret;

  //This is deciding on what stategy is followed for authentication
  //jwt_payload will have the payload i.e. data
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {

    //Here we are calling our own fucntion in user.js
    //jwt_payload contains the _id
    User.getUserById(jwt_payload._doc._id, (err, user) => {
      //If there is error send err and false as message
      if(err){
        return done(err, false);
      }

      //If usernhas been found then send null in err param and user details
      //Else means row not found and thus still null in err and false in response
      if(user){
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }));
};
