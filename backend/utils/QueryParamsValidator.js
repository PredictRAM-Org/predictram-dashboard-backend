module.exports = class QueryParamsValidator {
  constructor(requiredParams) {
    this.requiredParams = requiredParams;
  }

  validate(query) {
    const missingParams = this.requiredParams.filter((param) => {
      const value = query[param];
      return (
        value === undefined ||
        (param.endsWith("Date") && isNaN(new Date(value).getTime()))
      );
    });
    if (missingParams.length) {
      throw new Error(
        `Missing required parameters: ${missingParams.join(", ")}`
      );
    }
  }
};
