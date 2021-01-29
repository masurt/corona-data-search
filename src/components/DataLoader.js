import * as d3 from "d3";



export const getSearchedData = (data, column, location) => {
  const searchedData = data
    .filter((row) => (row.location === location))
    .map((row) => {
      return {'date': row['date'],
              [column]: row[column]}
    })
  
  console.log(searchedData)
  return searchedData
}

export const getLocations = (data) => {
  const locations = []
  for(const row of data){
    if(!locations.includes(row.location)){
      locations.push(row.location)
    }
  }
  return locations
}

export const getColumns = (data) => {
  const columns = Object.keys(data[0])
  removeItemsOnce(columns, ["iso_code", "continent", "location", "date"])
  
  return columns
}

function removeItemsOnce(arr, values) {
  for(const value of values){
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
  } 
  return arr;
}