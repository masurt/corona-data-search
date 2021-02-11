import {
  Typography,
  Box,
  AppBar,
  Toolbar,
  makeStyles,
  CssBaseline,
  Button,
} from "@material-ui/core";

import { HashRouter as Router, NavLink } from "react-router-dom";

import React from "react";

const useStyles = makeStyles((theme) => ({
  "@global": {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
  },
  appBar: {
    display: "flex",
    borderBottom: `2px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(4),
  },
  toolbar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  toolbarTitle: {
    //alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 4,
  },
  link: {
    alignSelf: "flex-end",
    margin: theme.spacing(1, 1.5),
  },
}));

export function TopBar() {
  const classes = useStyles();

  return (
    <>
      <CssBaseline></CssBaseline>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        className={classes.appBar}
      >
        <Toolbar className={classes.toolbar}>
          <Typography
            variant="h6"
            color="inherit"
            noWrap
            className={classes.toolbarTitle}
          >
            Exploring Our World in Data
          </Typography>
          <Box style={{ display: "flex", flexDirection: "row" }}>
            <Router>
              <NavLink to="covid-search" className={classes.link}>
                <Button>Covid Data Explorer</Button>
              </NavLink>
              <NavLink to="random-graph" className={classes.link}>
                <Button>Random OWID Graph</Button>
              </NavLink>
            </Router>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}
