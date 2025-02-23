import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RootFrame from '../rootFrame';
import UserService, {instance as US_instance} from '../svc/UserService';

let FETCH_PAGE_PROMISE = new Promise(() => {});
let savePageData = {};

let mockDS = {fetchPage: jest.fn(() => FETCH_PAGE_PROMISE), getUIVersion: () => Promise.resolve({version:"test.0"}),
        getGlobalSettings: () => Promise.resolve({settings: {}}),
 getVersion: () => Promise.resolve({version:"uttest.0"} ), getSiteName: () => Promise.resolve("Test Site"),
 savePage: jest.fn(() => Promise.resolve(savePageData)),
 deletePage: jest.fn(() => Promise.resolve()),
 previewPage: (pn, t) => `Previewed`};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

var mock_edittedText = null
var textBox_savePage = null;
var textBox_cancelEdit = null;
var mockCleanup = jest.fn(() => {});
var mockCancel = jest.fn(() => {});
jest.mock("../EditableTextbox", () => (props) => {
  props.registerTextCB(() => mock_edittedText);
  props.setCleanupCB(mockCleanup);
  props.setCancelCB(mockCancel);
  textBox_savePage = props.savePage;
  textBox_cancelEdit = props.cancelEdit;
  return `Textbox-${props.text}`;});

var previewDrawerInit = null
jest.mock("../DrawerLink", () => (props) => {
  previewDrawerInit = props.initData &&  props.initData.initFnc;
  return `DrawerLink-${props.title}`;});

let realConsoleLog = console.log

beforeEach(() => {
    FETCH_PAGE_PROMISE = new Promise(() => {});
    mockDS.fetchPage.mockClear();
    mockCleanup.mockClear();
    mockDS.savePage.mockClear();
    mockDS.deletePage = jest.fn(() => Promise.resolve());
    savePageData = {flags: {exists:true, userCanWrite:true}, rendered:"New render", tags:[], success:true};
    US_instance().setUser(null);
    console.log = jest.fn(() => {});

  });


afterEach(() => {
    console.log = realConsoleLog;

  });  

test('render', async () => {
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    await waitFor( () => {});
    expect(screen.getByText('Loading')).toBeInTheDocument();
    // fetchPage not called until user is set
    expect(mockDS.fetchPage.mock.calls).toHaveLength(0);

    await waitFor( () => {US_instance().setUser(null)});
    expect(mockDS.fetchPage.mock.calls).toHaveLength(1);

    resolveHook({flags: {exists:true}, rendered: "Rendered Text", tags:[]});
    await waitFor( () => {});
    
    expect(screen.getByText('Rendered Text')).toBeInTheDocument();
    expect(screen.getByText('View Source')).toBeInTheDocument();
    
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    await waitFor( () => {US_instance().setUser({userName: "Bob"})});
    await waitFor( () => {});
    resolveHook({flags: {exists:true, userCanWrite: true}, rendered: "Rendered Text for Bob", tags:[]});
    await waitFor( () => {});
    expect(screen.getByText('Rendered Text for Bob')).toBeInTheDocument();
    expect(screen.getByText('Edit Page')).toBeInTheDocument();

    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    await waitFor( () => {US_instance().setUser({userName: "Framl"})});
    await waitFor( () => {});
    resolveHook({flags: {exists:true, userCanWrite: false}, rendered: "Rendered Text for Frank", tags:[]});
    await waitFor( () => {});
    expect(screen.getByText('Rendered Text for Frank')).toBeInTheDocument();
    expect(screen.getByText('View Source')).toBeInTheDocument();

    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    await waitFor( () => {US_instance().setUser({userName: "Bob"})});
    await waitFor( () => {});
    resolveHook({flags: {exists:false, userCanWrite: true}, rendered: "This Page doesn't exist", tags:[]});
    await waitFor( () => {});
    expect(screen.getByText('This Page doesn\'t exist')).toBeInTheDocument();
    expect(screen.getByText('Create Page')).toBeInTheDocument();
});


test('render whenLoggedIn', async () => {
    US_instance().setUser({userName:"Bob"});
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    await waitFor( () => {});
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(mockDS.fetchPage.mock.calls).toHaveLength(1);
});

