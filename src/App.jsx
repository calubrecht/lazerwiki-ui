import React from 'react';
import './App.css';
import RootFrame from './rootFrame';

let pluginScript = document.createElement("script");
pluginScript.setAttribute("src", "/_resources/js/pluginJS.js");
document.body.appendChild(pluginScript);

function App() {
  return (
    <div className="App">
     <RootFrame/>
    </div>
  );
}

export default App;
