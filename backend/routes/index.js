const router = require("express").Router();
const authroute = require("./auth");
const userroute = require("./users");

const investorroute = require("./investors");
const investorEventRoutes = require("./investorRoutes/investorEventRoutes");

const adminroute = require("./admin");
const { adminmiddleware } = require("../middlewares/userAuthentication");

router.use("/api/auth", authroute);
router.use("/api/users", userroute);

router.use("/api/investors", investorroute);
router.use("/api/investors/events", investorEventRoutes);

router.use("/api/admin", adminmiddleware, adminroute);
router.get("/api/logout", async (req, res) => {
  if (req.user) req.logout();
  res.send("done");
});
module.exports = router;
