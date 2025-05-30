import { render, screen, act, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableTextbox from '../EditableTextbox';


var TAG_LIST = [];
var TAG_PROMISE = new Promise(() => {});  //(() => Promise.resolve({flags: {exists:true, userCanWrite:true}, rendered:"New render", tags:[]})
var LOCK_PROMISE =  Promise.resolve({success:true, pageLockId: '101'})
let mockDS = {fetchTagList: () => TAG_PROMISE, getPageLock: () => LOCK_PROMISE, overrideLock: () => LOCK_PROMISE, clearLock: jest.fn(() => {})};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});


let close= null;
let confirm= null;

jest.mock("../ConfirmDialog", () => (props) => {
  close = props.onCancel;
  confirm = props.onConfirm;
  return "ConfirmDlg";
});

let mockDbGetValuePromise =  Promise.resolve(undefined);
let mockDb = {
  addValue: jest.fn(() => {}),
  delValue: jest.fn(() => {}),
  getValue: jest.fn(() => mockDbGetValuePromise)
}

jest.mock("../svc/DbService", () => {
  return {instance: () => mockDb};

});

let setTextCB = null;
jest.mock("../EditToolbar", () => (props) =>{
  setTextCB = props.setText;
  return "Toolbar-" + props.namespace + "-" + props.pageName + "-" + props.getCurrentText();});

MOCK_CONSOLE = jest.fn(() => {});
let REAL_CONSOLE = console.log;

beforeEach(() => {
  mockDbGetValuePromise =  Promise.resolve(undefined);
  mockDS = {fetchTagList: () => TAG_PROMISE, getPageLock: () => LOCK_PROMISE, overrideLock: () => LOCK_PROMISE, clearLock: jest.fn(() => {})};
  console.log= MOCK_CONSOLE;
});

afterEach(() => {
  console.log= REAL_CONSOLE;
})


test('render', async() => {
  TAG_LIST.length = 0;  
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {() => {}} setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} />);

  await waitFor(() => {});

  expect(screen.getByText("Toolbar--simplePage-Initial Text")).toBeInTheDocument();
  expect(screen.getAllByRole("textbox").filter(el => el.name === "pageSource")[0]).toBeInTheDocument();

  component.unmount();
  component = render(<EditableTextbox pageName="ns:simplePage" text="Initial Text" registerTextCB= {() => {}}  setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} />);
  await waitFor(() => {});
  expect(screen.getByText("Toolbar-ns-simplePage-Initial Text")).toBeInTheDocument();

  component.unmount();
  render(<EditableTextbox pageName="ns:simplePage" text="Initial Text" registerTextCB= {() => {}}  setCleanupCB= {() => {}} setCancelCB={() => {}} editable={false} />);
  expect(screen.queryByText("Toolbar", {exact: false})).not.toBeInTheDocument();

});

test('edits', async () => {
  const user = userEvent.setup();
  TAG_LIST.length = 0;
  let cb = null;
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {(textcb) => {cb = textcb;}}  setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} />);
  await waitFor(() => {});
  expect(cb().text).toBe("Initial Text");
  let c = screen.getAllByRole("textbox").filter(el => el.name === "pageSource")[0];
  await act( () => user.type(c, "123"));
  expect(cb().text).toBe("Initial Text123");
  expect(screen.getByText("Toolbar--simplePage-Initial Text123")).toBeInTheDocument();

  //Autoindent
  await act( () => user.clear(c));
  await act( () => user.type(c, '  Two space indent'));
  await act( () => user.keyboard('[Enter]secondline'));

  expect(cb().text).toBe("  Two space indent\n  secondline");

});

test('keyActions', async () => {
  const user = userEvent.setup();
  TAG_LIST.length = 0;
  let cb = null;
  let savePage = jest.fn(() => {});
  let cancelEdit = jest.fn(() => {});
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {(textcb) => {cb = textcb;}}  setCleanupCB= {() => {}} editable={true} setCancelCB={() => {}} savePage={savePage} cancelEdit={cancelEdit} />);
  let c = screen.getAllByRole("textbox").filter(el => el.name === "pageSource")[0];
  act(() =>fireEvent.keyDown(c, { key: 's', ctrlKey: true}));
  
  expect(savePage.mock.calls).toHaveLength(1);

  act(() => fireEvent.keyDown(c, { key: 'c', ctrlKey: true, altKey:true}));
  expect(cancelEdit.mock.calls).toHaveLength(1);

  await act( () => user.keyboard('{Escape}'));
  expect(cancelEdit.mock.calls).toHaveLength(2);

  component.unmount();
  render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {(textcb) => {cb = textcb;}}  setCleanupCB= {() => {}} setCancelCB={() => {}} editable={false} cancelEdit={cancelEdit} />);
  c = screen.getAllByRole("textbox").filter(el => el.name === "pageSource")[0];
  act(() => fireEvent.keyDown(c, { key: 'c', ctrlKey: true, altKey:true}));
  expect(cancelEdit.mock.calls).toHaveLength(3);
});

