import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import { within } from '@testing-library/dom';
import UserService, {instance as US_instance} from '../svc/UserService';
import userEvent from '@testing-library/user-event';
import HistoryFrame from '../HistoryFrame';

let mockHistory = [];
let resolveHistoryHook = null

let mockDS = {};

jest.mock("../svc/DataService", () => {
    return {instance: () => mockDS};

});

let selectNS = null;

jest.mock("../NsTree", () => (props) => { selectNS = props.selectNS; return props.nsTree.data; })

beforeEach(() => {
    mockHistory = [];
    mockDS.fetchPageHistory = jest.fn( ()=>new Promise((resolve, reject) => {resolveHistoryHook=resolve;}));
});


test('render empty Pages', async () => {
    let doClose = jest.fn(() => {});
    render(<HistoryFrame doClose={doClose} initData=""/> );
    await waitFor( () => {});
    expect(screen.getByText('Loading')).toBeInTheDocument();

    act( ()=>resolveHistoryHook([]));
    await waitFor( () => {});

    expect(screen.getByText('History - ROOT')).toBeInTheDocument();

    expect(screen.getByText('Could not find history for this page')).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", {"name": "X"}));

    expect(doClose.mock.calls).toHaveLength(1);
});

const getByTextContent = (text) => {
  return screen.getByText((content, element) => {
     const hasText = element => element.textContent.trim() === text;
     const elementHasText = hasText(element);
     const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
     return elementHasText && childrenDontHaveText;
  });
};


test('render Diff', async () => {
    let doClose = jest.fn(() => {});
    let h = [1, 2, 3];
    mockHistory = [
        {revision:1, modified:"2024-01-25", modifiedBy:"Bob", deleted:false},
        {revision:2, modified:"2024-01-26", modifiedBy:"Bob", deleted:true},
        {revision:3, modified:"2024-01-27", modifiedBy:"Bob", deleted:false},


    ];
    let diffInfo = [
        {first:1, second: "This is the first line"},
        {first:2, second: "This is the second line"},
        {first:-1, second: "This line <span>was new</span>"},
        {first:3, second: "This is in both again"}
    ];
    mockDS.fetchPageDiff = jest.fn(() => Promise.resolve(diffInfo));
    render(<HistoryFrame doClose={doClose} initData="page1"/> );
    await waitFor( () => {});
    act( () => resolveHistoryHook(mockHistory));
    await waitFor( () => {});

    expect(screen.getByText('Current - Modified 2024-01-27 - by Bob')).toBeInTheDocument();
    expect(screen.getByText('Revision 2 - Deleted 2024-01-26 - by Bob')).toBeInTheDocument();
    expect(screen.getByText('Revision 1 - Modified 2024-01-25 - by Bob')).toBeInTheDocument();
    expect(screen.getByText('History - page1')).toBeInTheDocument();
    
    let diffSelectors = screen.getAllByRole("button", {name:"diffSelect"});
    expect(diffSelectors).toHaveLength(3);

    // Diffing between rev 3 and 1
    await act(() => userEvent.click(diffSelectors[0]));
    await act(() => userEvent.click(diffSelectors[2]));
    await act(() => userEvent.click(screen.getByRole("button", {name: "View Diff"})));
    await waitFor( () => {});

    expect(screen.getByText("Diff - page1 - 1 -> 3"));

    expect(getByTextContent("Line: 1 - This is the first line")).toBeInTheDocument();
    expect(getByTextContent("Line: 2 - This is the second line")).toBeInTheDocument();
    expect(getByTextContent("- This line was new")).toBeInTheDocument();
    // diffInfo was rendered as html, and "was new" is now in its own element
    expect(screen.getByText("was new")).toBeInTheDocument();
    expect(getByTextContent("Line: 3 - This is in both again")).toBeInTheDocument();




    await act(() => userEvent.click(screen.getByRole("button", {name: "Back"})));
    expect(screen.getByText('History - page1')).toBeInTheDocument();

});


test('setUser', async () => {
    jest.clearAllMocks();
    render(<HistoryFrame  /> );
    await waitFor( () => {});

    expect(mockDS.fetchPageHistory.mock.calls).toHaveLength(1);

    act( () => US_instance().setUser({user: "Bob"}));
    await waitFor( () => {});
    expect(mockDS.fetchPageHistory.mock.calls).toHaveLength(2);
});

