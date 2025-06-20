import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../../svc/UserService';
import AdminWidget from '../AdminWidget';

let dUser = {userName: 'joe', userRoles:[]};

let mockDS = {
    getSites: () => Promise.resolve([{siteName:"Site 1", name:"site1"}, {siteName:"Site 2", name:"site2"}, {siteName:"Site 3", name:"site3"}]),
    getGlobalSettings: () => Promise.resolve({settings: {enableSelfReg: true}}),
    setGlobalSettings: jest.fn(() => {}),
    getUsers: () => Promise.resolve([{userName:"User 1", userRoles:["ROLE_ADMIN", "ROLE_USER"]}, {userName:"User 2"}])
};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});

let  sliderChange = undefined;

jest.mock("../../SliderInput", () => (props) => {
    sliderChange = props.setter;
    return <div>Slider</div>;

});

jest.mock("../SiteSettings", () => (props) => <div>Settings for - {props.siteDisplayName} - {props.visible ? "visible" : "hidden"}</div>);

test('firstRender', () => {
    US_instance().setUser(null);
    render(<AdminWidget/>);
    document

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
});

test('renderAsUser, not admin', () => {
    US_instance().setUser({userName: "joe", siteName:"test", userRoles:["ROLE_USER"]});
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
});

test('renderAsUser, admin', () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN"]});
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).toBeInTheDocument();
});

test('renderAsUser, site admin', () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN:test"]});
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).toBeInTheDocument();
});

test('renderAsUser, user admin', () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_USERADMIN"]});
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).toBeInTheDocument();
});

test('render userChangesafter render', async () => {
    US_instance().setUser(null);
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
    await waitFor( () => US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN:test"]}));
    expect(screen.queryByText('admin')).toBeInTheDocument();
});


let siteSetupSetSitesCallback = null;

jest.mock("../SiteSetup", () => (props) => {
    siteSetupSetSitesCallback = props.setSites;
    return <div>SiteSetup-Sites={props.activeSites.map(site => site.siteName).join(",")}</div>;
});
jest.mock("../UserSetup", () => (props) => {
    return <div>UserSetup</div>;
});
  
test('render sidebar', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN"]});
    let component = render(<AdminWidget/>);

    await act ( () => userEvent.click(screen.getByRole("button", {name: "admin"})));
    let d = document.getElementsByClassName("AdminDialog")[0];
    document.getElementsByClassName("AdminDialog")[0].open = true;

    let sidebar = screen.getByLabelText("SettingSiteTabs");
    expect(within(sidebar).getByRole("button", {name: "Global Settings"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 1"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 2"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Global Settings"})).toHaveClass("selectedTab");

    expect(screen.getByText("SiteSetup-Sites=Site 1,Site 2,Site 3")).toBeInTheDocument();
    expect(screen.getByText("Slider")).toBeInTheDocument();

    await act( () => userEvent.click(screen.getByRole("button", {name: "X"})));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test('render sidebar as site Admin', async () => {
    US_instance().setUser({userName: "bob", siteName:"site1",userRoles:["ROLE_USER", "ROLE_ADMIN:site1"]});
    let component = render(<AdminWidget/>);

    await act( () => userEvent.click(screen.getByRole("button", {name: "admin"})));
    let d = document.getElementsByClassName("AdminDialog")[0];
    document.getElementsByClassName("AdminDialog")[0].open = true;

    let sidebar = screen.getByLabelText("SettingSiteTabs");
    expect(within(sidebar).queryByRole("button", {name: "Global Settings"})).not.toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 1"})).toBeInTheDocument();
    expect(within(sidebar).queryByRole("button", {name: "Site 2"})).not.toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 1"})).toHaveClass("selectedTab");

    await act( () => userEvent.click(screen.getByRole("button", {name: "X"})));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
}, 300000);

test('render sidebar as USerAdmin', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_USERADMIN"]});
    let component = render(<AdminWidget/>);

    await act ( () => userEvent.click(screen.getByRole("button", {name: "admin"})));
    let d = document.getElementsByClassName("AdminDialog")[0];
    document.getElementsByClassName("AdminDialog")[0].open = true;

    let sidebar = screen.getByLabelText("SettingSiteTabs");
    expect(within(sidebar).getByRole("button", {name: "Global Settings"})).toBeInTheDocument();
    expect(within(sidebar).queryByRole("button", {name: "Site 1"})).not.toBeInTheDocument();
    expect(within(sidebar).queryByRole("button", {name: "Site 2"})).not.toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Global Settings"})).toHaveClass("selectedTab");

    expect(screen.queryByText("SiteSetup-Sites=Site 1,Site 2,Site 3")).not.toBeInTheDocument();
    expect(screen.queryByText("Slider")).not.toBeInTheDocument();
});

test('selectTab', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN"]});
    let component = render(<AdminWidget/>);

    await act(()=>userEvent.click(screen.getByRole("button", {name: "admin"})));
    document.getElementsByClassName("AdminDialog")[0].open = true;

    let settingBody = screen.getByLabelText("SettingSiteBody");
    expect(within(settingBody).getByText("Global Settings")).toBeInTheDocument();
    expect(within(settingBody).getByText("SiteSetup-Sites=Site 1,Site 2,Site 3")).toBeInTheDocument();
    expect(within(settingBody).getByText("UserSetup")).toBeInTheDocument();

    let sidebar = screen.getByLabelText("SettingSiteTabs");
    await act(()=>userEvent.click(within(sidebar).getByRole("button", {name: "Site 1"})));
    expect(screen.getByText("Settings for - Site 1 - visible")).toBeInTheDocument();
    expect(screen.getByText("Settings for - Site 2 - hidden")).toBeInTheDocument();
    expect(screen.getByText("Settings for - Site 3 - hidden")).toBeInTheDocument();
});

test('update Sitelist', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN"]});
    let component = render(<AdminWidget/>);

    await act(()=>userEvent.click(screen.getByRole("button", {name: "admin"})));
    let d = document.getElementsByClassName("AdminDialog")[0];
    document.getElementsByClassName("AdminDialog")[0].open = true;

    let sidebar = screen.getByLabelText("SettingSiteTabs");
    expect(within(sidebar).getByRole("button", {name: "Global Settings"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 1"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 2"})).toBeInTheDocument();

    await waitFor( () => siteSetupSetSitesCallback([{siteName:"Site 1", name:"site1"}, {siteName:"Site 3", name:"site3"}, {siteName:"Site 5", name:"site5"}]));
    expect(within(sidebar).getByRole("button", {name: "Global Settings"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 1"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 3"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 5"})).toBeInTheDocument();
    expect(within(sidebar).queryByRole("button", {name: "Site 2"})).not.toBeInTheDocument();
});

test('test Slider', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN"]});
    let component = render(<AdminWidget/>);

    await act(()=>userEvent.click(screen.getByRole("button", {name: "admin"})));
    let d = document.getElementsByClassName("AdminDialog")[0];
    document.getElementsByClassName("AdminDialog")[0].open = true;

    act( () => sliderChange(true));

    expect(mockDS.setGlobalSettings.mock.calls.length).toBe(1);
    expect(mockDS.setGlobalSettings.mock.calls[0][0]).toStrictEqual({id: 1, settings:{enableSelfReg: true}});
});

