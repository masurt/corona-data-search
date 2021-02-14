import csvParse from "csv-parse";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import {
  Typography,
  Box,
  Link,
  Checkbox,
  FormControlLabel,
  Container,
} from "@material-ui/core";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Line } from "@reactchartjs/react-chart.js";

import { getSearchedData, getLocations, getColumns } from "./DataLoader";

const dataFileUrl = "https://covid.ourworldindata.org/data/owid-covid-data.csv";

const getUnifiedLabelsFromDatasets = (selectedDatasets: any) => {
  // unify labels from all datasets
  var unifiedLabels: string[] = [];
  for (const dataset of selectedDatasets) {
    unifiedLabels = unifiedLabels.concat(dataset.labels);
  }
  unifiedLabels = Array.from(new Set(unifiedLabels));
  unifiedLabels.sort();
  return unifiedLabels;
};

const getPlotDatasets = (
  selectedDatasets: { label: string; labels: any; data: any }[],
  unifiedLabels: string[],
  plotRelative: boolean
) => {
  const plotDatasets = [];
  for (const dataset of selectedDatasets) {
    const plotDataset: {
      label: string;
      data: Array<any>;
      borderColor: string;
      fill: boolean;
    } = {
      label: dataset.label,
      data: [],
      borderColor: randomColor(),
      fill: false,
    };

    for (const label of unifiedLabels) {
      const labelIndex: number = dataset.labels.indexOf(label);
      if (labelIndex > -1) {
        plotDataset.data.push(dataset.data[labelIndex]);
      } else {
        plotDataset.data.push(0);
      }
    }

    plotDatasets.push(plotDataset);
  }
  return plotDatasets;
};

const normalizePlotDatasets = (
  plotDatasets: Array<{
    label: string;
    data: Array<any>;
    borderColor: string;
    fill: boolean;
  }>
) => {
  for (const plotDataset of plotDatasets) {
    const max: number = Math.max(...plotDataset.data);
    if (max > 0) {
      plotDataset.data = plotDataset.data.map((datum) => datum / max);
    }
  }
  return plotDatasets;
};

var randomColor = function () {
  var r = Math.floor(Math.random() * 200);
  var g = Math.floor(Math.random() * 200);
  var b = Math.floor(Math.random() * 200);
  return "rgb(" + r + "," + g + "," + b + ")";
};

function maskItems(arr: any, values: any) {
  const maskedArr: Array<string | null> = [];

  for (const val of arr) {
    var index = values.indexOf(val);
    if (index == -1) {
      maskedArr.push(val);
    } else {
      maskedArr.push(null);
    }
  }
  return maskedArr;
}

