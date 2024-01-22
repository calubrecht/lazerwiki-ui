import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageFrame from '../PageFrame';

let mockNamespaces =  {data:"NSTREE"};
let mockPages = [];

let mockDS = {fetchPageList: () => Promise.resolve({namespaces: mockNamespaces, pages: mockPages})};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

let selectNS = null;

jest.mock("../NsTree", () => (props) => { selectNS = props.selectNS; return props.nsTree.data; })


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