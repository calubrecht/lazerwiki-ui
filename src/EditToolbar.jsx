import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';

import './EditableTextbox.css';



export default class EditableToolbar extends Component
{
  constructor(props) {
    super(props);
    this.buttons = [
      {name:"Add Header", icon:"header.png", click:() => {
         let area = this.getTextArea();
         let currentText = this.props.getCurrentText();
         let selectStart = area.selectionStart;
         let startNLIfNeeded = selectStart == 0 || currentText[selectStart-1] == '\n' ? '' : '\n';
         // Get current level of header....
         let headerLevel = "======";
         this.replaceSelectionText(startNLIfNeeded + headerLevel, headerLevel + '\n', "Header");
      }},
      {name:"Bold", icon:"bold.png", click:() => {
         this.replaceSelectionText("**","**", "Bold");
      }},
      {name:"Italic", icon:"italic.png", click:() => {
         this.replaceSelectionText("//","//", "Italic");
      }},
      {name:"Ordered List", icon:"olist.png", click:() => {
         let area = this.getTextArea();
         let currentText = this.props.getCurrentText();
         let selectStart = area.selectionStart;
         let startNLIfNeeded = selectStart == 0 || currentText[selectStart-1] == '\n' ? '' : '\n';
         let listLevel = ' '; // Lookback for previous level
         this.replaceSelectionText(startNLIfNeeded + listLevel + '-', '\n', 'List Item');
      }},
      {name:"Unordered List", icon:"ulist.png", click:() => {
         let area = this.getTextArea();
         let currentText = this.props.getCurrentText();
         let selectStart = area.selectionStart;
         let startNLIfNeeded = selectStart == 0 || currentText[selectStart-1] == '\n' ? '' : '\n';
         let listLevel = ' '; // Lookback for previous level
         this.replaceSelectionText(startNLIfNeeded + listLevel + '*', '\n', 'List Item');
      }},
      
    ]
  }
  
  render()
  {
    return <div className="editToolbar">{this.renderButtons()}</div>
  }

  renderButtons() {
    return this.buttons.map( (def) => <span className="button" onClick={def.click} title={def.name} key={def.name}>
      <img src={"/_resources/" + def.icon} alt={def.name}/></span>);

  }

  
  getTextArea() {
    return document.getElementById("pageSource");
  }
  replaceSelectionText(startToken, endToken, defaultInside) {
       let area = this.getTextArea();
       let currentText = this.props.getCurrentText();
       let selectStart = area.selectionStart;
       let selectEnd = area.selectionEnd;
       if (selectStart == selectEnd) {
         // No selection, add header at this point
         currentText = currentText.slice(0, selectStart) + startToken + defaultInside +  endToken + currentText.slice(selectStart);
       }
       else {
         // No selection, add header at this point
         currentText = currentText.slice(0, selectStart) + startToken + currentText.slice(selectStart, selectEnd) + endToken + currentText.slice(selectEnd);
       }
       this.props.setText(currentText);
  }

}
