const mongoose = require("mongoose");
module.exports = class QueryFilter {
  constructor(allowedQueryParams) {
    this.allowedQueryParams = allowedQueryParams;
  }

  filter(query) {
    const filteredQuery = {};
    for (const param of this.allowedQueryParams) {
      if (query[param] !== undefined) {
        filteredQuery[param] = query[param];
      }
    }
    return filteredQuery;
  }

  validateObjectId(id) {
    if (typeof id !== "string") {
      throw new Error(
        "Oops!! Something went wrong. If you are not sure what happened then contact our support team."
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(
        "Oops!! Something went wrong. If you are not sure what happened then contact our support team."
      );
    }

    return true;
  }
};
