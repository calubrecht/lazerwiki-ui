import React, {useEffect} from 'react';
import './App.css';
import {RootFrame} from './rootFrame';

function VersionLog() {
  useEffect(() => {
    fetch('/meta.json')
      .then((response) => response.json())
      .then((meta) => {
         console.log(`Version - ${meta.version}`);
      });
  });
  return "";
}

function App() {
  return (
    <div className="App">
     <RootFrame/>
     <VersionLog/>
    </div>
  );
}

export default App;
