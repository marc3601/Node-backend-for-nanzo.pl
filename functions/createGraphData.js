const parseTimestamp = require("./parseTimestamp");

const createGraphData = (data) => {
  let arr = [];
  for (let item of data) {
    const date = `${parseTimestamp(item?.timestamp, "d")}/${parseTimestamp(
      item?.timestamp,
      "m"
    )}/${parseTimestamp(item?.timestamp, "y")}`;

    arr.push(date);
  }
  const result = arr.reduce((a, c) => a.set(c, (a.get(c) || 0) + 1), new Map());

  const array = Array.from(result, ([x, y]) => ({ x, y }));
  return array;
};

module.exports = createGraphData;
