export const getSearchedData = (
  data: any,
  columns: Array<string>,
  locations: Array<string>
) => {
  const datasets = [];
  for (const column of columns) {
    for (const location of locations) {
      const dataset = {
        label: column + " in " + location,
        labels: data
          .filter((row: any) => row.location === location)
          .map((dat: any) => dat["date"]),
        data: data
          .filter((row: any) => row.location === location)
          .map((row: any) => (row[column] === "" ? 0 : +row[column])),
      };

      datasets.push(dataset);
    }
  }
  return datasets;
};

export const getLocations = (data: any) => {
  const locations: Array<string> = [];
  for (const row of data) {
    if (!locations.includes(row.location)) {
      locations.push(row.location);
    }
  }
  return locations;
};

export const getColumns = (data: any) => {
  const columns = Object.keys(data[0]);
  removeItemsOnce(columns, ["iso_code", "continent", "location", "date"]);

  return columns;
};

function removeItemsOnce(arr: any, values: any) {
  for (const value of values) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
  }
  return arr;
}
