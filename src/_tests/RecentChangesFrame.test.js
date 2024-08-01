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

    act( ()=>resolveHistoryHook({"changes":[]}));
    await waitFor( () => {});

    expect(screen.getByText('Recent Changes')).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", {"name": "X"}));

    expect(doClose.mock.calls).toHaveLength(1);
});

test('render some Pages', async () => {
    let doClose = jest.fn(() => {});
    render(<RecentChangesFrame doClose={doClose} initData=""/> );
    act( ()=>resolveHistoryHook({"changes": [{pageDesc: {pagename: "Page 1", namespace: '', revision: 5, modifiedBy:"Bob"}, action: "Modified"},
        {pageDesc: {pagename: "Page 2", namespace: '', revision: 3, modifiedBy:"Bob"}, action: "Deleted"},
        {pageDesc: {pagename: "PageIn NS", namespace: "ns", revision: 1, modifiedBy:"Bob"}, action: "Created"},
        {pageDesc: {pagename: "", namespace: '', revision: 5, modifiedBy:"Bob"}, action: "Modified"}
    
    ]}));
    await waitFor( () => {});

    expect(screen.getByText('Recent Changes')).toBeInTheDocument();
    let elel = screen.getByText('Recent Changes');
    await waitFor( () => {});
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'Page 1 r5 - Modified by Bob')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'Page 2 - Deleted by Bob')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === 'ns:PageIn NS r1 - Created by Bob')).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SPAN' && element.textContent === '<ROOT> r5 - Modified by Bob')).toBeInTheDocument();
}, 60000);

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

