const Profile = require("../../models/profile");
const Users = require("../../models/users");

module.exports = {
  saveprofile: async (req, res) => {
    try {
      const userid = req.user._id;
      const profile = await Profile.exists({ _id: userid });
      if (profile) {
        await Profile.findByIdAndUpdate(userid, req.body);
        return res.send({ message: "Profile updated successfully" });
      }
      const newProfile = new Profile({ _id: userid, ...req.body });
      await Users.findByIdAndUpdate(userid, {
        profilecomplete: true,
      });
      await newProfile.save();
      res.send("profile created");
    } catch (error) {
      console.log(error.message);
    }
  },
  getprofile: async (req, res) => {
    try {
      const userid = req.query.id || req.user.id;
      const profile = await Profile.findById(userid).populate("_id");
      if (profile) {
        return res.send({ profile, iscomplete: true });
      }
      const user = await Users.findById(userid, { likedresearchpaper: 0 });
      res.send({ user, iscomplete: false });
    } catch (error) {
      console.log(error.message);
    }
  },
};