test('tagList', async() => {
  const user = userEvent.setup();
  TAG_LIST.length = 0;
  TAG_LIST.push('tag1');
  TAG_LIST.push('tag2');
  TAG_PROMISE = Promise.resolve(TAG_LIST);
  let cb = null;
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {(textcb) => {cb = textcb;}}  setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} tags={["tag1"]} />);

  await waitFor( () => {});

  expect(screen.getByText("tag1")).toBeInTheDocument();
  expect(screen.getByText("tag2")).toBeInTheDocument();
  let tag1Label =  screen.getByText("tag1");
  let tag1Span = screen.getByText("tag1").parentElement;
  let tag1Check = within(tag1Span).getByRole('checkbox');
  expect(tag1Check.checked).toBe(true);
  await act( () => userEvent.click(tag1Check));
  expect(tag1Check.checked).toBe(false);
  await act( () =>userEvent.click(tag1Label));
  expect(tag1Check.checked).toBe(true);  
  let tagEntry = screen.getAllByRole("textbox").filter(el => el.name === "tagEntry")[0];

  tagEntry.focus();
  await act( () => userEvent.keyboard("AnIv@lidTag[Enter]"));
  expect(screen.getByText("invalid tag value")).toBeInTheDocument();
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  await act( () => userEvent.keyboard('1'));
  expect(screen.queryByText("invalid tag value")).not.toBeInTheDocument();
  await act( () => userEvent.clear(tagEntry));
  await act( () => userEvent.keyboard("NewTag[Enter]"));
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  let newTagLabel =  screen.getByText("NewTag");
  let newTagSpan = screen.getByText("NewTag").parentElement;
  let newTagCheck = within(newTagSpan).getByRole('checkbox');
  expect(newTagCheck.checked).toBe(true);

  expect(cb().tags).toStrictEqual(["tag1", "NewTag"]);
});

test('setText', async () => {
  TAG_LIST.length = 0;
  TAG_PROMISE = new Promise(() => {});
  let cb = null;

  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {(textcb) => {cb = textcb;}}  setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} />);
  await waitFor(() => {});
  act( () => setTextCB("Toolbar override"));
  
  let c = screen.getAllByRole("textbox").filter(el => el.name === "pageSource")[0];
  expect(c.value).toBe("Toolbar override");
  expect(cb().text).toBe("Toolbar override");

});


test('cleanup', async () => {
  TAG_LIST.length = 0;
  TAG_PROMISE = new Promise(() => {});
  let cb = null;

  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {() => {}}  setCleanupCB= {(cleanupCb) => {cb = cleanupCb}} setCancelCB={() => {}} editable={true}/>);
  await waitFor(() => {});
  act (() => cb());
  expect(mockDb.delValue.mock.calls).toHaveLength(1);
  expect(mockDb.delValue.mock.calls[0][0]).toBe("simplePage");
});


test('edits reflect in DB', async () => {
  const user = userEvent.setup();
  mockDb.addValue.mockReset();
  mockDb.delValue.mockReset();
  TAG_LIST.length = 0;
  let cb = null;
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {(textcb) => {cb = textcb;}}  setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} />);
  await waitFor(() => {});
  expect(cb().text).toBe("Initial Text");
  let c = screen.getAllByRole("textbox").filter(el => el.name === "pageSource")[0];
  await act( () => user.type(c, "123"));
  expect(mockDb.addValue.mock.calls).toHaveLength(3);
  expect(mockDb.addValue.mock.calls[2][0]).toBe("simplePage");
  expect(mockDb.addValue.mock.calls[2][1]).toBe("Initial Text123");

  await act( () => user.type(c, "[Backspace][Backspace][Backspace]"));
  expect(mockDb.addValue.mock.calls).toHaveLength(5);
  expect(mockDb.addValue.mock.calls[4][0]).toBe("simplePage");
  expect(mockDb.addValue.mock.calls[4][1]).toBe("Initial Text1");
  expect(mockDb.delValue.mock.calls).toHaveLength(1);
  expect(mockDb.delValue.mock.calls[0][0]).toBe("simplePage");

  //Toolbar works, too
  act( () => setTextCB("Toolbar override"));
  expect(mockDb.addValue.mock.calls).toHaveLength(6);
  expect(mockDb.addValue.mock.calls[5][0]).toBe("simplePage");
  expect(mockDb.addValue.mock.calls[5][1]).toBe("Toolbar override");

  act( () => setTextCB("Initial Text"));
  expect(mockDb.delValue.mock.calls).toHaveLength(2);
  expect(mockDb.delValue.mock.calls[1][0]).toBe("simplePage");
});

