import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RootFrame from '../rootFrame';
import UserService, {instance as US_instance} from '../svc/UserService';

let FETCH_PAGE_PROMISE = new Promise(() => {});

let mockDS = {fetchPage: jest.fn(() => FETCH_PAGE_PROMISE), getUIVersion: () => Promise.resolve({version:"test.0"}),
 getVersion: () => Promise.resolve({version:"uttest.0"} ), getSiteName: () => Promise.resolve("Test Site"),
 savePage: jest.fn(() => Promise.resolve({flags: {exists:true}, rendered:"New render", tags:[]}))};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

var mock_edittedText = null
jest.mock("../EditableTextbox", () => (props) => {
  props.registerTextCB(() => mock_edittedText);
  return `Textbox-${props.text}`;});

jest.mock("../DrawerLink", () => (props) => 
  `DrawerLink-${props.title}`)

let realConsoleLog = console.log

beforeEach(() => {
    FETCH_PAGE_PROMISE = new Promise(() => {});
    mockDS.fetchPage.mockClear();
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
    FETCH_PAGE_PROMISE = new Promise((resolve, reject) => {resolveHook=resolve;});
    render(<RootFrame/>);
    resolveHook({flags: {exists:true, userCanWrite: true}, rendered: "Rendered Text for Bob", source:"Source for Bob", tags:[]});
    await waitFor( () => {});
 
    expect(screen.getByText('Textbox-Source for Bob')).toBeInTheDocument();
    mock_edittedText = 'saveThis';
    
    expect(screen.getByRole('button', {name:"Save Page"})).toBeInTheDocument();
    expect(screen.getByRole('button', {name:"Cancel"})).toBeInTheDocument();
    expect(screen.getByText('DrawerLink-Show Preview')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', {name:"Cancel"}));
 
    expect(screen.queryByText('Textbox-Source for Bob')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', {name:"Edit Page"}));
    await userEvent.click(screen.getByRole('button', {name:"Save Page"}));

    expect(mockDS.savePage.mock.calls).toHaveLength(1);
    expect(mockDS.savePage.mock.calls[0][0]).toBe(""); // pageName
    expect(mockDS.savePage.mock.calls[0][1]).toBe("saveThis");
    expect(screen.getByText('New render')).toBeInTheDocument();
});
