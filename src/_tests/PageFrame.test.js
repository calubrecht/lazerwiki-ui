import { render, screen, act, waitFor, fireEvent} from '@testing-library/react';
import {instance as US_instance} from '../svc/UserService';
import userEvent from '@testing-library/user-event';
import PageFrame from '../PageFrame';

let mockNamespaces =  {data:"NSTREE"};
let mockRes = (mockPages) => {return {namespaces: mockNamespaces, pages: mockPages}};
let resolvePageListHook = null

let mockDS = {};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

let selectNS = null;

jest.mock("../NsTree", () => (props) => { selectNS = props.selectNS; return props.nsTree.data; })

beforeEach(() => {
    mockDS.fetchPageList = jest.fn( ()=>new Promise((resolve, reject) => {resolvePageListHook=resolve;}));
});


test('render empty Pages', async () => {
    let doClose = jest.fn(() => {});
    render(<PageFrame doClose={doClose} /> );
    await waitFor( () => {});
    act( ()=>resolvePageListHook(mockRes([])));
    await waitFor( () => {});    

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - []")).toBeInTheDocument();

    act( () => selectNS("Green"));
    await waitFor( () => {});
    expect(screen.getByText("Pages - [Green]")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", {"name": "X"}));

    expect(doClose.mock.calls).toHaveLength(1);
});

test('render with inital NS', async () => {
    render(<PageFrame namespace="ns1"/> );
    await waitFor( () => {});

    act( ()=>resolvePageListHook(mockRes([])));
    await waitFor( () => {});      

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - [ns1]")).toBeInTheDocument();
});


test('render links', async () => {
    let mockPages = {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]};
    render(<PageFrame /> );
    await waitFor( () => {});

    act( ()=>resolvePageListHook(mockRes(mockPages)));
    await waitFor( () => {});    

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - []")).toBeInTheDocument();
    expect(screen.getByRole('link', {name: "page1 - Page 1"})).toHaveAttribute('href', '/page/page1');
    expect(screen.getByRole('link', {name: "page2"})).toHaveAttribute('href', '/page/ns:page2');
    expect(screen.getByRole('link', {name: "<ROOT> - ROOT"})).toHaveAttribute('href', '/');
});

test('render empty links', async () => {
    let mockPages = {"": []};
    render(<PageFrame /> );
    await waitFor( () => {});

    act( ()=>resolvePageListHook(mockRes(mockPages)));
    await waitFor( () => {});

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - []")).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

test('render action', async () => {
    let mockPages = {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}]};
    let selectItem = jest.fn(()=>{});
    render(<PageFrame selectItem={selectItem}/> );
    await waitFor( () => {});

    act( ()=>resolvePageListHook(mockRes(mockPages)));
    await waitFor( () => {});    

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - []")).toBeInTheDocument();
    expect(screen.getByRole('button', {name: "page1 - Page 1"})).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', {name: "page1 - Page 1"}));
    await userEvent.click(screen.getByRole('button', {name: "page2"}));

    expect(selectItem.mock.calls).toHaveLength(2);
    expect(selectItem.mock.calls[0][0]).toBe("page1");
    expect(selectItem.mock.calls[1][0]).toBe("ns:page2");
});


test('setUser', async () => {
    jest.clearAllMocks();
    render(<PageFrame  /> );
    await waitFor( () => {});
 

    expect(mockDS.fetchPageList.mock.calls).toHaveLength(1);
    act( () => US_instance().setUser({user: "Bob"}));
    await waitFor( () => {});
    expect(mockDS.fetchPageList.mock.calls).toHaveLength(2);
});

test('filter',  async () => {
  let mockPages = {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}, {pagename: "Page3", title: "frank"}]};
  render(<PageFrame /> );
  await waitFor( () => {});

  act( ()=>resolvePageListHook(mockRes(mockPages)));
  await waitFor( () => {});

  await act( () => userEvent.keyboard("page"));

  expect(screen.getByText('NSTREE')).toBeInTheDocument();
  expect(screen.getByText("Pages - []")).toBeInTheDocument();
  expect(screen.getByRole('link', {name: "page1 - Page 1"})).toBeInTheDocument();
  expect(screen.getByRole('link', {name: "page2"})).toBeInTheDocument();
  expect(screen.getByRole('link', {name: "Page3 - frank"})).toBeInTheDocument();
  expect(screen.queryByRole('link', {name: "<ROOT> - ROOT"})).not.toBeInTheDocument();


  await act( () => userEvent.keyboard("{Control>}a{/Control}frank"));
  expect(screen.queryByRole('link', {name: "page1 - Page 1"})).not.toBeInTheDocument();
  expect(screen.queryByRole('link', {name: "page2"})).not.toBeInTheDocument();
  expect(screen.getByRole('link', {name: "Page3 - frank"})).toBeInTheDocument();
  expect(screen.queryByRole('link', {name: "<ROOT> - ROOT"})).not.toBeInTheDocument();

  await act( () => userEvent.keyboard("{Control>}a{/Control}root"));
  expect(screen.queryByRole('link', {name: "page1 - Page 1"})).not.toBeInTheDocument();
  expect(screen.queryByRole('link', {name: "page2"})).not.toBeInTheDocument();
  expect(screen.queryByRole('link', {name: "Page3 - frank"})).not.toBeInTheDocument();
  expect(screen.queryByRole('link', {name: "<ROOT> - ROOT"})).toBeInTheDocument();
});