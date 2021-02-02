import { useEffect } from 'react';
import './App.css';

import {CoronaSearchBar} from "./components/SearchBar.tsx"

function App() {

  useEffect(() => {
    document.title = "OWID Corona Data Explorer";

  }, [])

  return (
    <div className="App">
      <CoronaSearchBar/>
    </div>
  );
}

export default App;
