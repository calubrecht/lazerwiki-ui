import { render, screen, waitFor, queryByAttribute, fireEvent } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../svc/UserService';
import MediaFrame from '../MediaFrame';

var IMG_PROMISE = new Promise(() => {});
var DELETE_PROMISE = () =>Promise.resolve("Success");
let mockDS = {fetchImageList: () => IMG_PROMISE, deleteFile: jest.fn(() => DELETE_PROMISE())};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

var setAlignment = null;

jest.mock("../ImageSettings", () => (props) => {
    setAlignment = props.chooseAlignment
    return <div>ImageSettings</div>;
});

let NsTreeSelectNS=null;

jest.mock("../NsTree", ()  => (props) => {
    NsTreeSelectNS=props.selectNS;
    return "NsTree"});

beforeEach(() => {
    IMG_PROMISE = new Promise(() => {});
    DELETE_PROMISE = () =>Promise.resolve("Success");
    US_instance().setUser(null);
  
  });


function getByStartText(text) {
    let all = screen.queryAllByText((content, node) => {
            return node.textContent.startsWith(text);
        }
    );
    return all && all[0];
}

test('render', async () => {
  let doClose = jest.fn(() => {});
  IMG_PROMISE = Promise.resolve({media: {"": [
    {fileName:"file.png", fileSize:1000, width:10, height:10, uploadedBy:"Bob", },
    {fileName:"bigFile.png", fileSize:1000000, width:120, height:100, uploadedBy:"Bob", },
    {fileName:"bigestFile.png", fileSize:1000000000, width:520, height:500, uploadedBy:"Bob", },
]}, namespaces: { namespace:"", children:[]}});

  render(<MediaFrame doClose={doClose}/>);
  await waitFor(() => {});

  expect(screen.getByText("NsTree")).toBeInTheDocument();
  expect(getByStartText('file.png - 1000 bytes -  10x10 - uploaded by Bob')).toBeInTheDocument();
  expect(getByStartText('bigFile.png - 976.56 kb -  120x100 - uploaded by Bob')).toBeInTheDocument();
  expect(getByStartText('bigestFile.png - 953.67 mb -  520x500 - uploaded by Bob')).toBeInTheDocument();
});

test('renderWithSelect', async () => {
    let doClose = jest.fn(() => {});
    let doSelect = jest.fn(() => {});
    IMG_PROMISE = Promise.resolve({media: {"": [
      {fileName:"file.png", fileSize:1000, width:10, height:10, uploadedBy:"Bob", },
      {fileName:"bigFile.png", fileSize:1000000, width:120, height:100, uploadedBy:"Bob", },
      {fileName:"bigestFile.png", fileSize:1000000000, width:520, height:500, uploadedBy:"Bob", },
  ]}, namespaces: { namespace:"", children:[]}});
  
    let container = render(<MediaFrame doClose={doClose} selectItem={doSelect}/>);
    await waitFor(() => {});
  
    expect(screen.getByText("NsTree")).toBeInTheDocument();
    expect(getByStartText('file.png- 1000 bytes -  10x10 - uploaded by Bob')).toBeInTheDocument();
    expect(getByStartText('bigFile.png- 976.56 kb -  120x100 - uploaded by Bob')).toBeInTheDocument();
    expect(getByStartText('bigestFile.png- 953.67 mb -  520x500 - uploaded by Bob')).toBeInTheDocument();
    expect(screen.getByRole("button", {name: 'file.png'})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: 'bigFile.png'})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: 'bigestFile.png'})).toBeInTheDocument();

    setAlignment("Left");
    await waitFor(() => {});

    await screen.getByRole("button", {name: 'file.png'}).click();

    expect(doSelect.mock.calls[0][0]).toBe("file.png");
    expect(doSelect.mock.calls[0][1]).toBe("Left");
  });

