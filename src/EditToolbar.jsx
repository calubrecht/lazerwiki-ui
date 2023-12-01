import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import PageFrame from './PageFrame';
import MediaFrame from './MediaFrame';

import './EditableTextbox.css';



export default class EditToolbar extends Component
{
  constructor(props) {
    super(props);
    this.state= {showFrame: null};
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
      {name:"Page Link", icon:"addPage.png", click:() => {
        this.setState({showFrame:PageFrame, selectItem:p => this.addPageLink(p)});
      }},
      {name:"Image", icon:"addImage.png", click:() => {
        this.setState({showFrame:MediaFrame, selectItem: p => this.addImageLink(p)});
      }},
      
    ]
  }
  
  render()
  {
    return <div className="editToolbar">{this.renderButtons()}{this.renderFrames()}</div>
  }

  renderButtons() {
    return this.buttons.map( (def) => <span className="button" onClick={def.click} title={def.name} key={def.name}>
      <img src={"/_resources/" + def.icon} alt={def.name}/></span>);

  }

  renderFrames() {
    if (!this.state.showFrame) {
      return ;
    }
    return <this.state.showFrame doClose={() => this.setState({showFrame: null})} selectItem={this.state.selectItem} namespace={this.props.namespace}/>
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

  addPageLink(p) {
    this.setState({showFrame:null});
    this.replaceSelectionText('[[' + p + '|', ']]', '');
  }
  
  addImageLink(i) {
    this.setState({showFrame:null});
    this.replaceSelectionText('{{' + i + '|', '}}', '');
  }
}
