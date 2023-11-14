const sortArrayOfObjects = (arr, propertyName, order = "ascending") => {
  const sortedArr = arr.sort((a, b) => {
    if (a[propertyName] < b[propertyName]) {
      return -1;
    }
    if (a[propertyName] > b[propertyName]) {
      return 1;
    }
    return 0;
  });

  if (order === "descending") {
    return sortedArr.reverse();
  }

  return sortedArr;
};

module.exports = sortArrayOfObjects;
