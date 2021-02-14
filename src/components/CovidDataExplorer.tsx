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

import {
  loadCovidCsv,
  getSearchedData,
  getLocations,
} from "./CovidDataHelpers";
import { getPlotData } from "./PlotHelpers";

const autocompleteProps = {
  debug: true,
  freeSolo: true,
  filterSelectedOptions: true,
  style: { width: 500 },
};

export function CovidDataExplorer() {
  // initially loaded data
  const [data, setData] = useState<Array<any>>([]);
  const [locations, setLocations] = useState<Array<string>>([]);
  const [columns, setColumns] = useState<Array<string>>([]);

  // search state
  // array of selected columns
  const [columnValue, setColumnValue] = useState([]);
  const [locationValue, setLocationValue] = useState([]);
  const [locationLabel, setLocationLabel] = useState("Locations loading ...");

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

    const cancelTimeoutsAndRequest = () => {
      controller.abort();
      for (const timeoutId of timeoutIdsToCancel) {
        clearTimeout(timeoutId);
      }
      setData([]);
    };

    loadCovidCsv(
      signal,
      pushTimeoutIdsToCancel,
      setData,
      setColumns,
      setLocationLabel
    );

    return cancelTimeoutsAndRequest;
  }, []);

  // search value change handler (for both fields)
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
    // set location options
    const locations = getLocations(data);
    setLocations(locations);
  }, [data]);

  useEffect(() => {
    // get data corresponding to selected column and location arrays
    setSelectedData(getSearchedData(data, columnValue, locationValue));
  }, [data, columnValue, locationValue]);

  // update plot data
  useEffect(() => {
    const plotData = getPlotData(selectedDatasets, plotRelative);

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
          value={columnValue}
          onChange={onChangeHandlerFactor(columnValue, setColumnValue)}
          options={columns}
          {...autocompleteProps}
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
          value={locationValue}
          onChange={onChangeHandlerFactor(locationValue, setLocationValue)}
          options={locations}
          renderInput={(params) => (
            <TextField {...params} label={locationLabel} variant="outlined" />
          )}
          {...autocompleteProps}
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
