const router = require("express").Router();
const passport = require("passport");
const _ = require("lodash");
require("dotenv").config();
router.post(
  "/login/phone-password",
  passport.authenticate("login-phone-password"),
  function (req, res) {
    res.send(
      _.pick(req.user, [
        "name",
        "email",
        "image",
        "admin",
        "active",
        "phone",
        "profilecomplete",
        "payments",
      ])
    );
  }
);
router.post(
  "/login/email-password",
  passport.authenticate("login-email-password"),
  function (req, res) {
    res.send(
      _.pick(req.user, [
        "name",
        "email",
        "image",
        "admin",
        "active",
        "role",
        "phone",
        "profilecomplete",
        "payments",
        "id",
      ])
    );
  }
);
router.get(
  "/linkedin",
  passport.authenticate("linkedin", { state: "SOME STATE" })
);
if (process.env.NODE_ENV == "production") {
  router.get(
    "/linkedin/callback",
    passport.authenticate("linkedin", {
      successRedirect: "/dashboard",
      failureRedirect: "/login",
      session: true,
    })
  );
} else
  router.get(
    "/linkedin/callback",
    passport.authenticate("linkedin", {
      successRedirect: "http://localhost:3000/dashboard",
      failureRedirect: "http://localhost:3000/login",
      session: true,
    })
  );
router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.send();
});
module.exports = router;
