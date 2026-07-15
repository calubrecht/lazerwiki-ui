import React, { useEffect } from 'react';
import './App.css';
import './printer.css';
import RootFrame from './rootFrame';

let pluginScript = document.createElement("script");
pluginScript.setAttribute("src", "/_resources/js/pluginJS.js");
document.body.appendChild(pluginScript);

function App() {
  // Dialogs are shown via showModal(), which doesn't stop wheel/PageUp/PageDown
  // from scrolling the page behind them. Lock document scroll whenever any
  // dialog is open, so scroll input can't reach the underlying page.
  useEffect(() => {
    const updateScrollLock = () => {
      const dialogOpen = !!document.querySelector('dialog[open]');
      document.documentElement.style.overflow = dialogOpen ? 'hidden' : '';
      document.body.style.overflow = dialogOpen ? 'hidden' : '';
    };
    const observer = new MutationObserver(updateScrollLock);
    observer.observe(document.body, {attributes: true, attributeFilter: ['open'], subtree: true});
    updateScrollLock();
    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
     <RootFrame/>
    </div>
  );
}

export default App;
