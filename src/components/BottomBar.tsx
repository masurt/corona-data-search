import {
  Typography,
  Link,
  makeStyles,
  CssBaseline,
  Grid,
  Box,
} from "@material-ui/core";

import React from "react";

const useStyles = makeStyles((theme) => ({
  "@global": {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
  },
  footer: {
    borderTop: `2px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },
}));

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © Exploring OWID by Tilman Masur "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export function BottomBar() {
  const classes = useStyles();

  return (
    <>
      <CssBaseline></CssBaseline>
      <Box className={classes.footer}>
        <Grid container spacing={4} justify="space-evenly">
          <Grid item xs={6} sm={3}>
            <Typography>
              All data due to{" "}
              <Link href="https://www.ourworldindata.org">
                Our World in Data
              </Link>
              . Covid Data taken from the{" "}
              <Link href="https://www.github.com/owid/covid-19-data/tree/master/public/data">
                Our World in Data covid-19-data github repository
              </Link>
              .
            </Typography>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Copyright />
          <h3>Be water, my friend!</h3>
        </Box>
      </Box>
    </>
  );
}
