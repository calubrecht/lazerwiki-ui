import React, {Component} from 'react';
import DataService, {instance as DS_instance} from './svc/DataService';
import PageFrame from './PageFrame';
import MediaFrame from './MediaFrame';

import './EditableTextbox.css';



export default class EditToolbar extends Component
{
  constructor(props) {
    super(props);
    this.state= {showFrame: null, selectedBtn: null};
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
        if (this.state.selectedBtn === 'Page Link') {
          this.clearFrame();
          return;
        }
        this.setState({selectedBtn: "Page Link", showFrame:PageFrame, selectItem:p => this.addPageLink(p)});
      }},
      {name:"Image", icon:"addImage.png", click:() => {
        if (this.state.selectedBtn === 'Image') {
          this.clearFrame();
          return;
        }
        this.setState({selectedBtn: "Image", showFrame:MediaFrame, selectItem: (p, alignment) => this.addImageLink(p, alignment)});
      }}
      
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
           if (actionReturn.atCursor) {
            replacement = currentText.slice(0, selectStart) + actionReturn.value + currentText.slice(selectEnd);
            currentText + actionReturn.value;
            newEnd = newStart + actionReturn.value.length - (newEnd - newStart);
           } 
           else if (actionReturn.location === -1) {
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
         area.value = replacement;
         this.refreshFocus(area, newEnd, newEnd);
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
    return this.buttons.map( (def) => {
      let className = "toolbar-button button-unstyled" + (this.state.selectedBtn == def.name ? " open" :"");
      return <button className={className} onClick={def.click} title={def.name} key={def.name}>
      <img src={"/_resources/" + def.icon} alt={def.name}/></button>; });

  }

  renderFrames() {
    if (!this.state.showFrame) {
      return ;
    }
    return <this.state.showFrame doClose={() => this.clearFrame()} selectItem={this.state.selectItem} namespace={this.props.namespace}/>
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
  
  refreshFocus(area, selectStart, selectEnd){
       area.setSelectionRange(selectEnd, selectEnd);
       area.blur();
       area.focus();
       area.setSelectionRange(selectStart, selectEnd);
  }

  addPageLink(p) {
    this.clearFrame();
    this.replaceSelectionText('[[' + p + '|', ']]', '');
  }
  
  addImageLink(i, alignment) {
    this.clearFrame();
    let alignmentPre = (alignment === "Center" || alignment === "Right") ? " " : "";
    let alignmentPost = (alignment === "Center" || alignment === "Left") ? " " : "";
    this.replaceSelectionText('{{' + alignmentPre + i + alignmentPost + '|', '}}', '');
  }

  clearFrame() {
    this.setState({showFrame:null, selectedBtn: null});
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
        return [text.slice(newlines[1]+1, newlines[0]), newlines[1]];
      }
    }
    return [text.slice(0, start), 0];
  }

  getCurrentLine(text, start) {
    let lineStart = -1;
    let lineEnd = text.length-1;
    for (let lookBack = start; lookBack >= 0; lookBack--) {
      if (text[lookBack] == '\n') {
        break;
      }
      lineStart = lookBack;
    }
    for (let lookFwd = start; lookFwd < text.length; lookFwd++) {
      if (text[lookFwd] == '\n') {
        lineEnd = lookFwd - 1;
        break;
      }
      lineEnd = lookFwd;
    }
    return [text.slice(lineStart, lineEnd + 1), lineStart];
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
    let defaultIndent = " ";
    if (fullText[selectionStart] == '\n') {
      selectionStart = selectionStart -1;
    }
    if (selectionStart == 0) {
      return defaultIndent;
    }
    const listRE = /^( *)[-*].*$/;
    let [currentLine, currentPosition] = this.getCurrentLine(fullText, selectionStart);
    let m = currentLine.match(listRE);
    if (m) {
      return m[1];
    }
    // Only examine previous line if at start of a line
    if (fullText[selectionStart-1] == '\n') {
      let [previousLine, newPosition] = this.getPreviousLine(fullText, selectionStart);
      m = previousLine.match(listRE);
      if (m) {
        return m[1];
      }
    }
    return defaultIndent;
  }
}
