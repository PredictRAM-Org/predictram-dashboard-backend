const createQueryUrl = (url, query) => {
  const keyValue = Object.keys(query)
    .map((key) => `${key}=${query[key]}`)
    .join("&");
  return !!keyValue.length ? `${url}?${keyValue}` : url;
};
module.exports = { createQueryUrl };