test('render edit', async () => {
    window.location.hash ="#Edit";
    US_instance().setUser({userName:"Bob"});
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, ) => {resolveHook=resolve;});
    render(<RootFrame/>);
    resolveHook({flags: {exists:true, userCanWrite: true}, rendered: "Rendered Text for Bob", source:"Source for Bob", tags:[]});
    await waitFor( () => {});
 
    expect(screen.getByText('Textbox-Source for Bob')).toBeInTheDocument();
    mock_edittedText = 'saveThis';
    
    expect(screen.getByRole('button', {name:"Save Page"})).toBeInTheDocument();
    expect(screen.getByRole('button', {name:"Cancel"})).toBeInTheDocument();
    expect(screen.getByText('DrawerLink-Show Preview')).toBeInTheDocument();
    expect(previewDrawerInit()).toBe("Previewed");

    await act(async () => await userEvent.click(screen.getByRole('button', {name:"Cancel"})));
 
    expect(mockCancel.mock.calls).toHaveLength(1);
    expect(screen.queryByText('Textbox-Source for Bob')).not.toBeInTheDocument();
    await act(async() => await userEvent.click(screen.getByRole('button', {name:"Edit Page"})));
    await act(async() => await userEvent.click(screen.getByRole('button', {name:"Save Page"})));

    expect(mockDS.savePage.mock.calls).toHaveLength(1);
    expect(mockDS.savePage.mock.calls[0][0]).toBe(""); // pageName
    expect(mockDS.savePage.mock.calls[0][1]).toBe("saveThis");
    await waitFor( () => {});
    expect(mockCleanup.mock.calls).toHaveLength(1);
    expect(screen.getByText('New render')).toBeInTheDocument();

    // Test actions initiated by textbox (keyboard actions)
    await act(async() => await userEvent.click(screen.getByRole('button', {name:"Edit Page"})));
    await act( () => textBox_cancelEdit());
    expect(screen.queryByText('Textbox-Source for Bob')).not.toBeInTheDocument();

    await act(async() => await userEvent.click(screen.getByRole('button', {name:"Edit Page"})));
    await act(async () => await textBox_savePage({preventDefault: () =>{}}));
    expect(mockDS.savePage.mock.calls).toHaveLength(2);
    expect(mockCleanup.mock.calls).toHaveLength(2);
    expect(mockDS.savePage.mock.calls[1][0]).toBe(""); // pageName
    expect(mockDS.savePage.mock.calls[1][1]).toBe("saveThis");

    expect(screen.queryByText('Textbox-Source for Bob')).not.toBeInTheDocument();

});

test('saveConfirmOverwrite', async () => {
    savePageData = {flags: {exists:true, userCanWrite:true}, rendered:"New render", tags:[], success:false};
    window.location.hash ="#Edit";
    US_instance().setUser({userName:"Bob"});
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    resolveHook({flags: {exists:true, userCanWrite: true}, rendered: "Rendered Text for Bob", source:"Source for Bob", tags:[]});
    await waitFor( () => {});
 
    expect(screen.getByText('Textbox-Source for Bob')).toBeInTheDocument();
    mock_edittedText = {source:'saveThis'};
    
    await act( async() => await userEvent.click(screen.getByRole('button', {name:"Save Page"})));

    expect(mockDS.savePage.mock.calls).toHaveLength(1);
    expect(mockDS.savePage.mock.calls[0][0]).toBe(""); // pageName
    expect(mockDS.savePage.mock.calls[0][1]).toStrictEqual({source: "saveThis"});
    await waitFor( () => {});

    let dlg= document.getElementsByClassName("confirmRevOverrideDialog")[0];
    dlg.open = true;

    await act( async() => await userEvent.click(screen.getByRole('button', {name:"Return to Edit"})));
    expect(mockDS.savePage.mock.calls).toHaveLength(1);
    dlg.open = false;
    expect(screen.queryByRole('button', {name:"Return to Edit"})).not.toBeInTheDocument();
    expect(screen.getByText('Textbox-Source for Bob')).toBeInTheDocument();
    expect(mockCleanup.mock.calls).toHaveLength(0);

    dlg.open = true;
    await act( async ()=> await userEvent.click(screen.getByRole('button', {name:"Cancel Edit"})));
    dlg.open = false;
    expect(mockDS.savePage.mock.calls).toHaveLength(1);
    expect(screen.queryByText('Textbox-Source for Bob')).not.toBeInTheDocument();
    expect(mockCleanup.mock.calls).toHaveLength(1);

    await act (async() => await userEvent.click(screen.getByRole('button', {name:"Edit Page"})));
    await act( async() => await userEvent.click(screen.getByRole('button', {name:"Save Page"})));
    dlg.open = true;

    savePageData = {flags: {exists:true, userCanWrite:true}, rendered:"New render", tags:[], success:true};
    await act( async() => userEvent.click(screen.getByRole('button', {name:"Overwrite Page"})));
    dlg.open = false;
    expect(mockDS.savePage.mock.calls).toHaveLength(3);
    expect(mockDS.savePage.mock.calls[2][0]).toBe(""); // pageName
    expect(mockDS.savePage.mock.calls[2][1]).toStrictEqual({source: "saveThis", force:true});



    expect(screen.getByText('New render')).toBeInTheDocument();
});