export function CovidDataExplorer() {
  // initially loaded data
  const [data, setData] = useState<Array<any>>([]);
  const [locations, setLocations] = useState<Array<string>>([]);
  const [columns, setColumns] = useState<Array<string>>([]);

  // search stat
  const [columnValue, setColumnValue] = useState([]);
  const [columnInputValue, setColumnInputValue] = useState("");
  const [locationValue, setLocationValue] = useState([]);
  const [locationLabel, setLocationLabel] = useState("Locations loading ...");
  const [locationInputValue, setLocationInputValue] = useState("");

  const [selectedDatasets, setSelectedData] = useState<
    Array<{ label: string; labels: any; data: any }>
  >([]);

  // plot state
  const [plotData, setPlotData] = useState({});
  const [plotRelative, setPlotRelative] = useState<boolean>(false);

  // initial data load
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const timeoutIdsToCancel: Array<any> = [];
    const pushTimeoutIdsToCancel = (newId: any) => {
      timeoutIdsToCancel.push(newId);
    };

    fetch(dataFileUrl, { signal })
      .then((resp: Response) => resp.text())
      .then(extractColumnsFromCsvString)
      .then(extractCountriesAndParseCSVFactory(pushTimeoutIdsToCancel))
      .catch((err) => console.log(err));

    return () => {
      controller.abort();
      for (const timeoutId of timeoutIdsToCancel) {
        clearTimeout(timeoutId);
      }
      setData([]);
    };
  }, []);

  const extractColumnsFromCsvString = (csv: string) => {
    const endOfFirstLineIndex: number = csv.indexOf("\n");
    const allColumns: Array<string> = csv
      .slice(0, endOfFirstLineIndex)
      .split(",");
    const maskedColumns: Array<string | null> = maskItems(allColumns, [
      "iso_code",
      "continent",
      "location",
      "date",
    ]);
    const columns: any = maskedColumns.filter((col) => col);
    setColumns(columns);
    return { csv, allColumns };
  };

  const extractCountriesAndParseCSVFactory = (pushTimeoutIdsToCancel: any) => {
    const extractCountriesAndParseCSV = ({
      csv,
      allColumns,
    }: {
      csv: string;
      allColumns: Array<string | null>;
    }) => {
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
      const chunkSize: number = 1000;
      for (var i = 0; i < csvLineArray.length; i += chunkSize) {
        const newlineIfMoreData =
          i < csvLineArray.length - chunkSize ? "\n" : "";
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
    return extractCountriesAndParseCSV;
  };

  /* ------------------ behaviour ---------------------- */
  // value change handler
  const onChangeHandlerFactor = (
    value: Array<string>,
    setValue: Dispatch<SetStateAction<never[]>>
  ) => {
    const onChangeHandler = (event: any, newValue: any, reason: string) => {
      setValue(newValue);
    };
    return onChangeHandler;
  };

  useEffect(() => {
    const locations = getLocations(data);
    setLocations(locations);
  }, [data]);

  useEffect(() => {
    setSelectedData(getSearchedData(data, columnValue, locationValue));
  }, [columnValue, locationValue]);

  // update plot data
  useEffect(() => {
    const unifiedLabels = getUnifiedLabelsFromDatasets(selectedDatasets);

    // fill all datasets with zeros for dates where no data exists
    var plotDatasets = getPlotDatasets(
      selectedDatasets,
      unifiedLabels,
      plotRelative
    );

    const plotData = {
      labels: unifiedLabels,
      datasets: plotDatasets,
    };

    if (plotRelative) {
      plotData.datasets = normalizePlotDatasets(plotData.datasets);
    }

    setPlotData(plotData);
  }, [selectedDatasets, plotRelative]);

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        m={2}
      >
        <Box m={1}>
          <Typography>Show</Typography>
        </Box>

        <Autocomplete
          multiple
          id="searchColumn"
          inputValue={columnInputValue}
          onInputChange={(event, newValue) => setColumnInputValue(newValue)}
          value={columnValue}
          onChange={onChangeHandlerFactor(columnValue, setColumnValue)}
          options={columns}
          debug
          freeSolo
          filterSelectedOptions
          style={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Metric" variant="outlined" />
          )}
        />

        <Box m={1}>
          <Typography>in</Typography>
        </Box>

        <Autocomplete
          multiple
          id="searchCountry"
          inputValue={locationInputValue}
          onInputChange={(event, newValue) => setLocationInputValue(newValue)}
          value={locationValue}
          onChange={onChangeHandlerFactor(locationValue, setLocationValue)}
          options={locations}
          filterSelectedOptions
          style={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label={locationLabel} variant="outlined" />
          )}
          debug
          freeSolo
        />
        <Box pt={3}>
          <FormControlLabel
            control={
              <Checkbox
                name="checkedC"
                value={plotRelative}
                onChange={(event) => setPlotRelative(event.target.checked)}
              />
            }
            label="Show relative values"
          />
        </Box>
      </Box>
      <Line data={plotData} type={null} />

      <Typography>
        All data due to{" "}
        <Link href="https://www.ourworldindata.org">Our World in Data</Link>.
        Covid data taken from the{" "}
        <Link href="https://www.github.com/owid/covid-19-data/tree/master/public/data">
          Our World in Data Covid-19 data github repository
        </Link>
        . <br />
        Testing data from Hasell, J., Mathieu, E., Beltekian, D. <i>et al.</i> A
        cross-country database of COVID-19 testing. Sci Data 7, 345 (2020).{" "}
        <Link href="https://doi.org/10.1038/s41597-020-00688-8">
          https://doi.org/10.1038/s41597-020-00688-8
        </Link>
      </Typography>
    </Container>
  );
}
