const Investors = require("../../models/investorsAccount");

module.exports = {
  completeProfileSteps: async (req, res) => {
    try {
      const updateProfileSteps = await Investors.findByIdAndUpdate(
        req.body.id,
        {
          [`profileCompletionSteps.${
            req.body.step === 1
              ? "yourRisk"
              : req.body.step === 2
              ? "portfolioRisk"
              : "purchasedEtf"
          }`]: true,
        },
        { new: true }
      );
      if (req.body.step === 3) {
        const updateProfileSteps = await Investors.findByIdAndUpdate(
          req.body.id,
          {
            profileCompleted: true,
          },
          { new: true }
        );
      }

      res.apiResponse(true, "Step completed successfully", updateProfileSteps);
    } catch (err) {
      res.apiResponse(false, err.message, err);
    }
  },
};
