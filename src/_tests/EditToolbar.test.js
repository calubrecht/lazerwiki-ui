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

  await userEvent.click(btn);
  await act(() => doFrameClose());
  expect(screen.queryByText("PageFrame")).not.toBeInTheDocument();

});

jest.mock("../MediaFrame", () => (props) => {
  callSelectItem = (item) => props.selectItem(item);
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

  await act( () => callSelectItem("newImage"));
  expect(screen.queryByText("PageFrame")).not.toBeInTheDocument();

  
  expect(text).toBe("{{newImage|}}");

  await userEvent.click(btn);
  await act(() => doFrameClose());
  expect(screen.queryByText("MediaFrame")).not.toBeInTheDocument();

});
