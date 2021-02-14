import './App.css';

import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";


import {HomePage} from "./components/HomePage"
import {TopBar} from "./components/TopBar"
import {BottomBar} from "./components/BottomBar"
import {CovidDataExplorer} from "./components/CovidDataExplorer.tsx"
import {RandomOWIDGraph} from "./components/RandomOWIDGraph.tsx"

function App() {

  return (
    <div className="App">
      <TopBar/>
      <Router>
        <Switch>
          <Route exact path="/">
            <HomePage/>
          </Route>
          <Route path="/covid-explorer">
            <CovidDataExplorer/>
          </Route>
          <Route path="/random-graph">
            <RandomOWIDGraph/>
          </Route>
        </Switch>
      </Router>
      <BottomBar/>
    </div>
  );
}

export default App;
