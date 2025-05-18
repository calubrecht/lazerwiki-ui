import { render, screen, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../svc/UserService';
import MoveImageFrame from '../MoveImageFrame';
import * as UsersEvent from "react-dom/test-utils";

var MOVE_IMAGE_PROMISE = Promise.resolve({success: true});
let mockDS = {moveImage: jest.fn(() => MOVE_IMAGE_PROMISE)};


jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});


let NsTreeSelectNS=null;

jest.mock("../NsTree", ()  => (props) => {
    NsTreeSelectNS=props.selectNS;
    return "NsTree"});

beforeEach(() => {
    US_instance().setUser("Bob");
    MOVE_IMAGE_PROMISE = Promise.resolve({success: true});

});


test('render', async () => {
    let doClose = jest.fn(() => {});
    let doRefresh = jest.fn(() => {});

    render(<MoveImageFrame doClose={doClose} imageName={"img1.png"} ns={""} doRefresh={doRefresh}/>);

    expect(screen.getByLabelText("New NS:")).toBeInTheDocument();
    expect(screen.getByLabelText("New Name:")).toBeInTheDocument();
    expect(screen.getByText("NsTree")).toBeInTheDocument();

    expect(screen.getByRole("button", {name: 'Move', hidden:true})).toBeDisabled();
    expect(screen.getByRole("button", {name: 'Cancel', hidden:true})).toBeInTheDocument();
});

test('canMoveIfNameOrNSChange', async () => {
    let doClose = jest.fn(() => {});
    let doRefresh = jest.fn(() => {});

    render(<MoveImageFrame doClose={doClose} imageName={"img1.png"} ns={""} doRefresh={doRefresh}/>);

    await act(() => userEvent.click(screen.getByLabelText("New NS:")));
    await act(() => userEvent.keyboard("ns"));

    expect(screen.getByRole("button", {name: 'Move', hidden:true})).not.toBeDisabled();

    act(() => NsTreeSelectNS(""));
    expect(screen.getByLabelText("New NS:")).toHaveValue("");
    expect(screen.getByRole("button", {name: 'Move', hidden:true})).toBeDisabled();

    await act(() => userEvent.click(screen.getByLabelText("New Name:")));
    await act(() => userEvent.keyboard("image1.jpg"));

    expect(screen.getByRole("button", {name: 'Move', hidden:true})).not.toBeDisabled();
});

test('doMove', async () => {
    let doClose = jest.fn(() => {});
    let doRefresh = jest.fn(() => {});

    render(<MoveImageFrame doClose={doClose} imageName={"img1.png"} ns={""} doRefresh={doRefresh}/>);

    act(() => NsTreeSelectNS("ns"));
    expect(screen.getByLabelText("New NS:")).toHaveValue("ns");
    await act( () => userEvent.click(screen.getByRole("button", {name: 'Move', hidden:true})));

    expect(screen.getByText("img1.png moved to ns:img1.png"))
    expect(screen.queryByRole("button", {name: 'Move', hidden:true})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: 'Cancel', hidden:true})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: 'OK', hidden:true})).toBeInTheDocument();

    act(() => NsTreeSelectNS("ns5"));
    expect(screen.getByText("Namespace [ns5]")).toBeInTheDocument();

    await act( () => userEvent.click(screen.getByRole("button", {name: 'OK', hidden:true})));

    expect(doRefresh).toHaveBeenCalled();
});

test('doMoveFailure', async () => {
    let doClose = jest.fn(() => {});
    let doRefresh = jest.fn(() => {});

    render(<MoveImageFrame doClose={doClose} imageName={"img1.png"} ns={""} doRefresh={doRefresh}/>);

    act(() => NsTreeSelectNS("ns"));
    expect(screen.getByLabelText("New NS:")).toHaveValue("ns");
    MOVE_IMAGE_PROMISE = Promise.resolve({success: false, message: "Out of coffee"});

    await act( () => userEvent.click(screen.getByRole("button", {name: 'Move', hidden:true})));

    expect(screen.queryByRole("button", {name: 'Move', hidden:true})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: 'Cancel', hidden:true})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: 'OK', hidden:true})).not.toBeInTheDocument();
    expect(screen.queryByText("Out of coffee")).toBeInTheDocument();

});

test('doMoveError', async () => {
    let doClose = jest.fn(() => {});
    let doRefresh = jest.fn(() => {});

    render(<MoveImageFrame doClose={doClose} imageName={"img1.png"} ns={""} doRefresh={doRefresh}/>);

    act(() => NsTreeSelectNS("ns"));
    expect(screen.getByLabelText("New NS:")).toHaveValue("ns");
    let rejectCB = null;
    MOVE_IMAGE_PROMISE =  new Promise((resolve, reject) => {
        rejectCB = reject;
    });

    await act( () => userEvent.click(screen.getByRole("button", {name: 'Move', hidden:true})));

    await act( () => rejectCB("Oops"));

    expect(screen.queryByRole("button", {name: 'Move', hidden:true})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: 'Cancel', hidden:true})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: 'OK', hidden:true})).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown error")).toBeInTheDocument();

});

/*
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
    await act( () => userEvent.keyboard("moved"));
    expect(screen.getByRole("button", {name: 'Move'})).not.toBeDisabled();
    await screen.getByLabelText("NS").focus();
    await act( () => userEvent.keyboard("2"));

    await act( () => userEvent.click(screen.getByRole("button", {name: 'Move'})));


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
    await act( () => userEvent.keyboard("moved"));
    expect(screen.getByRole("button", {name: 'Move'})).not.toBeDisabled();
    await screen.getByLabelText("NS").focus();
    await act( () => userEvent.keyboard("2"));

    await act( () => userEvent.click(screen.getByRole("button", {name: 'Move'})));


    expect(screen.getByText("No moving for you")).toBeInTheDocument();

    let rejectCB = null;
    MOVE_PAGE_PROMISE = new Promise((resolve, reject) => {
        rejectCB = reject;
    });
    await act( () => userEvent.click(screen.getByRole("button", {name: 'Move'})));
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
})*/