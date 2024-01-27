import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import UserService, {instance as US_instance} from '../svc/UserService';
import userEvent from '@testing-library/user-event';
import PageFrame from '../PageFrame';

let mockNamespaces =  {data:"NSTREE"};
let mockPages = [];

let mockDS = {fetchPageList: jest.fn(() => Promise.resolve({namespaces: mockNamespaces, pages: mockPages}))};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

let selectNS = null;

jest.mock("../NsTree", () => (props) => { selectNS = props.selectNS; return props.nsTree.data; })

beforeEach(() => {
    mockPages = [];
});


test('render empty Pages', async () => {
    let doClose = jest.fn(() => {});
    render(<PageFrame doClose={doClose} /> );
    await waitFor( () => {});

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - []")).toBeInTheDocument();

    selectNS("Green");
    await waitFor( () => {});
    expect(screen.getByText("Pages - [Green]")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", {"name": "X"}));

    expect(doClose.mock.calls).toHaveLength(1);
});

test('render with inital NS', async () => {
    render(<PageFrame namespace="ns1"/> );
    await waitFor( () => {});

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - [ns1]")).toBeInTheDocument();
});


test('render links', async () => {
    mockPages = {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}, {pagename:'', namespace:'', title:"ROOT"}]};
    render(<PageFrame /> );
    await waitFor( () => {});

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - []")).toBeInTheDocument();
    expect(screen.getByRole('link', {name: "page1 - Page 1"})).toHaveAttribute('href', '/page/page1');
    expect(screen.getByRole('link', {name: "page2"})).toHaveAttribute('href', '/page/ns:page2');
    expect(screen.getByRole('link', {name: "<ROOT> - ROOT"})).toHaveAttribute('href', '/');
});

test('render action', async () => {
    mockPages = {"": [{pagename:"page1", namespace:"", title: "Page 1"}, {pagename:"page2", namespace:"ns"}]};
    let selectItem = jest.fn(()=>{});
    render(<PageFrame selectItem={selectItem}/> );
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

    US_instance().setUser({user: "Bob"});
    expect(mockDS.fetchPageList.mock.calls).toHaveLength(2);
});