test('render ConfirmDlg', async() => {
  TAG_LIST.length = 0;  
  let resolveHook = null;
  mockDbGetValuePromise = new Promise((resolve, reject) => resolveHook=resolve);
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {() => {}} setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} />);

  await waitFor(() => {});
  expect(screen.queryByText("ConfirmDlg")).not.toBeInTheDocument();

  act( () => resolveHook({user: "Bob", "text": "Some Text", "ts": new Date()}));

  await waitFor(() => {});

  expect(screen.getByText("ConfirmDlg")).toBeInTheDocument();

  act(() => close());

  await waitFor(() => {});

  expect(screen.getByText("Initial Text")).toBeInTheDocument();

  mockDbGetValuePromise = new Promise((resolve, reject) => resolveHook=resolve);
  render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {() => {}} setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} />);

  await waitFor(() => {});
  expect(screen.queryByText("ConfirmDlg")).not.toBeInTheDocument();

  act( () =>resolveHook({user: "Bob", "text": "Some Text", "ts": new Date()}));

  await waitFor(() => {});

  act( () => confirm());

  await waitFor(() => {});

  expect(screen.getByText("Some Text")).toBeInTheDocument();
  
});

test('failed lock', async() => {
  mockDS.getPageLock = () =>  Promise.resolve({success:false, owner:'Jerk', lockTime:"2024-08-23T01:24:24.695815944", revision:10});
  let cancelCB = null;
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {() => {}} setCleanupCB= {() => {}} setCancelCB={(cb) => {cancelCB=cb}} editable={true} revision={10}/>);

  await waitFor(() => {});
  expect(screen.queryByText("ConfirmDlg")).toBeInTheDocument();

  cancelCB();
  expect(mockDS.clearLock.mock.calls).toHaveLength(0);

  confirm();

  await waitFor(() => {});
  expect(screen.queryByText("ConfirmDlg")).not.toBeInTheDocument();

  cancelCB();
  expect(mockDS.clearLock.mock.calls).toHaveLength(1);
});

test('old draft doesn\'t show ConfirmDlg', async() => {
  TAG_LIST.length = 0;  
  let resolveHook = null;
  mockDbGetValuePromise = new Promise((resolve, reject) => resolveHook=resolve);
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {() => {}} setCleanupCB= {() => {}} setCancelCB={() => {}} editable={true} />);

  await waitFor(() => {});
  expect(screen.queryByText("ConfirmDlg")).not.toBeInTheDocument();

  resolveHook({user: "Bob", "text": "Some Text", "ts": new Date("2024-05-04")});

  await waitFor(() => {});

  expect(screen.queryByText("ConfirmDlg")).not.toBeInTheDocument();


});

test('Lock shows revision update', async() => {
  TAG_LIST.length = 0;
  TAG_LIST.push('t1');
  TAG_LIST.push('t2');
  TAG_LIST.push('t3');
  TAG_PROMISE = Promise.resolve(TAG_LIST);
  mockDS.getPageLock = () =>  Promise.resolve({success:true, owner:'Jerk', lockTime:"2024-08-23T01:24:24.695815944", revision:10});
  mockDS.fetchPage = jest.fn(() => Promise.resolve({source:"NewPageSource", revision:10, tags:["t1","t2"], title:"NewTitle"}))

  let cancelCB = null;
  let component = render(<EditableTextbox pageName="simplePage" text="Initial Text" registerTextCB= {() => {}} setCleanupCB= {() => {}} setCancelCB={(cb) => {cancelCB=cb}} editable={true} revision={9} tags={["t3"]}/>);


  await waitFor(() => {});

  // Component should have loaded new and used new page data.
  //expect(mockDS.fetchPage.mock.calls).toHaveLength(1);
  expect(screen.getByText("Toolbar--simplePage-NewPageSource")).toBeInTheDocument();
});