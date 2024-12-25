import { render, screen, act, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditToolbar from '../EditToolbar';


beforeEach(() => {
  LAZERWIKI_PLUGINS = [];

});

test('renderBaseButtons', () => {
    render(<EditToolbar />);

    let btns = screen.getAllByRole("button");
    expect(btns.length).toBe(7);

    expect(screen.getByRole("button", {name:"Add Header"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name:"Bold"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name:"Italic"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name:"Ordered List"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name:"Unordered List"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name:"Page Link"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name:"Image"})).toBeInTheDocument();
});


test('renderPluginButtons', () => {
    LAZERWIKI_PLUGINS = [{
        name: "Burp",
        icon: "burp.png",
        click: null
    },
    {
        name: "Smile",
        icon: "smile.png",
        click: null
    }];
    render(<EditToolbar />);

    let btns = screen.getAllByRole("button");
    expect(btns.length).toBe(9);

    expect(screen.getByRole("button", {name:"Bold"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name:"Smile"})).toBeInTheDocument();
});

test('addHeader', async () => {
  let currentText = "Just a blank line";
  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let ta = screen.getByRole("textbox");
  ta.value = currentText;
  let max = currentText.length;
  ta.setSelectionRange(max, max);
  let btn = screen.getByRole("button", {name:"Add Header"});

  await userEvent.click(btn);

  expect(text).toBe("Just a blank line\n======Header======\n");
  expect(ta.selectionStart).toBe(24);
  expect(ta.selectionEnd).toBe(30);  // Select "Header" so it can be typed over

  // selection as 1st.
  ta.setSelectionRange(0, 0);
  await userEvent.click(btn);
  expect(text).toBe("======Header======\nJust a blank line");


  // Selection range, tur into header interior
  ta.setSelectionRange(7, 12);
  await userEvent.click(btn);
  expect(text).toBe("Just a \n======blank======\n line");
  expect(ta.selectionStart).toBe(26);
  expect(ta.selectionEnd).toBe(26);  // Selection moved to after header

  // Respect previous header level
  currentText = "FirstLine\n===Level 3 Header===\nLine after\n====Level 4 Header====";
  ta.value = currentText;
  ta.setSelectionRange(31,31);
  await userEvent.click(btn);
  expect(text).toBe("FirstLine\n===Level 3 Header===\n===Header===\nLine after\n====Level 4 Header====");

    // Single header on firs tline
    currentText = "===Level 3 Header===\nLine after\nAndAnother";
    ta.value = currentText;
    max = currentText.length;
    ta.setSelectionRange(max, max);
    await userEvent.click(btn);
    expect(text).toBe("===Level 3 Header===\nLine after\nAndAnother\n===Header===\n");

    // Level 2 Header
    currentText = "==Level 2 Header==\n\n";
    ta.value = currentText;
    max = currentText.length;
    ta.setSelectionRange(max, max);
    await userEvent.click(btn);
    expect(text).toBe("==Level 2 Header==\n\n==Header==\n");

    currentText = "Not first line\n==Level 2 Header==\n\n";
    ta.value = currentText;
    max = currentText.length;
    ta.setSelectionRange(max, max);
    await userEvent.click(btn);
    expect(text).toBe("Not first line\n==Level 2 Header==\n\n==Header==\n");
});

test('bold/italic', async () => {
  let currentText = "Just a blank line";
  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let ta = screen.getByRole("textbox");
  ta.value = currentText;
  let max = currentText.length;
  ta.setSelectionRange(7, 12);
  let btn = screen.getByRole("button", {name:"Bold"});

  await userEvent.click(btn);

  expect(text).toBe("Just a **blank** line");


  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  expect(text).toBe("Just a blank line**Bold**");

  btn = screen.getByRole("button", {name:"Italic"});
  ta.setSelectionRange(7, 12);

  await userEvent.click(btn);
  expect(text).toBe("Just a //blank// line");


  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  expect(text).toBe("Just a blank line//Italic//");

});

test('lists', async () => {
  let currentText = "  -Just a blank line";
  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let ta = screen.getByRole("textbox");
  ta.value = currentText;
  let max = currentText.length;

  let data = [["Ordered List", "-"], ["Unordered List", "*"]];

  for (let d of data) {
    let btn = screen.getByRole("button", {name:d[0]});
    let symbol = d[1];
    ta.setSelectionRange(max, max);
    await userEvent.click(btn);
    expect(text).toBe("  -Just a blank line\n  " + symbol + "List Item\n");
    ta.setSelectionRange(0, 0);
    await userEvent.click(btn);
    expect(text).toBe(" " + symbol + "List Item\n  -Just a blank line");

  }

  currentText = "\n";
  ta.setSelectionRange(0, 0);
  let btn = screen.getByRole("button", {name:"Ordered List"});
  await userEvent.click(btn);
  expect(text).toBe(" -List Item\n\n");

});

test('listsOtherCases', async () => {
  let currentText = "  -List in middle"


  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;
  let wait = async () => {};
  let check= async (input, expected, selectionStartOffset, selectionEndOffset) => {
    currentText = input;
    ta.value = input;
    let max = input.length -1;
    ta.setSelectionRange(max - selectionStartOffset, max - selectionEndOffset);
    await wait();
    await userEvent.click(btn);
    expect(text).toBe(expected);
  }

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let btn = screen.getByRole("button", {name:"Ordered List"});
  let ta = screen.getByRole("textbox");

  let defText = "\n  -List not on firstLine\n";
  await check(defText,defText + "  -List Item\n\n", 0 ,0);

  // Cursor is in middle of line, just add LI in place.
  await check(defText + " text\n",defText + " tex\n -List Item\nt\n", 1 ,1);

  // If Cursor at start of line, use previous line indent
  await check(defText + " text\n",defText + "  -List Item\n text\n", 5 ,5);
  // If Cursor at start of line of doc, use default ident
  await check(defText," -List Item\n\n  -List not on firstLine\n", defText.length-1 ,defText.length-1);

  // if selection is marking text
  await check(defText + "some item\nmoretext",defText + "  -some item\n\nmoretext", 17,8);

  await check(defText + "some item\nmoretext\n",defText + "some item\n -List Item\nmoretext\n",8,8);

});

let callSelectItem = null;
let doFrameClose = null;

jest.mock("../PageFrame", () => (props) => {
  callSelectItem = (item) => props.selectItem(item);
  doFrameClose = props.doClose;
  return "PageFrame";}
);

test('pageFrame', async () => {
  let currentText = "";
  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let ta = screen.getByRole("textbox");
  ta.value = currentText;
  let max = currentText.length;

  let btn = screen.getByRole("button", {name:"Page Link"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  expect(screen.getByText("PageFrame")).toBeInTheDocument();

  await act( () => callSelectItem("newPage"));
  expect(screen.queryByText("PageFrame")).not.toBeInTheDocument();

  
  expect(text).toBe("[[newPage|]]");

  userEvent.click(btn);
  await act(() => doFrameClose());
  expect(screen.queryByText("PageFrame")).not.toBeInTheDocument();

});

test('pageFrame clicking button again closes', async () => {
  let currentText = "";
  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let ta = screen.getByRole("textbox");
  ta.value = currentText;
  let max = currentText.length;

  let btn = screen.getByRole("button", {name:"Page Link"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  expect(screen.getByText("PageFrame")).toBeInTheDocument();

  await userEvent.click(btn);
  expect(screen.queryByText("PageFrame")).not.toBeInTheDocument();
});

jest.mock("../MediaFrame", () => (props) => {
  callSelectItem = (item, alignment, x, y) => props.selectItem(item, alignment, x, y);
  doFrameClose = props.doClose;
  return "MediaFrame";}
);

test('mediaFrame', async () => {
  let currentText = "";
  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let ta = screen.getByRole("textbox");
  ta.value = currentText;
  let max = currentText.length;

  let btn = screen.getByRole("button", {name:"Image"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  expect(screen.getByText("MediaFrame")).toBeInTheDocument();

  await act( () => callSelectItem("newImage", "Flow", null, null));
  expect(screen.queryByText("MediaFrame")).not.toBeInTheDocument();

  
  expect(text).toBe("{{newImage|}}");

  await act( () => callSelectItem("newImageLeft", "Left", null, null));
  expect(text).toBe("{{newImageLeft |}}");

  await act( () => callSelectItem("newImageRight", "Right", null, null));
  expect(text).toBe("{{ newImageRight|}}");

  await act( () => callSelectItem("newImageCenter", "Center", null, null));
  expect(text).toBe("{{ newImageCenter |}}");

  await act( () => callSelectItem("newImageCenter", "Flow", 10, null));
  expect(text).toBe("{{newImageCenter?10|}}");

  await act( () => callSelectItem("newImageCenter", "Flow", 10, 20));
  expect(text).toBe("{{newImageCenter?10x20|}}");

  await act( () => callSelectItem("newImageCenter", "Flow", null, 20));
  expect(text).toBe("{{newImageCenter?0x20|}}");

  await userEvent.click(btn);
  await act(() => doFrameClose());
  expect(screen.queryByText("MediaFrame")).not.toBeInTheDocument();

});

test('mediaFrame clicking button again closes', async () => {
  let currentText = "";
  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let ta = screen.getByRole("textbox");
  ta.value = currentText;
  let max = currentText.length;

  let btn = screen.getByRole("button", {name:"Image"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  expect(screen.getByText("MediaFrame")).toBeInTheDocument();

  await userEvent.click(btn);
  expect(screen.queryByText("MediaFrame")).not.toBeInTheDocument();
});

test('pluginActions', async () => { 
    LAZERWIKI_PLUGINS = [
    {
        name: "Insert1",
        icon: "plugin.png",
        script: (text, start, end, ns, name) => {return {action:'insert', location:-1, value:"new at end"}}
    },
    {
        name: "Insert2",
        icon: "plugin.png",
        script: (text, start, end, ns, name) => {return {action:'insert', location:4, value:"new at middle"}}
    },
    {
      name: "InsertAtCursor",
      icon: "plugin.png",
      script: (text, start, end, ns, name) => {return {action:'insert', atCursor:true, value:"cursor"}}
    },
    {
        name: "Replace",
        icon: "plugin.png",
        script: (text, start, end, ns, name) => {return {action:'replace', location:4, locationEnd:10, value:"Replacement"}}
    },
    {
        name: "ReplaceAll",
        icon: "plugin.png",
        script: (text, start, end, ns, name) => {return {action:'replaceAll', value:"Replacement"}}
    },
    {
        name: "None",
        icon: "plugin.png",
        script: (text, start, end, ns, name) => {return {action:'none'}}
    }];
  let currentText = "Abcdefg1234lmnop";
  let getCurrentText = () => currentText;
  let text = "";
  let setText = t => text=t;

  render (<div><EditToolbar getCurrentText = {getCurrentText} setText={setText}/><textarea id="pageSource"></textarea></div>);
  let ta = screen.getByRole("textbox");
  ta.value = currentText;
  let max = currentText.length;

  let btn = screen.getByRole("button", {name:"Insert1"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  
  expect(text).toBe(currentText + "new at end"); 
  btn = screen.getByRole("button", {name:"Insert2"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  
  expect(text).toBe("Abcdnew at middleefg1234lmnop"); 


  btn = screen.getByRole("button", {name:"InsertAtCursor"});
  ta.setSelectionRange(5, 5);
  await userEvent.click(btn);

  expect(text).toBe("Abcdecursorfg1234lmnop"); 
  
  btn = screen.getByRole("button", {name:"Replace"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  
  expect(text).toBe("AbcdReplacement4lmnop"); 
  
  btn = screen.getByRole("button", {name:"ReplaceAll"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  
  expect(text).toBe("Replacement"); 
 
  text = "This was here";
  btn = screen.getByRole("button", {name:"None"});
  ta.setSelectionRange(max, max);
  await userEvent.click(btn);
  
  expect(text).toBe("This was here"); 
});
