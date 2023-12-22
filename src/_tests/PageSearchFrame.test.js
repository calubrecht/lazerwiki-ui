import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import UserService, {instance as US_instance} from '../svc/UserService';
import PageSearchFrame from '../PageSearchFrame';


let PAGE_SEARCH_PROMISE = new Promise(() => {});

let mockDS = {doPageSearch: jest.fn(() => PAGE_SEARCH_PROMISE)};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

beforeEach(() => {
    PAGE_SEARCH_PROMISE = new Promise(() => {});
    mockDS.doPageSearch.mockClear();
    US_instance().setUser(null);
  
  });


test('render', async () => {
    render(<PageSearchFrame /> );
    await waitFor( () => {});

    expect(screen.getByText('Page Search -')).toBeInTheDocument();
    expect(screen.getByRole('combobox').value).toBe('text');
    expect(screen.getByRole('combobox').options[0].value).toBe("text");
    expect(screen.getByRole('combobox').options[1].value).toBe("tag");
    expect(screen.getByText('Text Search')).toBeInTheDocument();
    expect(screen.getByText('Tag Search')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: "Search"})).toBeInTheDocument();

    expect(mockDS.doPageSearch.mock.calls).toHaveLength(0);
});

test('render as tag search', async () => {
    render(<PageSearchFrame searchTag="thisTag"/> );
    await waitFor( () => {});

    expect(screen.getByText('Page Search - tag:thisTag')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: "Search"})).not.toBeInTheDocument();

    expect(mockDS.doPageSearch.mock.calls).toHaveLength(1);
    expect(mockDS.doPageSearch.mock.calls[0][0]).toBe("tag:thisTag");
});

test('closeButton', () => {
    let closeFnc = jest.fn(() => {});
    render(<PageSearchFrame  doClose = {closeFnc} />);

    screen.getByRole("button", {name : 'X'}).click();

    expect(closeFnc.mock.calls).toHaveLength(1);
});

test('doSearch', async () => {
    let resolveHook = null;
    PAGE_SEARCH_PROMISE = new Promise((resolve, reject) => {resolveHook = resolve;});
//    mockDS.doPageSearch = jest.fn(() => PAGE_SEARCH_PROMISE);

    render(<PageSearchFrame /> );
    await waitFor( () => {});
    screen.getByRole('textbox').focus();
    await userEvent.keyboard("search text");
    await userEvent.keyboard("[Enter]");

    expect(mockDS.doPageSearch.mock.calls).toHaveLength(1);
    await waitFor( () => {});
    expect(screen.getByText('Searching')).toBeInTheDocument();
    resolveHook({title: [{pageName: "Big Page"}, {pageName:"Other Page"}], text: [{pageName: "Page With Text Match", resultLine: "There is some text searched here"}]});

    await waitFor( () => {});
    expect(screen.getByText('Big Page')).toBeInTheDocument();
    expect(screen.getByText('Other Page')).toBeInTheDocument();
    expect(screen.getByText('Page With Text Match')).toBeInTheDocument();
    let  textMatchLine = screen.getByTestId("textMatch-Page With Text Match");
    expect(textMatchLine).toHaveTextContent("Page With Text Match There is some text searched here");
    expect(within(textMatchLine).getByText("searched")).toHaveClass("match");
    expect(within(textMatchLine).getByText("text")).toHaveClass("match");
    
});

//  Needed, check render Links with namespaces.
//  Check render tag search with results
// Test render no title matches
//  Test render no text matches
// Test neither title nor text
// Test render missing resultLine, nothing to highlight
// Test change searchType
// Test search button
// Tset setUser (and unmount )
// Test tagSearch from dropdown