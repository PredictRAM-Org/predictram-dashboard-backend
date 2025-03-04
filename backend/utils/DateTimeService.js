const today = new Date();

//start on Sunday end on Saturday
const firstDay = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() - today.getDay() - 7
);
const lastDay = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() - today.getDay() + 6
);

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

module.exports = {
  firstDay,
  lastDay,
  formatDate,
};