test('doSelect', async () => {
    let doClose = jest.fn(() => {});
    let h = [1, 2, 3];
    mockHistory = [
        {revision:1, modified:"2024-01-25", modifiedBy:"Bob", deleted:false},
        {revision:2, modified:"2024-01-26", modifiedBy:"Bob", deleted:true},
        {revision:3, modified:"2024-01-27", modifiedBy:"Bob", deleted:false},
        {revision:4, modified:"2024-01-27", modifiedBy:"Bob", deleted:false},


    ];

    render(<HistoryFrame doClose={doClose} initData="page1"/> );
    await waitFor( () => {});
    act( () => resolveHistoryHook(mockHistory));
    await waitFor( () => {});

    let diffSelectors = screen.getAllByRole("button", {name:"diffSelect"});
    await act(() => userEvent.click(diffSelectors[0]));
    // selecting maxRevision first, sets it as endSelect, with no start select
    expect(within(diffSelectors[0]).queryByAltText("endSelect")).toBeInTheDocument();

    await act(() => userEvent.click(diffSelectors[2]));
    expect(within(diffSelectors[0]).queryByAltText("endSelect")).toBeInTheDocument();
    expect(within(diffSelectors[2]).queryByAltText("startSelect")).toBeInTheDocument();

    await act(() => userEvent.click(diffSelectors[1]));
    expect(within(diffSelectors[0]).queryByAltText("noSelect")).toBeInTheDocument();
    expect(within(diffSelectors[1]).queryByAltText("endSelect")).toBeInTheDocument();
    expect(within(diffSelectors[2]).queryByAltText("startSelect")).toBeInTheDocument();

    // Selecting current end state, flips end to start and sets end at max revision
    await act(() => userEvent.click(diffSelectors[1]));
    expect(within(diffSelectors[0]).queryByAltText("endSelect")).toBeInTheDocument();
    expect(within(diffSelectors[1]).queryByAltText("startSelect")).toBeInTheDocument();
    expect(within(diffSelectors[2]).queryByAltText("noSelect")).toBeInTheDocument();

    // Move start select down
    await act(() => userEvent.click(diffSelectors[3]));
    expect(within(diffSelectors[0]).queryByAltText("endSelect")).toBeInTheDocument();
    expect(within(diffSelectors[1]).queryByAltText("noSelect")).toBeInTheDocument();
    expect(within(diffSelectors[3]).queryByAltText("startSelect")).toBeInTheDocument();

    await act(() => userEvent.click(diffSelectors[2]));
    // Move end select up
    await act(() => userEvent.click(diffSelectors[1]));
    expect(within(diffSelectors[1]).queryByAltText("endSelect")).toBeInTheDocument();
    expect(within(diffSelectors[2]).queryByAltText("noSelect")).toBeInTheDocument();
    expect(within(diffSelectors[3]).queryByAltText("startSelect")).toBeInTheDocument();

});

test('render show historical page', async () => {
    let doClose = jest.fn(() => {});
    let h = [1, 2, 3];
    let hr = h.toReversed();
    mockHistory = [
        {revision:1, modified:"2024-01-25", modifiedBy:"Bob", deleted:false},
        {revision:2, modified:"2024-01-26", modifiedBy:"Bob", deleted:true},
        {revision:3, modified:"2024-01-27", modifiedBy:"Bob", deleted:false},


    ];
    let pageData =  "This is a page <div>That is rendered</div>";
    mockDS.fetchHistoricalPage = jest.fn(() => Promise.resolve({rendered: pageData}));
    render(<HistoryFrame doClose={doClose} initData="page1"/> );
    await waitFor( () => {});
    act( () => resolveHistoryHook(mockHistory));
    await waitFor( () => {});

    await act(() =>  userEvent.click(screen.getByText('Revision 1 - Modified 2024-01-25 - by Bob')));

    expect(screen.getByText("page1 - 1")).toBeInTheDocument();
    expect(screen.getByText("That is rendered")).toBeInTheDocument();

    await act(() => userEvent.click(screen.getByRole("button", {name: "Back"})));
    expect(screen.getByText('History - page1')).toBeInTheDocument();

}, 300000);