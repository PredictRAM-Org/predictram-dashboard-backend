function ApiResponse(req, res, next) {
  res.apiResponse = (success, message, data) => {
    const statusCode = success ? 200 : 400;
    let responseBody = { statusCode, message };
    if (data !== null || undefined) {
      responseBody.data = data;
    }
    res.status(statusCode).json(responseBody);
  };
  next();
}

module.exports = ApiResponse;
