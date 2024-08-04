import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import { within } from '@testing-library/dom';
import UserService, {instance as US_instance} from '../svc/UserService';
import userEvent from '@testing-library/user-event';
import RecentChangesFrame from '../RecentChangesFrame';

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
    mockDS.fetchRecentChanges = jest.fn( ()=>new Promise((resolve, reject) => {resolveHistoryHook=resolve;}));
});


test('render empty Pages', async () => {
    let doClose = jest.fn(() => {});
    render(<RecentChangesFrame doClose={doClose} initData=""/> );
    await waitFor( () => {});
    expect(screen.getByText('Loading')).toBeInTheDocument();

    act( ()=>resolveHistoryHook({"merged":[]}));
    await waitFor( () => {});

    expect(screen.getByText('Recent Changes')).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", {"name": "X"}));

    expect(doClose.mock.calls).toHaveLength(1);
});

test('render some Pages', async () => {
    let doClose = jest.fn(() => {});
    render(<RecentChangesFrame doClose={doClose} initData=""/> );
    act( ()=>resolveHistoryHook({"merged": [{pageDesc: {pagename: "Page 1", namespace: '', revision: 5, modifiedBy:"Bob", modified: "2024-08-01"}, action: "Modified"},
        {pageDesc: {pagename: "Page 2", namespace: '', revision: 3, modifiedBy:"Bob", modified: "2024-07-02"}, action: "Deleted"},
        {pageDesc: {pagename: "PageIn NS", namespace: "ns", revision: 1, modifiedBy:"Bob", modified: "2024-06-01"}, action: "Created"},
        {pageDesc: {pagename: "", namespace: '', revision: 5, modifiedBy:"Bob", modified: "2024-05-01"}, action: "Modified"},
        {fileName: "img1.jpg", namespace: '', ts:"2023-12-01", uploadedBy: "Jim", action: "Uploaded", id:1},
        {fileName: "img2.jpg", namespace: 'ns', ts:"2022-12-01", uploadedBy: "Jim", action: "Replaced", id:2},
    
    ]}));
    await waitFor( () => {});

    expect(screen.getByText('Recent Changes')).toBeInTheDocument();
    let elel = screen.getByText('Recent Changes');
    await waitFor( () => {});
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'Page 1 r5 - Modified by Bob - 2024-08-01')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'Page 2 - Deleted by Bob - 2024-07-02')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'ns:PageIn NS r1 - Created by Bob - 2024-06-01')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === '<ROOT> r5 - Modified by Bob - 2024-05-01')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'img1.jpg - Uploaded by Jim - 2023-12-01')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'ns:img2.jpg - Replaced by Jim - 2022-12-01')).toBeInTheDocument();
});

test('filter changes', async () => {
    let doClose = jest.fn(() => {});
    render(<RecentChangesFrame doClose={doClose} initData=""/> );
    act( ()=>resolveHistoryHook({"merged": [{pageDesc: {pagename: "Page 1", namespace: '', revision: 5, modifiedBy:"Bob", modified: "2024-08-01"}, action: "Modified"},
        {pageDesc: {pagename: "Page 2", namespace: '', revision: 3, modifiedBy:"Bob", modified: "2024-07-02"}, action: "Deleted"},
        {pageDesc: {pagename: "PageIn NS", namespace: "ns", revision: 1, modifiedBy:"Bob", modified: "2024-06-01"}, action: "Created"},
        {pageDesc: {pagename: "", namespace: '', revision: 5, modifiedBy:"Bob", modified: "2024-05-01"}, action: "Modified"},
        {fileName: "img1.jpg", namespace: '', ts:"2023-12-01", uploadedBy: "Jim", action: "Uploaded", id:1},
        {fileName: "img2.jpg", namespace: 'ns', ts:"2022-12-01", uploadedBy: "Jim", action: "Replaced", id:2}
    ],"changes": [{pageDesc: {pagename: "Page 1", namespace: '', revision: 5, modifiedBy:"Bob", modified: "2024-08-01"}, action: "Modified"},
        {pageDesc: {pagename: "Page 2", namespace: '', revision: 3, modifiedBy:"Bob", modified: "2024-07-02"}, action: "Deleted"},
        {pageDesc: {pagename: "PageIn NS", namespace: "ns", revision: 1, modifiedBy:"Bob", modified: "2024-06-01"}, action: "Created"},
        {pageDesc: {pagename: "", namespace: '', revision: 5, modifiedBy:"Bob", modified: "2024-05-01"}, action: "Modified"}],
    "mediaChanges": [
        {fileName: "img1.jpg", namespace: '', ts:"2023-12-01", uploadedBy: "Jim", action: "Uploaded", id:1},
        {fileName: "img2.jpg", namespace: 'ns', ts:"2022-12-01", uploadedBy: "Jim", action: "Replaced", id:2}
    ]}));
    await waitFor( () => {});

    expect(screen.getByText('Recent Changes')).toBeInTheDocument();
    let elel = screen.getByText('Recent Changes');
    await waitFor( () => {});

    let filterAll = screen.getByLabelText("All");
    expect(filterAll).toBeChecked();
    let filterPages = screen.getByLabelText("Pages");
    act( () =>  filterPages.click());
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'Page 1 r5 - Modified by Bob - 2024-08-01')).toBeInTheDocument();
    expect(screen.queryByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'img1.jpg - Uploaded by Jim - 2023-12-01')).not.toBeInTheDocument();

    let filterMedia = screen.getByLabelText("Media");
    act( () =>  filterMedia.click());
    expect(screen.queryByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'Page 1 r5 - Modified by Bob - 2024-08-01')).not.toBeInTheDocument();
    expect(screen.queryByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'img1.jpg - Uploaded by Jim - 2023-12-01')).toBeInTheDocument();

});

const getByTextContent = (text) => {
  return screen.getByText((content, element) => {
     const hasText = element => element.textContent.trim() === text;
     const elementHasText = hasText(element);
     const childrenDontHaveText = Array.from(element?.children || []).every(child => !hasText(child));
     return elementHasText && childrenDontHaveText;
  });
};


test('setUser', async () => {
    jest.clearAllMocks();
    render(<RecentChangesFrame  /> );
    await waitFor( () => {});

    expect(mockDS.fetchRecentChanges.mock.calls).toHaveLength(1);

    act( () => US_instance().setUser({user: "Bob"}));
    await waitFor( () => {});
    expect(mockDS.fetchRecentChanges.mock.calls).toHaveLength(2);
});

