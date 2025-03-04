const Users = require("../models/users");
const bcrypt = require("bcrypt");
require("dotenv").config();
const localStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const LinkedInStrategy=require("passport-linkedin").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
module.exports = function (passport) {
  passport.use(
    "login-phone-password",
    new localStrategy(
      {
        usernameField: "phone",
        passwordField: "password",
      },
      (phone, password, done) => {
        Users.findOne({ phone: phone }, (err, user) => {
          if (err) return done(err);
          if (!user) return done(null, false);
          else {
            bcrypt.compare(password, user.password, (err, result) => {
              if (err) return done(err);
              else if (result === true) done(null, user);
              else done(null, false);
            });
          }
        });
      }
    )
  );
  passport.use(
    "login-email-password",
    new localStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      (email, password, done) => {
        Users.findOne({ email: email }, (err, user) => {
          if (err) return done(err);
          if (!user) return done(null, false);
          else {
            bcrypt.compare(password, user.password, (err, result) => {
              if (err) return done(err);
              else if (result === true) done(null, user);
              else done(null, false);
            });
          }
        });
      }
    )
  );
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      function (accessToken, refreshToken, profile, done) {
        Users.findOne({ googleId: profile.id }, async (err, user) => {
          if (err) return done(err, null);
          if (!user) {
            const newUser = new Users({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            });
            await newUser.save();
            return done(null, newUser);
          }
          done(null, user);
        });
      }
    )
  );
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_KEY,
        clientSecret: process.env.LINKEDIN_SECRET,
        callbackURL: "/api/auth/linkedin/callback",
        scope: ["r_emailaddress", "r_liteprofile"],
      },
      function (accessToken, refreshToken, profile, done) {
        Users.findOne({ linkdinId: profile.id }, async (err, user) => {
          if (err) return done(err, null);
          if (!user) {
            if (profile.photos.length == 0) {
              const newUser = new Users({
                linkdinId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
              });
              await newUser.save();
              return done(null, newUser);
            } else {
              const newUser = new Users({
                linkdinId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[2].value,
              });
              await newUser.save();
              return done(null, newUser);
            }
          }
          if (
            profile.photos.length != 0 &&
            profile.photos[2].value != user.image
          )
            user.image = profile.photos[2].value;
          await user.save();
          done(null, user);
        });
      }
    )
  );
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    Users.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
