import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';

import './EditableTextbox.css';



export default class EditableToolbar extends Component
{
  constructor(props) {
    super(props);
    this.getTextArea = () => document.getElementById("pageSource");
    this.buttons = [
      {name:"Add Header", icon:"toolbar/addHeader.png", click:() => {
         let area = this.getTextArea();
         let currentText = this.props.getCurrentText();
         let selectStart = area.selectionStart;
         let selectEnd = area.selectionEnd;
         let startNLIfNeeded = selectStart == 0 || currentText[selectStart-1] == '\n' ? '' : '\n';
         // Get current level of header....
         let headerLevel = "======";
         if (selectStart == selectEnd) {
           // No selection, add header at this point
           currentText = currentText.slice(0, selectStart) + startNLIfNeeded  + headerLevel + "Header" + headerLevel + "\n" + currentText.slice(selectStart);
         }
         else {
           // No selection, add header at this point
           currentText = currentText.slice(0, selectStart) + startNLIfNeeded  + headerLevel + currentText.slice(selectStart, selectEnd) + headerLevel + "\n" + currentText.slice(selectEnd);
         }
         this.props.setText(currentText);
      }}
    ]
  }
  
  render()
  {
    return <div className="editToolbar">{this.renderButtons()}</div>
  }

  renderButtons() {
    return this.buttons.map( (def) => <span onClick={def.click} title={def.name} key={def.name}>{def.name}</span>);

  }


}
