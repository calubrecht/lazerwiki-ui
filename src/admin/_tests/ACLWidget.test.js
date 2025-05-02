import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ACLWidget from '../ACLWidget';
import SiteSettings from "../SiteSettings.jsx";


var fetchNSPromise =  null;
var updateNSPromise = null;
let mockDS = {fetchNamespaces: jest.fn(() => fetchNSPromise),
    setNamespaceRestriction: jest.fn((site, ns, restrictionType) => {
        return updateNSPromise;
    })};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});


let selectNS = undefined;
jest.mock("../../NsTree", () => (props) => {
    let status = props.nsTree.children ? "loaded" : "unloaded";
    selectNS = props.selectNS;
    return <div>NSTree - {status}</div>;

});

beforeEach(() => {
    fetchNSPromise = Promise.resolve({"namespaces": {"fullNamespace": "", children:[{"fullNamespace": "ns1", children:[]}]}});
})


test('render', async () => {
    await act(async() => await render(<ACLWidget site="site1" users={["Bob", "Frank"]}/>));

    expect(screen.getByText("Access Control"));
    expect(screen.getByText("NSTree - loaded"));

});

test('loadRestrictionTypes', async () => {
    fetchNSPromise = Promise.resolve({"namespaces": {"fullNamespace": "", restriction_type: "OPEN", children:[
        {"fullNamespace": "ro", restriction_type: "WRITE_RESTRICTED",children:[]},
        {"fullNamespace": "hidden", restriction_type: "READ_RESTRICTED",children:[]}
            ]}});

    await act(async() => await render(<ACLWidget site="site1" users={["Bob", "Frank"]}/>));

    expect(screen.getByText("Access Control"));
    expect(screen.getByText("NSTree - loaded"));

    expect(screen.getByLabelText("Open Access")).toBeChecked();

    await act(() => selectNS("ro"));
    expect(screen.getByLabelText("Write Restricted")).toBeChecked();

    await act(() => selectNS("hidden"));
    expect(screen.getByLabelText("Read Restricted")).toBeChecked();
});

test('changeRestrictionTypes', async () => {
    fetchNSPromise = Promise.resolve({"namespaces": {"fullNamespace": "", restriction_type: "OPEN", children:[
                {"fullNamespace": "ro", restriction_type: "WRITE_RESTRICTED",children:[]},
                {"fullNamespace": "hidden", restriction_type: "READ_RESTRICTED",children:[]}
            ]}});

    await act(async() => await render(<ACLWidget site="site1" users={["Bob", "Frank"]}/>));

    expect(screen.getByText("Access Control"));
    expect(screen.getByText("NSTree - loaded"));

    await act(() => selectNS("ro"));
    expect(screen.getByLabelText("Write Restricted")).toBeChecked();

    let resolveCall = null;
    updateNSPromise = new Promise((resolve,) => resolveCall = resolve);
    await act(() => screen.getByLabelText("Open Access").click());
    expect(screen.getByLabelText("Open Access")).toBeChecked();
    await act(async () => await resolveCall({"namespaces": {"fullNamespace": "", restriction_type: "OPEN", children:[
                {"fullNamespace": "ro", restriction_type: "OPEN",children:[]},
                {"fullNamespace": "hidden", restriction_type: "READ_RESTRICTED",children:[]}
            ]}}));
    expect(screen.getByLabelText("Open Access")).toBeChecked();
    expect(mockDS.setNamespaceRestriction.mock.calls[0][2]).toBe("OPEN");

    updateNSPromise = new Promise((resolve,) => resolveCall = resolve);
    await act(() => screen.getByLabelText("Write Restricted").click());
    expect(screen.getByLabelText("Write Restricted")).toBeChecked();
    expect(mockDS.setNamespaceRestriction.mock.calls[1][2]).toBe("WRITE_RESTRICTED");
    await act(async() => await resolveCall({"namespaces": {"fullNamespace": "", restriction_type: "OPEN", children:[
                {"fullNamespace": "ro", restriction_type: "WRITE_RESTRICTED",children:[]},
                {"fullNamespace": "hidden", restriction_type: "READ_RESTRICTED",children:[]}
            ]}}));
    expect(screen.getByLabelText("Write Restricted")).toBeChecked();

    updateNSPromise = new Promise((resolve,) => resolveCall = resolve);
    await act(() => screen.getByLabelText("Read Restricted").click());
    expect(screen.getByLabelText("Read Restricted")).toBeChecked();
    expect(mockDS.setNamespaceRestriction.mock.calls[2][2]).toBe("READ_RESTRICTED");
    await act(async() => await resolveCall({"namespaces": {"fullNamespace": "", restriction_type: "OPEN", children:[
                {"fullNamespace": "ro", restriction_type: "READ_RESTRICTED",children:[], inherited_restriction_type:"OPEN"},
                {"fullNamespace": "hidden", restriction_type: "READ_RESTRICTED",children:[]}
            ]}}));
    expect(screen.getByLabelText("Read Restricted")).toBeChecked();

    updateNSPromise = new Promise((resolve,) => resolveCall = resolve);
    await act(() => screen.getByLabelText("Inherit (OPEN)").click());
    expect(screen.getByLabelText("Inherit (OPEN)")).toBeChecked();
    expect(mockDS.setNamespaceRestriction.mock.calls[2][2]).toBe("READ_RESTRICTED");
    await act(async() => await resolveCall({"namespaces": {"fullNamespace": "", restriction_type: "OPEN", children:[
                {"fullNamespace": "ro", restriction_type: "INHERIT",children:[], inherited_restriction_type:"OPEN"},
                {"fullNamespace": "hidden", restriction_type: "READ_RESTRICTED",children:[]}
            ]}}));
    expect(screen.getByLabelText("Inherit (OPEN)")).toBeChecked();

    // Obey response
    updateNSPromise = new Promise((resolve,) => resolveCall = resolve);
    await act(() => screen.getByLabelText("Write Restricted").click());
    expect(screen.getByLabelText("Write Restricted")).toBeChecked();
    expect(mockDS.setNamespaceRestriction.mock.calls[1][2]).toBe("WRITE_RESTRICTED");
    await act(async() =>  await resolveCall({"namespaces": {"fullNamespace": "", restriction_type: "OPEN", children:[
                {"fullNamespace": "ro", restriction_type: "OPEN",children:[]},
                {"fullNamespace": "hidden", restriction_type: "READ_RESTRICTED",children:[]}
            ]}}));
    expect(screen.getByLabelText("Open Access")).toBeChecked();
});

