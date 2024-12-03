import { render, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../svc/UserService';
import MovePageFrame from '../MovePageFrame';

var PAGE_PROMISE = new Promise(() => {});
var MOVE_PAGE_PROMISE = Promise.resolve({success: true});
let mockDS = {fetchPageList: () => PAGE_PROMISE, movePage: jest.fn(() => MOVE_PAGE_PROMISE)};


jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});


let NsTreeSelectNS=null;

jest.mock("../NsTree", ()  => (props) => {
    NsTreeSelectNS=props.selectNS;
    return "NsTree"});

beforeEach(() => {
    PAGE_PROMISE = new Promise(() => {});
    US_instance().setUser("Bob");

});

test('render', async () => {
    let doClose = jest.fn(() => {});
    PAGE_PROMISE = Promise.resolve({pages: {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]}, namespaces: { namespace:"", children:[]}});

    render(<MovePageFrame doClose={doClose} initData={"page1"}/>);
    await waitFor(() => {});

    expect(screen.getByText("Namespace")).toBeInTheDocument();
    expect(screen.getByText("NsTree")).toBeInTheDocument();

    expect(screen.getByText("New Destination")).toBeInTheDocument();
    expect(screen.getByText("NS")).toBeInTheDocument();
    expect(screen.getByText("Page Name")).toBeInTheDocument();

    expect(screen.getByLabelText("NS")).toHaveValue("");
    expect(screen.getByLabelText("Page Name")).toHaveValue("page1");

    expect(screen.getByRole("button", {name: 'Move'})).toBeDisabled();
    expect(screen.getByText("to page1")).toBeInTheDocument();
});

test('renderWNS', async () => {
    let doClose = jest.fn(() => {});
    PAGE_PROMISE = Promise.resolve({pages: {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]}, namespaces: { namespace:"", children:[]}});

    render(<MovePageFrame doClose={doClose} initData={"ns:page1"}/>);
    await waitFor(() => {});

    expect(screen.getByText("Namespace")).toBeInTheDocument();
    expect(screen.getByText("NsTree")).toBeInTheDocument();

    expect(screen.getByText("New Destination")).toBeInTheDocument();
    expect(screen.getByText("NS")).toBeInTheDocument();
    expect(screen.getByText("Page Name")).toBeInTheDocument();

    expect(screen.getByLabelText("NS")).toHaveValue("ns");
    expect(screen.getByLabelText("Page Name")).toHaveValue("page1");
});

test('NsTree', async() => {
    let doClose = jest.fn(() => {});
    PAGE_PROMISE = Promise.resolve({pages: {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]}, namespaces: { namespace:"", children:[]}});

    render(<MovePageFrame doClose={doClose} initData={"ns:page1"}/>);
    await waitFor(() => {});
    await waitFor(() => NsTreeSelectNS("ns2"));
    expect(screen.getByLabelText("NS")).toHaveValue("ns2");

    expect(screen.getByRole("button", {name: 'Move'})).not.toBeDisabled();
});

test('close', async() => {
    let doClose = jest.fn(() => {});
    PAGE_PROMISE = Promise.resolve({pages: {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]}, namespaces: { namespace:"", children:[]}});

    render(<MovePageFrame doClose={doClose} initData={"ns:page1"}/>);
    await waitFor(() => {});

    await userEvent.click(screen.getByRole("button", {name: 'X'}));

    expect(doClose).toHaveBeenCalled();
});

test("moveFile", async() => {
    let doClose = jest.fn(() => {});
    PAGE_PROMISE = Promise.resolve({pages: {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]}, namespaces: { namespace:"", children:[]}});

    render(<MovePageFrame doClose={doClose} initData={"ns:page1"}/>);
    await waitFor(() => {});

    await screen.getByLabelText("Page Name").focus();
    await userEvent.keyboard("moved");
    expect(screen.getByRole("button", {name: 'Move'})).not.toBeDisabled();
    await screen.getByLabelText("NS").focus();
    await userEvent.keyboard("2");

    await userEvent.click(screen.getByRole("button", {name: 'Move'}));


    expect(mockDS.movePage).toHaveBeenCalled();
    expect(mockDS.movePage.mock.calls[0][0]).toBe("ns");
    expect(mockDS.movePage.mock.calls[0][1]).toBe("page1");
    expect(mockDS.movePage.mock.calls[0][2]).toBe("ns2");
    expect(mockDS.movePage.mock.calls[0][3]).toBe("page1moved");
    expect(screen.getByText("to ns2:page1moved")).toBeInTheDocument();

    let dlg= document.getElementsByClassName("moveRedirectDialog")[0];
    dlg.open = true;

    expect(screen.getByText("Page Moved to"))
    expect(screen.getByRole("link", {name: 'ns2:page1moved'})).toBeInTheDocument();
});

test("moveFileFails", async() => {
    let doClose = jest.fn(() => {});
    PAGE_PROMISE = Promise.resolve({pages: {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]}, namespaces: { namespace:"", children:[]}});
    MOVE_PAGE_PROMISE = Promise.resolve({success: false, message:"No moving for you"});
    render(<MovePageFrame doClose={doClose} initData={"ns:page1"}/>);
    await waitFor(() => {});


    await screen.getByLabelText("Page Name").focus();
    await userEvent.keyboard("moved");
    expect(screen.getByRole("button", {name: 'Move'})).not.toBeDisabled();
    await screen.getByLabelText("NS").focus();
    await userEvent.keyboard("2");

    await userEvent.click(screen.getByRole("button", {name: 'Move'}));


    expect(screen.getByText("No moving for you")).toBeInTheDocument();

    let rejectCB = null;
    MOVE_PAGE_PROMISE = new Promise((resolve, reject) => {
        rejectCB = reject;
    });
    await userEvent.click(screen.getByRole("button", {name: 'Move'}));
    await waitFor(() => {});
    await act( async () => {
        rejectCB("ERROR");
    });

    expect(screen.getByText("ERROR")).toBeInTheDocument();
});

test("noUser", async() => {
    let doClose = jest.fn(() => {});
    PAGE_PROMISE = Promise.resolve({pages: {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]}, namespaces: { namespace:"", children:[]}});
    US_instance().setUser(null);
    render(<MovePageFrame doClose={doClose} initData={"page1"}/>);
    await waitFor(() => {});

    expect(screen.getByText("Namespace")).toBeInTheDocument();
    expect(screen.getByText("NsTree")).toBeInTheDocument();

    expect(screen.getByText("New Destination")).toBeInTheDocument();
    expect(screen.queryByText("NS")).not.toBeInTheDocument();
    expect(screen.queryByText("Page Name")).not.toBeInTheDocument();

    // login user
    await waitFor(() => US_instance().setUser({userName:"joe"}));
    expect(screen.queryByText("NS")).toBeInTheDocument();
    expect(screen.queryByText("Page Name")).toBeInTheDocument();
})