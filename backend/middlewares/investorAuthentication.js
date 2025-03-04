// investor auth
const bcrypt = require("bcrypt");

module.exports = {
  investormiddleware: async (req, res, next) => {
    try {
      // const {
      //   headers: { mobilenumber, secrettoken },
      // } = req;

      // if (!secrettoken) {
      //   return res.status(401).json({
      //     message: "Authentication failed: No token provided",
      //     secrettoken,
      //     headers: req.headers,
      //   });
      // }

      // if (secrettoken) {
      //   const userAuthorised = await bcrypt.compare(mobilenumber, secrettoken);
      //   if (userAuthorised) {
      //     next();
      //   } else {
      //     return res
      //       .status(401)
      //       .json({ message: "Authentication failed: Invalid token" });
      //   }
      // }
      next();
    } catch (err) {
      console.log(err.message);
      res.status(500).send({ message: err.message });
    }
  },
};
