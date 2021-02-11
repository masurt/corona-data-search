import { Box, Button, Link, Typography } from "@material-ui/core";
import React, { useState, useEffect } from "react";

import { grapherLinkStrings } from "./GrapherLinks";

const grapherBaseUrl = "https://ourworldindata.org/grapher/";

const getRandomString = () => {
  const randIndex = Math.floor(Math.random() * grapherLinkStrings.length);
  return grapherLinkStrings[randIndex];
};

const replaceAll = (s: string, r1: string, r2: string) => {
  var newString = s;
  while (newString.replace(r1, r2) !== newString) {
    newString = newString.replace(r1, r2);
  }
  return newString;
};

export function RandomOWIDGraph() {
  const [randomGraphString, setRandomGraphString] = useState<string>("");

  useEffect(() => {
    setRandomGraphString(getRandomString());
  }, []);

  return (
    <div>
      <Box m={2}>
        <Button
          onClick={() => setRandomGraphString(getRandomString())}
          variant="outlined"
        >
          New random graph
        </Button>
      </Box>
      {randomGraphString !== "" ? (
        <div>
          <Box m={2}>
            <Typography>
              {"For further info visit: "}
              <Link href={grapherBaseUrl + randomGraphString}>
                {grapherBaseUrl + randomGraphString}
              </Link>
            </Typography>
          </Box>
          <iframe
            src={grapherBaseUrl + randomGraphString}
            loading="lazy"
            style={{ width: "100%", height: "600px", border: "600px none" }}
          ></iframe>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
