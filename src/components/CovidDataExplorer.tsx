import * as d3 from "d3";

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

export function CovidDataExplorer() {
  // initially loaded data
  const [data, setData] = useState<Array<any>>([]);
  const [locations, setLocations] = useState<Array<string>>([]);
  const [columns, setColumns] = useState<Array<string>>([]);

  // search stat
  const [columnValue, setColumnValue] = useState([]);
  const [columnInputValue, setColumnInputValue] = useState("");
  const [locationValue, setLocationValue] = useState([]);
  const [locationInputValue, setLocationInputValue] = useState("");

  const [selectedDatasets, setSelectedData] = useState<
    Array<{ label: string; labels: any; data: any }>
  >([]);

  // plot state
  const [plotData, setPlotData] = useState({});
  const [plotRelative, setPlotRelative] = useState<boolean>(false);

  // initial data load
  useEffect(() => {
    d3.csv(dataFileUrl)
      .then((data) => {
        setData(data);
        setLocations(getLocations(data));
        setColumns(getColumns(data));
      })
      .then(() => () => setData([]));
  }, []);

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
    setSelectedData(getSearchedData(data, columnValue, locationValue));
  }, [data, columnValue, locationValue]);

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
            <TextField {...params} label="Country" variant="outlined" />
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
    </Container>
  );
}
