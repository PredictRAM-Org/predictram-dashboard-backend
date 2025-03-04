var FormData = require("form-data");
const generateFormData = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "object")
      formData.append(key, JSON.stringify(data[key], (space = 1)));
    else formData.append(key, data[key]);
  });

  return formData;
};

module.exports = { generateFormData };
