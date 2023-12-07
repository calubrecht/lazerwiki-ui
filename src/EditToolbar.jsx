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
         let headerLevel = this.getHeaderLevel(currentText, selectStart);
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
         let listLevel = this.getListLevel(currentText, selectStart);
         this.replaceSelectionText(startNLIfNeeded + listLevel + '-', '\n', 'List Item');
      }},
      {name:"Unordered List", icon:"ulist.png", click:() => {
         let area = this.getTextArea();
         let currentText = this.props.getCurrentText();
         let selectStart = area.selectionStart;
         let startNLIfNeeded = selectStart == 0 || currentText[selectStart-1] == '\n' ? '' : '\n';
         let listLevel = this.getListLevel(currentText, selectStart);
         this.replaceSelectionText(startNLIfNeeded + listLevel + '*', '\n', 'List Item');
      }},
      {name:"Page Link", icon:"addPage.png", click:() => {
        this.setState({showFrame:PageFrame, selectItem:p => this.addPageLink(p)});
      }},
      {name:"Image", icon:"addImage.png", click:() => {
        this.setState({showFrame:MediaFrame, selectItem: p => this.addImageLink(p)});
      }},
      
    ];
    let pluginActions = LAZERWIKI_PLUGINS;
    for (let action of pluginActions) {
      let btn = {name: action.name, icon: action.icon,
        click: () => {
         let area = this.getTextArea();
         let currentText = this.props.getCurrentText();
         let selectStart = area.selectionStart;
         let selectEnd = area.selectionEnd;
         let newStart = selectStart;
         let newEnd = selectEnd;
         let actionReturn = action.script(currentText, selectStart, selectEnd, this.props.namespace, this.props.pageName);
         let replacement = currentText;
         if (actionReturn.action === 'insert') {
           if (actionReturn.location === -1) {
             replacement = currentText + actionReturn.value;
             newStart = newEnd = replacement.length -1;
           }
           else {
             replacement = currentText.slice(0, actionReturn.location) + actionReturn.value + currentText.slice(actionReturn.location);
             newStart = newEnd = actionReturn.location + actionReturn.value;
           }
         }
         if (actionReturn.action === 'replace') {
             replacement = currentText.slice(0, actionReturn.location) + actionReturn.value + currentText.slice(actionReturn.locationEnd);
             newStart = newEnd = actionReturn.locationEnd + actionReturn.value;
         }
         if (actionReturn.action === 'replaceAll') {
             replacement = actionReturn.value;
             newStart = newEnd = actionReturn.value.length-1;
         }
         if (actionReturn.action === 'none') {
           return;
         }
         this.refreshFocus(area, newStart, newEnd);
         this.props.setText(replacement);
        }};
      this.buttons.push(btn);
    }
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
       let newEnd = selectEnd;
       let newStart = selectStart;
       if (selectStart == selectEnd) {
         // No selection, add header at this point
         currentText = currentText.slice(0, selectStart) + startToken + defaultInside +  endToken + currentText.slice(selectStart);
         newStart = selectStart + startToken.length;
         newEnd = selectStart + startToken.length + defaultInside.length;
       }
       else {
         currentText = currentText.slice(0, selectStart) + startToken + currentText.slice(selectStart, selectEnd) + endToken + currentText.slice(selectEnd);
         newStart = newEnd=selectEnd + startToken.length + endToken.length;
       }
       area.value=currentText;
       this.refreshFocus(area, newStart, newEnd);
       this.props.setText(currentText);
  }
  
  replaceWholeSelectionText(replacement) {
       let area = this.getTextArea();
       let currentText = this.props.getCurrentText();
       let selectStart = area.selectionStart;
       let selectEnd = area.selectionEnd;
       currentText = currentText.slice(0, selectStart) + replacement + currentText.slice(selectEnd);
       let newEnd = selectStart + replacement.length;
       area.value = currentText;
       this.refreshFocus(area, newEnd, newEnd);
       this.props.setText(currentText);
  }

  refreshFocus(area, selectStart, selectEnd){
       area.setSelectionRange(selectEnd, selectEnd);
       area.blur();
       area.focus();
       area.setSelectionRange(selectStart, selectEnd);
  }

  addPageLink(p) {
    this.setState({showFrame:null});
    this.replaceSelectionText('[[' + p + '|', ']]', '');
  }
  
  addImageLink(i) {
    this.setState({showFrame:null});
    this.replaceSelectionText('{{' + i + '|', '}}', '');
  }
  
  getPreviousLine(text, start) {
    if (start == 0) {
      return ["", -1];
    }
    let newlines = [];
    for (let i = start; i >= 0; i--) {
      if (text[i] == '\n') {
        newlines.push(i);
      }
      if (newlines.length == 2) {
        return [text.slice(newlines[1]+1, newlines[0]-1), newlines[1]];
      }
    }
    if (newlines.length ==1) {
      return [text.slice(0, start-1), 0];
    }
    return [text.slice(0, start), 0];
  }

  getHeaderLevel(fullText, selectionStart) {
    let [previousLine, newPosition] = this.getPreviousLine(fullText, selectionStart);
    const headerRE = /^ *(={2,6}).*={2,6} *$/;
    while (newPosition >= 0) {
      let m = previousLine.match(headerRE);
      if (m) {
        return m[1];
      }
      [previousLine, newPosition] = this.getPreviousLine(fullText, newPosition);
    }
    return "======"
  }
  
  getListLevel(fullText, selectionStart) {
    if (fullText[selectionStart] == '\n') {
      selectionStart = selectionStart -1;
    }
    let [previousLine, newPosition] = this.getPreviousLine(fullText, selectionStart);
    const headerRE = /^( *)[-*].*$/;
    let m = previousLine.match(headerRE);
    if (m) {
      return m[1];
    }
    return " "
  }
}
