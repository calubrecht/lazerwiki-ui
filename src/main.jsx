import React, {createContext} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import UserWidget from './UserWidget';
import Toolbar from './Toolbar';
import {instance as DS_instance} from './svc/DataService';


DS_instance().init();

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
