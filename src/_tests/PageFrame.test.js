import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
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
    render(<PageFrame /> );
    await waitFor( () => {});

    expect(screen.getByText('NSTREE')).toBeInTheDocument();
    expect(screen.getByText("Pages - []")).toBeInTheDocument();

    selectNS("Green");
    await waitFor( () => {});
    expect(screen.getByText("Pages - [Green]")).toBeInTheDocument();
});