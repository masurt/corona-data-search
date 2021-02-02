import * as d3 from "d3";

import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { Button, Typography, Box, Link } from '@material-ui/core'

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Line } from '@reactchartjs/react-chart.js'

import { getSearchedData, getLocations, getColumns } from "./DataLoader"

const dataFileUrl = 'https://covid.ourworldindata.org/data/owid-covid-data.csv'

var randomColor = function() {
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return "rgb(" + r + "," + g + "," + b + ")";
};

export function CoronaSearchBar() {
  // initially loaded data
  const [data, setData] = useState<Array<any>>([])
  const [locations, setLocations] = useState<Array<string>>([])
  const [columns, setColumns] = useState<Array<string>>([])

  // search stat
  const [columnValue, setColumnValue] = useState([])
  const [columnInputValue, setColumnInputValue] = useState("")
  const [locationValue, setLocationValue] = useState([])
  const [locationInputValue, setLocationInputValue] = useState("")

  const [selectedDatasets, setSelectedData] 
    = useState < Array<( { label : string, labels: any, data: any })> >
      ([])

  // plot state
  const [plotData, setPlotData] = useState({})

  // initial data load
  useEffect(() => {
    async function fetchData() {
      const data = await d3.csv(dataFileUrl);
      setData(data)
      setLocations(getLocations(data))
      setColumns(getColumns(data))
    }
    fetchData()
    
  }, []);

  /* ------------------ behaviour ---------------------- */
  // value change handler
  const onChangeHandlerFactor = (
    value : Array<string>,
    setValue : Dispatch<SetStateAction<never[]>>
  ) => {
    const onChangeHandler = (event: any, newValue: any, reason : string) => {
      setValue(newValue)
    };
    return onChangeHandler
  }

  // search button click handler
  const onClickHandler = () => {
    setSelectedData(getSearchedData(data, columnValue, locationValue))
  }

  // update plot data
  useEffect(() => {
    // unify labels from all datasets
    var unifiedLabels : string[] = []
    for(const dataset of selectedDatasets){
      unifiedLabels = unifiedLabels.concat(dataset.labels)
    }    
    unifiedLabels = Array.from(new Set(unifiedLabels))
    unifiedLabels.sort()

    // fill all datasets with zeros for dates where no data exists
    const plotDatasets = []
    for(const dataset of selectedDatasets){

      const plotDataset : any = {label: dataset.label, 
        data: [],
        borderColor: randomColor(), 
        fill: false}

      for(const label of unifiedLabels){
        const labelIndex : number = dataset.labels.indexOf(label)
        if(labelIndex > -1){
          plotDataset.data.push(dataset.data[labelIndex])
        } else {
          plotDataset.data.push(0)
        }
      }
      plotDatasets.push(plotDataset)
    }
  
    const plotData = {
      labels : unifiedLabels,
      datasets: plotDatasets
    }
    setPlotData(plotData)
  }, [selectedDatasets])



  return (
    <div>
        <h1>
          Be water, my friend!
        </h1>
        <Typography>
          Credit to <Link href='https://www.ourworldindata.org'>Our World in Data</Link>.
           Data taken from the <Link href='https://www.github.com/owid/covid-19-data/tree/master/public/data'>Our World in Data covid-19-data github repository</Link>. 
        </Typography>
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='flex-start'
          alignItems='center'
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
            renderInput={(params) => <TextField {...params} label="Metric" variant="outlined" />}
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
            renderInput={(params) => <TextField {...params} label="Country" variant="outlined" />}
            debug
            freeSolo
          />
          <br/>
          
          <Box m={2}>
            <Button
              onClick={onClickHandler}
              variant="outlined"
            >Load</Button>
          </Box>  
        </Box>
        <Line data={plotData} type={null}/>
    </div>
  );
}

