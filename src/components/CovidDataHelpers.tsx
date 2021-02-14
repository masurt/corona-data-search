import csvParse from "csv-parse";
import { Dispatch, SetStateAction } from "react";

const dataFileUrl = "https://covid.ourworldindata.org/data/owid-covid-data.csv";

export const loadCovidCsv = (
  signal: AbortSignal,
  pushTimeoutIdsToCancel: (newId: any) => void,
  setData: Dispatch<SetStateAction<any[]>>,
  setColumns: Dispatch<SetStateAction<string[]>>,
  setLocationLabel: Dispatch<SetStateAction<string>>
) => {
  fetch(dataFileUrl, { signal })
    .then((resp: Response) => resp.text())
    .then(extractColumnsFromCsvString)
    .then(({ columns, csv, allColumns }) => {
      setColumns(columns);
      return { csv, allColumns };
    })
    .then(
      extractCountriesAndParseCSVFactory(
        pushTimeoutIdsToCancel,
        setData,
        setLocationLabel
      )
    )
    .catch((err) => console.log(err));
};

const extractColumnsFromCsvString = (csv: string) => {
  const endOfFirstLineIndex: number = csv.indexOf("\n");
  const allColumns: Array<string> = csv
    .slice(0, endOfFirstLineIndex)
    .split(",");
  const columns: Array<string> = getArrayCopyWithoutValues(
    ["iso_code", "continent", "location", "date"],
    allColumns
  );
  return { columns, csv, allColumns };
};

function getArrayCopyWithoutValues(values: any, arr: any) {
  const maskedArr: Array<string> = [];
  for (const val of arr) {
    var index = values.indexOf(val);
    if (index === -1) {
      maskedArr.push(val);
    }
  }
  return maskedArr;
}

const extractCountriesAndParseCSVFactory = (
  pushTimeoutIdsToCancel: any,
  setData: any,
  setLocationLabel: any
) => {
  const csvParser = ({
    csv,
    allColumns,
  }: {
    csv: string;
    allColumns: Array<string | null>;
  }) => {
    // parse csv in chunks asynchronously

    const csvLineArray = csv.split("\n").slice(1, csv.length - 1);
    const tempData: Array<any> = [];
    // Create the parser
    const parser = csvParse({
      delimiter: ",",
      columns: allColumns,
    });
    // execute on new data in stream
    parser.on("readable", function () {
      let record;
      while ((record = parser.read())) {
        tempData.push(record);
      }
    });
    // Catch any error
    parser.on("error", function (err) {
      console.error("err1: ", err.message);
    });
    // save in state when stream ended
    parser.on("end", function () {
      setData(tempData);
      setLocationLabel("Location");
    });

    // Write csv to the stream in chunks of lines
    // larger chunkSize increases load speed, but leads to initially less responsive site
    const chunkSize: number = 1000;
    for (var i = 0; i < csvLineArray.length; i += chunkSize) {
      const newlineIfMoreData = i < csvLineArray.length - chunkSize ? "\n" : "";
      const writeLine =
        csvLineArray
          .slice(i, Math.min(csvLineArray.length, i + chunkSize))
          .join("\n") + newlineIfMoreData;
      const timeoutId = setTimeout(() => {
        parser.write(writeLine);
      });
      pushTimeoutIdsToCancel(timeoutId);
    }

    // Close the readable stream
    setTimeout(() => parser.end());
  };
  return csvParser;
};

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