test('basicButtons', async () => {
    US_instance().setUser({userName:"joe"});
    let doClose = jest.fn(() => {});
    IMG_PROMISE = Promise.resolve({media: {"": [
      {fileName:"file.png", fileSize:1000, width:10, height:10, uploadedBy:"Bob", }
  ]}, namespaces: { namespace:"", children:[]}});
  
    render(<MediaFrame doClose={doClose}/>);
    await waitFor(() => {});
  
    await userEvent.click(screen.getByRole("button", {name: "X"}));

    expect (doClose.mock.calls).toHaveLength(1);

    await userEvent.click(within(getByStartText('file.png - 1000 bytes -  10x10 - uploaded by Bob')).getByRole("button", {name: "Delete"}));

    expect (screen.getByRole("dialog")).toBeInTheDocument();
    // Just close
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", {name:"Cancel"}));
    expect (screen.queryByRole("dialog")).not.toBeInTheDocument();
    // verify delete not called
    expect(mockDS.deleteFile.mock.calls).toHaveLength(0);

    await userEvent.click(within(getByStartText('file.png - 1000 bytes -  10x10 - uploaded by Bob')).getByRole("button", {name: "Delete"}));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", {name:"Delete"}));
    expect (screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect (screen.getByText("File Deleted")).toBeInTheDocument();
    expect(mockDS.deleteFile.mock.calls).toHaveLength(1);

    // Error upload
    DELETE_PROMISE = () => Promise.reject({message:"Bad"});
    await userEvent.click(within(getByStartText('file.png - 1000 bytes -  10x10 - uploaded by Bob')).getByRole("button", {name: "Delete"}));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", {name:"Delete"}));
    expect (screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect (screen.queryByText("File Deleted")).not.toBeInTheDocument();
    expect (screen.queryByText("Bad")).toBeInTheDocument();
    expect(mockDS.deleteFile.mock.calls).toHaveLength(2);

});

test('basicButtonsWithSelect', async () => {
    let doClose = jest.fn(() => {});
    let doSelect = jest.fn(() => {});
    IMG_PROMISE = Promise.resolve({media: {"ns": [
      {fileName:"file.png", fileSize:1000, width:10, height:10, uploadedBy:"Bob", }
  ]}, namespaces: { namespace:"", children:[{namespace:"os", children:[]}, {namespace:"ns", children:[]}]}});
  
    render(<MediaFrame doClose={doClose} selectItem={doSelect} namespace="ns"/>);
    await waitFor(() => {});
    await waitFor(() => US_instance().setUser({userName:"joe"}));

    await userEvent.click(screen.getByRole("button", {name: 'file.png'}));

    expect(doSelect.mock.calls[0][0]).toBe('ns:file.png');

    await userEvent.click(within(getByStartText('file.png- 1000 bytes -  10x10 - uploaded by Bob')).getByRole("button", {name: "Delete"}));
    expect (screen.getByRole("dialog")).toBeInTheDocument();
});


test('errorFetch', async () => {
    let doClose = jest.fn(() => {});
    let doSelect = jest.fn(() => {});
    let rejectHook = null;
    IMG_PROMISE = new Promise((resolve, reject) => rejectHook=reject);
        
  
    render(<MediaFrame doClose={doClose} selectItem={doSelect} namespace="ns"/>);
    await rejectHook({message: "NO IMAGES"});
    await waitFor(() => {});
    expect (screen.getByText("NO IMAGES")).toBeInTheDocument();
});

test('NsTree', async() => {
    IMG_PROMISE = Promise.resolve({media: {"": [
        {fileName:"file.png", fileSize:1000, width:10, height:10, uploadedBy:"Bob", }
    ], 
"ns": [{fileName:"file2.png", fileSize:1000, width:10, height:10, uploadedBy:"Bobby", }]}, namespaces: { namespace:"", children:[{namespace:"ns"}]}});

    render(<MediaFrame/>);
    await waitFor(() => {});
    expect(screen.getByText("Media - []")).toBeInTheDocument();
    expect(getByStartText('file.png - 1000 bytes -  10x10 - uploaded by Bob')).toBeInTheDocument();

    await waitFor(() => NsTreeSelectNS("ns"));
    expect(screen.getByText("Media - [ns]")).toBeInTheDocument();
    expect(getByStartText('file2.png - 1000 bytes -  10x10 - uploaded by Bobby')).toBeInTheDocument();
});


test('upload', async() => {
    US_instance().setUser({userName:"joe"});
    let doClose = jest.fn(() => {});
    IMG_PROMISE = Promise.resolve({media: {"": [
      {fileName:"file.png", fileSize:1000, width:10, height:10, uploadedBy:"Bob", }
  ]}, namespaces: { namespace:"", writable:true, children:[]}});

    let uploadPromiseResolveHook = null;
    let uploadPromiseRejectHook = null;
    mockDS.saveMedia = jest.fn((files, ns) => new Promise((resolve, reject) => {uploadPromiseResolveHook= resolve; uploadPromiseRejectHook = reject;}));
  
    let component = render(<MediaFrame doClose={doClose}/>);
    await waitFor(() => {});

    await fireEvent.change(queryByAttribute("id", component.container, "mediaFileUpload"), { target: {files: 'f'}});
    await screen.getByLabelText("NS").focus();
    await userEvent.keyboard("newNS");
    await userEvent.click(screen.getByRole("button", {name:"Upload"}));

    expect(mockDS.saveMedia.mock.calls[0][0]).toBe('f');
    expect(mockDS.saveMedia.mock.calls[0][1]).toBe('newNS');
    expect(screen.getByText("Uploading")).toBeInTheDocument();

    await waitFor( () => uploadPromiseResolveHook({}));
    expect(screen.getByText("Upload Complete")).toBeInTheDocument();
    expect(queryByAttribute("id", component.container, "mediaFileUpload").value).toBe("");


    await fireEvent.change(queryByAttribute("id", component.container, "mediaFileUpload"), { target: {files: 'f'}});
    await userEvent.click(screen.getByRole("button", {name:"Upload"}));
    await waitFor( () => uploadPromiseRejectHook({message: "Uplaod failed"}));
    await waitFor(() => {});
    expect(screen.getByText("Uplaod failed")).toBeInTheDocument();
    
});

test('filter',  async () => {
  let doClose = jest.fn(() => {});
  IMG_PROMISE = Promise.resolve({media: {"": [
    {fileName:"file.png", fileSize:1000, width:10, height:10, uploadedBy:"Bob", },
    {fileName:"bigFile.png", fileSize:1000000, width:120, height:100, uploadedBy:"Bob", },
    {fileName:"bigestFile.png", fileSize:1000000000, width:520, height:500, uploadedBy:"Bob", },
]}, namespaces: { namespace:"", children:[]}});

  render(<MediaFrame doClose={doClose}/>);
  await waitFor(() => {});
  
  await userEvent.keyboard("big");

  expect(screen.getByText("NsTree")).toBeInTheDocument();
  expect(getByStartText('file.png - 1000 bytes -  10x10 - uploaded by Bob')).toBeFalsy();
  expect(getByStartText('bigFile.png - 976.56 kb -  120x100 - uploaded by Bob')).toBeInTheDocument();
  expect(getByStartText('bigestFile.png - 953.67 mb -  520x500 - uploaded by Bob')).toBeInTheDocument();
});
