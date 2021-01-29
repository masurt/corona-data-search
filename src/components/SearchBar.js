import * as d3 from "d3";

import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { Button, Typography } from '@material-ui/core'

import React, { useState, useEffect } from 'react';
import { Line } from '@reactchartjs/react-chart.js'

import { getSearchedData, getLocations, getColumns } from "./DataLoader"

const dataFileUrl = 'https://covid.ourworldindata.org/data/owid-covid-data.csv'


export function CoronaSearchBar() {
  const [searchOptions, setSearchOptions] = useState([])
  const [searchString, setSearchString] = useState("")
  
  // state for search progress
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedData, setSelectedData] = useState([])

  // data
  const [data, setData] = useState([])
  const [locations, setLocations] = useState([])
  const [columns, setColumns] = useState([])
  
  // plot state
  const [plotData, setPlotData] = useState({})

  useEffect(() => {
    if(!selectedColumn && !selectedLocation){
      setSearchOptions([])
    } else if (selectedColumn && !selectedLocation) {
      console.log("setting columns", columns)
      setSearchOptions(columns)
    } else if (selectedColumn && selectedLocation) {
      console.log("setting location")
      setSearchOptions(locations.map(loc => selectedColumn + ' ' + loc))
    } else {
      setSearchOptions([])
    }
  }, [selectedColumn, selectedLocation])

  const onChangeHandler = (event, newValue) => {
    setSearchString(newValue)
  }

  useEffect(() => {
    const searchArray = searchString.split(' ').filter(s => s !== '')
    if(searchArray.length == 0)
    {
      console.log("search array empty")
      setSelectedColumn(null)
      setSelectedLocation(null)
    } 
    else if(searchArray.length === 1)
    {
      setSelectedColumn(searchArray[0])
      setSelectedLocation(null)
    } 
    else if(searchArray.length >= 2)
    {
      setSelectedColumn(searchArray[0])
      setSelectedLocation(searchArray[1])
    }
  }, [searchString])

  const onClickHandler = () => {
    const searchArray = searchString.split(' ').filter(s => s !== '')
    setSelectedData(getSearchedData(data, searchArray[0], searchArray[1]))
  }

  useEffect(() => {
    async function fetchData() {
      const data = await d3.csv(dataFileUrl);
      setData(data)
      setLocations(getLocations(data))
      setColumns(getColumns(data))
    }
    fetchData()
  }, []);


  useEffect(() => {
    console.log(selectedData)
    const plotData = {
      labels: selectedData.map((dat) => dat['date']),
      datasets: [
        {
          label: selectedColumn,
          data: selectedData.filter(dat => (dat != "")).map((dat) => +dat[selectedColumn]),
          fill: false,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgba(255, 99, 132, 0.2)',
        },
      ],
    }
    setPlotData(plotData)
  }, [selectedData])

  return (
    <div>
        The search bar goes 
        <Autocomplete
          id="freeSoloDemo"
          inputValue={searchString}
          debug
          freeSolo
          disableClearable
          options={searchOptions}
          onInputChange={onChangeHandler}
          style={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Search" variant="outlined" />}
        />
        <br/>
        <Button
          onClick={onClickHandler}
        >Search</Button>
        <Line data={plotData}/>
        <Typography> {(!plotData) ? "No data selected." : JSON.stringify(plotData)} </Typography>
        <Typography> {(!selectedData || selectedData.length === 0)  ?  "No data selected." : JSON.stringify(selectedData)} </Typography>
    </div>
  );
}