test('do delete', async () => {
    delete global.window.location;
    global.window = Object.create(window);
    global.window.location= {pathname: '/page/page1', hash:''};
    US_instance().setUser({userName:"Bob"});
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    resolveHook({flags: {exists:true, userCanWrite: true, userCanDelete: true}, rendered: "Rendered Text for Bob", source:"Source for Bob", tags:[]});
    await waitFor( () => {});
 

    await act(async() =>userEvent.click(screen.getByRole('button', {name:"Delete Page"})));
    expect(screen.getByText('Are you sure you want to delete this page?')).toBeInTheDocument();
    let dlg= document.getElementsByClassName("deletePageDialog")[0];
    dlg.open = true;


    await act(async() =>userEvent.click(screen.getByRole('button', {name:"Cancel"})));
    expect(mockDS.deletePage.mock.calls).toHaveLength(0);
    dlg.open = false;
    expect(screen.queryByRole('button', {name:"Cancel"})).not.toBeInTheDocument();

    await act(async() =>userEvent.click(screen.getByRole('button', {name:"Delete Page"})));
    dlg.open = true;
    await act(async() =>userEvent.click(screen.getByRole('button', {name:"Delete"})));
    expect(mockDS.deletePage.mock.calls).toHaveLength(1);
    expect(mockDS.deletePage.mock.calls[0][0]).toBe("page1"); // pageName
    dlg.open = false;
    expect(screen.queryByRole('button', {name:"Cancel"})).not.toBeInTheDocument();

    await act(async() =>userEvent.click(screen.getByRole('button', {name:"Delete Page"})));
    dlg.open = true;
    console.log.mockClear();
    mockDS.deletePage = jest.fn(() => Promise.reject("Failure"));
    await act(async() =>userEvent.click(screen.getByRole('button', {name:"Delete"})));
    expect(console.log.mock.calls[0][0]).toBe("Failure");
});

test('bad start url', async () => {
    delete global.window.location;
    global.window = Object.create(window);
    global.window.location= {pathname: '/wrongpath', hash:''};
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    await waitFor( () => {});

    expect(global.window.location.pathname).toBe('/');

    global.window.location= {pathname: '/page/path/tooLong', hash:''};
    render(<RootFrame/>);
    await waitFor( () => {});

    expect(global.window.location.pathname).toBe('/');
});

test('PageTitle', async () => {
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    await waitFor( () => {});
    expect(screen.getByText('Loading')).toBeInTheDocument();
    // fetchPage not called until user is set
    expect(mockDS.fetchPage.mock.calls).toHaveLength(0);

    await waitFor( () => {US_instance().setUser(null)});
    expect(mockDS.fetchPage.mock.calls).toHaveLength(1);

    resolveHook({flags: {exists:true}, rendered: "Rendered Text", tags:[], title: "PageTitle"});
    await waitFor( () => {});

    expect(document.title).toBe("Test Site - PageTitle");
});

