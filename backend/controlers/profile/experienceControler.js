const Profile = require("../../models/profile");

module.exports = {
  saveExperience: async (req, res) => {
    try {
      const userid = req.user._id;
      await Profile.findByIdAndUpdate(userid, {
        $push: {
          experience: req.body,
        },
      });
      res.send({ message: "Experience added successfully" });
    } catch (error) {
      console.log(error.message);
    }
  },
  updateExperience: async (req, res) => {
    try {
      const userid = req.user._id;
      const expid = req.body._id;
      await Profile.updateOne(
        { _id: userid, "experience._id": expid },
        {
          $set: {
            "experience.$.title": req.body.title,
            "experience.$.description": req.body.description,
            "experience.$.position": req.body.position,
            "experience.$.startdate": req.body.startdate,
            "experience.$.enddate": req.body.enddate,
            "experience.$.present": req.body.present,
          },
        }
      );
      res.send({ message: "Experience updated successfully" });
    } catch (error) {
      console.log(error.message);
    }
  },

  deleteExperience: async (req, res) => {
    try {
      const userid = req.user._id;
      const expid = req.body.id;
      await Profile.findByIdAndUpdate(userid, {
        $pull: {
          experience: { _id: expid },
        },
      });
      res.send({ message: "Experience deleted successfully" });
    } catch (error) {
      console.log(error.message);
    }
  },
};
