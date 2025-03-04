const Investors = require("../../models/investorsAccount");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

module.exports = {
  register: async (req, res) => {
    try {
      const { mobileNumber, email, refercode } = req.body;
      const checkPayload = {};
      if (mobileNumber) checkPayload.mobileNumber = mobileNumber;
      if (email) checkPayload.email = email;

      const accountExists = await Investors.exists({
        $or: [checkPayload],
      });
      if (accountExists) {
        return res.apiResponse(false, "Account already exists", null);
      }
      if (refercode) {
        const namePhone = req.body.refercode.split("-");
        const referByPhone = namePhone[namePhone.length - 1];
        const investor = await Investors.findOne({
          mobileNumber: `+${referByPhone}`,
        });
        if (!investor)
          return res.apiResponse(false, "invalid Refer code", null);
        req.body.referedby = investor._id;
      }
      const data = await Investors.create(req.body);

      res.apiResponse(true, "Account created successfully", data);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  updateDetails: async (req, res) => {
    try {
      const data = await Investors.findByIdAndUpdate(
        req.body.id,
        { ...req.body, profileCompleted: true },
        {
          new: true,
        }
      );
      res.apiResponse(true, "User updated successfully", data);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
  checkReferCode: async (req, res) => {
    try {
      const namePhone = req.query.refercode.split("-");
      const referByPhone = namePhone[namePhone.length - 1];
      const investor = await Investors.findOne({
        mobileNumber: `+${referByPhone}`,
      });
      if (!investor) {
        return res.apiResponse(false, "invalid Refer code");
      } else {
        return res.apiResponse(true, "valid Refer code", { valid: true });
      }
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