test("nsRoles", async () => {
    fetchNSPromise = Promise.resolve({"namespaces": {"fullNamespace": "", restriction_type: "OPEN", children:[
                {"fullNamespace": "ro", restriction_type: "WRITE_RESTRICTED",children:[]},
                {"fullNamespace": "hidden", restriction_type: "READ_RESTRICTED",children:[]}
            ]}});

    let setUserMap = jest.fn(() => {});
    let userMap = {Bob: {"userName": "Bob", "userRoles": ["ROLE_ADMIN", "ROLE_READ:bunk:ro", "ROLE_READ:site1:rw", "ROLE_WRITE:site1:ro"]},
        "Frank": {"userName": "Frank", "userRoles": []}};

    await act(async() => await render(<ACLWidget site="site1" users={["Bob", "Frank"]} userMap={userMap} setUserMap={setUserMap} />));

    expect(screen.getByText("Access Control"));
    expect(screen.getByText("NSTree - loaded"));

    expect(screen.getByTestId("userList")).not.toBeEnabled();
    expect(screen.getByTestId("roleList")).not.toBeEnabled();

    await act(() => selectNS("ro"));
    expect(screen.getByLabelText("Write Restricted")).toBeChecked();

    expect(screen.getByTestId("userList")).toBeEnabled();
    expect(screen.getByTestId("roleList")).toBeEnabled();

    await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'Frank'));

    expect(screen.getByText("Allow Read").selected).toBe(false);
    expect(screen.getByText("Allow Write").selected).toBe(false);
    expect(screen.getByText("Allow Upload").selected).toBe(false);
    expect(screen.getByText("Allow Delete").selected).toBe(false);

    await act( () => userEvent.selectOptions(screen.getByTestId('userList'), 'Bob'));
    expect(screen.getByText("Allow Read").selected).toBe(false);
    expect(screen.getByText("Allow Write").selected).toBe(true);
    expect(screen.getByText("Allow Upload").selected).toBe(false);
    expect(screen.getByText("Allow Delete").selected).toBe(false);

    await act( () => userEvent.selectOptions(screen.getByTestId('roleList'), 'UPLOAD'));
    let newUserMap = setUserMap.mock.calls[0][0];
    expect(newUserMap["Frank"]).toStrictEqual({"userName": "Frank", "userRoles": []});
    expect(newUserMap["Bob"]).toStrictEqual({"userName": "Bob",
        "userRoles":[ "ROLE_WRITE:site1:ro", "ROLE_UPLOAD:site1:ro", "ROLE_ADMIN", "ROLE_READ:bunk:ro", "ROLE_READ:site1:rw"]});

});