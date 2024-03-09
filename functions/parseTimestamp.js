const parseTimestamp = (timestamp, number) => {
  let fixedNumber = "";
  const date = new Date(timestamp);
  switch (number) {
    case "m":
      fixedNumber =
        date.getMonth().toString().length === 1
          ? date.getMonth() + 1 !== 10
            ? "0" + (date.getMonth() + 1)
            : 10
          : date.getMonth() + 1;
      return fixedNumber.toString();
      break;
    case "d":
      return (fixedNumber =
        date.getDate().toString().length === 1
          ? "0" + date.getDate()
          : date.getDate());
      break;
    case "h":
      return (fixedNumber =
        date.getHours().toString().length === 1
          ? "0" + date.getHours()
          : date.getHours());
      break;
    case "min":
      return (fixedNumber =
        date.getMinutes().toString().length === 1
          ? "0" + date.getMinutes()
          : date.getMinutes());
      break;
    case "y":
      return (fixedNumber = date.getFullYear());
      break;
    default:
      return "";
      break;
  }
};

module.exports = parseTimestamp;
