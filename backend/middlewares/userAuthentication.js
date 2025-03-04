const bcrypt = require("bcrypt");

module.exports = {
  usermiddleware: async (req, res, next) => {
    try {
      const { user } = req;
      const userSecretToken = user?.secret_token;

      if (!userSecretToken) {
        return res
          .status(401)
          .json({ message: "Authentication failed: No token provided" });
      }

      if (userSecretToken) {
        const userAuthorised = await bcrypt.compare(
          user.email,
          userSecretToken,
        );
        if (userAuthorised) {
          next();
        } else {
          return res
            .status(401)
            .json({ message: "Authentication failed: Invalid token" });
        }
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send();
    }
  },
  adminmiddleware: async (req, res, next) => {
    try {
      const { user } = req;
      if (user.admin) {
        next();
      } else return res.status(401).send("Unauthorised");
    } catch (error) {
      res.status(401).send("Unauthorised");
    }
  },
  premiumUserMiddleware: async (req, res, next) => {
    try {
      const { user } = req;
      if (user?.payments?.premiumUser) {
        next();
      } else return res.status(401).send("Unauthorised");
    } catch (error) {
      res.status(401).send("Unauthorised");
    }
  },
  creatorMiddleware: async (req, res, next) => {
    try {
      const { user } = req;
      if (user?.creator || user?.admin) {
        next();
      } else return res.status(401).send("Unauthorised");
    } catch (error) {
      res.status(401).send("Unauthorised");
    }
  },
};
