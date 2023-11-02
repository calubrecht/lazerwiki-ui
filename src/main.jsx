import React, {createContext} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import UserWidget from './UserWidget';

function Toolbar()
  {
    return "I'm a toolbar";
  };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
const toolbar = ReactDOM.createRoot(document.getElementById('toolbar'));
toolbar.render(
    <Toolbar />
);
const userWidget = ReactDOM.createRoot(document.getElementById('userWidget'));
userWidget.render(
    <UserWidget />
);