test('image dialog', async () => {
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    await waitFor( () => {});
    expect(screen.getByText('Loading')).toBeInTheDocument();
    // fetchPage not called until user is set
    expect(mockDS.fetchPage.mock.calls).toHaveLength(0);

    await waitFor( () => {US_instance().setUser(null)});
    expect(mockDS.fetchPage.mock.calls).toHaveLength(1);

    resolveHook({flags: {exists:true}, rendered: '<img className="fullLink" src="/test.png?100" title="img1"></img> <img  src="/otherimge.png" title="img2"></img>', tags:[]});
    await waitFor( () => {});
    
    // First opens dialog
    await act(async() =>userEvent.click(screen.getByTitle("img1")));
    let dlg= document.getElementsByClassName("showImageDialog")[0];
    let img= dlg.getElementsByTagName("img")[0];
    dlg.open = true;
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://localhost/test.png");

    await act(async() => userEvent.click(screen.getByRole("button", {name: "Close"})));
    document.getElementsByClassName("showImageDialog")[0].open = false;
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(img).not.toHaveAttribute("src", "http://localhost/test.png");
});

let pageSearchClose = null;
jest.mock("../PageSearchFrame", () => (props) => {
  pageSearchClose = props.doClose;
  return `PageSearchFrame:${props.searchTag}`;
});

test('render tags', async () => {
    US_instance().setUser({userName:"Bob"});
    FETCH_PAGE_PROMISE = Promise.resolve({flags: {exists:true}, rendered: "Page with Tags", tags:["blue", "green"]});
    render(<RootFrame/>);
    await waitFor( () => {});
 

    expect(screen.getByRole('button', {name: 'blue'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'green'})).toBeInTheDocument();

    await act(async() => userEvent.click(screen.getByRole('button', {name: 'blue'})));
    expect(screen.getByText('PageSearchFrame:blue')).toBeInTheDocument();
    await waitFor(() => pageSearchClose());
    expect(screen.queryByText('PageSearchFrame:blue')).not.toBeInTheDocument();

    await act(async() => userEvent.click(screen.getByRole('button', {name: 'blue'})));
    expect(screen.getByText('PageSearchFrame:blue')).toBeInTheDocument();
    // Clicking a tag button while the tag search window is open will close it.
    await act(async() => userEvent.click(screen.getByRole('button', {name: 'blue'})));
    expect(screen.queryByText('PageSearchFrame:blue')).not.toBeInTheDocument();
});

test('render view source', async () => {
    US_instance().setUser({userName:"Bob"});
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, ) => {resolveHook=resolve;});
    render(<RootFrame/>);
    resolveHook({flags: {exists:true, userCanWrite: false}, rendered: "Rendered Text for Bob", source:"Source for Bob", tags:[]});
    await waitFor( () => {});
 
    await act(async() => userEvent.click(screen.getByRole('button', {name:"View Source"})));
    expect(screen.getByText('Textbox-Source for Bob')).toBeInTheDocument();

    await act(async() => userEvent.click(screen.getByRole('button', {name:"Cancel"})));
    expect(screen.queryByText('Textbox-Source for Bob')).not.toBeInTheDocument();
    expect(screen.getByText('Rendered Text for Bob')).toBeInTheDocument();


});

test('test errors',  async () => {
    US_instance().setUser({userName:"Bob"});
    FETCH_PAGE_PROMISE = Promise.reject("Not for you");
    let comp = render(<RootFrame/>);
    await waitFor( () => {});
    expect(console.log.mock.calls[2][0]).toBe("Not for you");
    comp.unmount();

    FETCH_PAGE_PROMISE = Promise.resolve({flags: {exists:true, userCanWrite:true}, rendered: "Rendered", source:"source", tags:[]});
    render(<RootFrame/>);
    await waitFor( () => {});

    console.log.mockClear();
    let realMock = mockDS.savePage;
    mockDS.savePage = () => Promise.reject("Cannot Save");
    await act(async() => userEvent.click(screen.getByRole('button', {name:"Edit Page"})));
    await act(async() => userEvent.click(screen.getByRole('button', {name:"Save Page"})));
    await waitFor( () => {});

    expect(console.log.mock.calls[0][0]).toBe("Cannot Save");
    mockDS.savePage= realMock;
});

test('render wID', async () => {
    let resolveHook = null
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    await waitFor( () => {});
    await waitFor( () => {US_instance().setUser(null)});

    resolveHook({flags: {exists:true}, rendered: "Rendered Text", tags:[], id:101});
    await waitFor( () => {});
    
    expect(screen.getByRole("group", {name: "RootBody p101"}));
});
