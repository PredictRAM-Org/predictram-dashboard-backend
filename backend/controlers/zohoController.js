const { default: axios } = require("axios");
const ZohoAccessToken = require("../models/accessToken");
const { createQueryUrl } = require("../utils/queryUrlMaker");
const { generateFormData } = require("../utils/formDataMaker");
const advisorySessions = require("../models/advisorySessions");
const nodeCache = require("../utils/nodeCache");

const zoho_axios = axios.create({
  baseURL: "https://www.zohoapis.in/bookings/v1/json",
});
module.exports = {
  fetchServices: async (req, res) => {
    try {
      const token = nodeCache.get("zohoToken");
      //   await ZohoAccessToken.findOne({
      //   key: "zohoToken",
      // });

      const { data } = await zoho_axios.get(
        createQueryUrl("/services", req.query),
        {
          headers: { Authorization: `Zoho-oauthtoken ${token?.access_token}` },
        }
      );

      if (data?.response?.returnvalue?.data) {
        res.apiResponse(
          true,
          "services fetched successfully",
          data?.response?.returnvalue?.data
        );
      } else {
        throw new Error(data?.response?.returnvalue?.mesage);
      }
    } catch (error) {
      res.apiResponse(false, error.message);
    }
  },
  fetchStaff: async (req, res) => {
    try {
      const token = nodeCache.get("zohoToken");
      //   await ZohoAccessToken.findOne({
      //   key: "zohoToken",
      // });

      const { data } = await zoho_axios.get(
        createQueryUrl("/staffs", req.query),
        {
          headers: { Authorization: `Zoho-oauthtoken ${token?.access_token}` },
        }
      );

      if (data?.response?.returnvalue?.data) {
        res.apiResponse(
          true,
          "staff fetched successfully",
          data?.response?.returnvalue?.data
        );
      } else {
        throw new Error(data?.response?.returnvalue?.mesage);
      }
    } catch (error) {
      res.apiResponse(false, error.message);
    }
  },
  fetchAvailability: async (req, res) => {
    try {
      const token = nodeCache.get("zohoToken");
      //   await ZohoAccessToken.findOne({
      //   key: "zohoToken",
      // });
      const { data } = await zoho_axios.get(
        createQueryUrl("/availableslots", req.query),
        {
          headers: { Authorization: `Zoho-oauthtoken ${token?.access_token}` },
        }
      );

      if (data?.response?.returnvalue?.data) {
        res.apiResponse(
          true,
          "available slots fetched successfully",
          data?.response?.returnvalue?.data
        );
      } else {
        throw new Error(data?.response?.returnvalue?.message);
      }
    } catch (error) {
      res.apiResponse(false, error.message);
    }
  },
  bookAppointment: async (req, res) => {
    try {
      const token = nodeCache.get("zohoToken");
      //   await ZohoAccessToken.findOne({
      //   key: "zohoToken",
      // });
      const formData = generateFormData(req.body);
      const { data } = await zoho_axios.post("/appointment", formData, {
        headers: {
          Authorization: `Zoho-oauthtoken ${token.access_token}`,
          ...formData.getHeaders(),
        },
      });

      if (data?.response?.returnvalue?.status === "upcoming") {
        const session = {
          investorId: req.body?.investorId,
          ...data?.response?.returnvalue,
        };
        session.booking_id = session.booking_id.substring(1);
        await advisorySessions.create(session);
        res.apiResponse(
          true,
          "Slot booking successful",
          data?.response?.returnvalue
        );
      } else {
        throw new Error(data?.response?.returnvalue?.message);
      }
    } catch (error) {
      res.apiResponse(false, error.message);
    }
  },
  getAppointment: async (req, res) => {
    try {
      const token = nodeCache.get("zohoToken");
      //   await ZohoAccessToken.findOne({
      //   key: "zohoToken",
      // });
      if (!req.query?.booking_id) {
        throw new Error("please enter a booking id");
      }
      const { data } = await zoho_axios.get(
        createQueryUrl("/getappointment", req.query),
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token?.access_token}`,
          },
        }
      );

      if (data?.response?.returnvalue?.status === "failure") {
        throw new Error(data?.response?.returnvalue?.message);
      } else {
        res.apiResponse(
          true,
          "appointment details fetched successfully",
          data?.response?.returnvalue
        );
      }
    } catch (error) {
      res.apiResponse(false, error.message);
    }
  },
  updateAppointment: async (req, res) => {
    try {
      const token = nodeCache.get("zohoToken");
      //   await ZohoAccessToken.findOne({
      //   key: "zohoToken",
      // });
      const formData = generateFormData(req.body);

      const { data } = await zoho_axios.post("/updateappointment", formData, {
        headers: {
          Authorization: `Zoho-oauthtoken ${token?.access_token}`,
          ...formData.getHeaders(),
        },
      });
      if (data?.response?.returnvalue?.status === "failure") {
        throw new Error(data?.response?.returnvalue?.message);
      } else {
        res.apiResponse(
          true,
          "appointment update successfully",
          data?.response?.returnvalue
        );
      }
    } catch (error) {
      res.apiResponse(false, error.message);
    }
  },
  rescheduleAppointment: async (req, res) => {
    try {
      const token = nodeCache.get("zohoToken");
      //   await ZohoAccessToken.findOne({
      //   key: "zohoToken",
      // });
      const formData = generateFormData(req.body);

      const { data } = await zoho_axios.post(
        "/rescheduleappointment",
        formData,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token?.access_token}`,
            ...formData.getHeaders(),
          },
        }
      );
      if (data?.response?.returnvalue?.status === "failure") {
        throw new Error(data?.response?.returnvalue?.message);
      } else {
        res.apiResponse(
          true,
          "appointment reschedule successfully",
          data?.response?.returnvalue
        );
      }
    } catch (error) {
      res.apiResponse(false, error.message);
    }
  },
};
