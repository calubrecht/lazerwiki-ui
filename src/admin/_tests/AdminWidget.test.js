import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import { within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {instance as US_instance} from '../../svc/UserService';
import AdminWidget from '../AdminWidget';

let dUser = {userName: 'joe', userRoles:[]};

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

test('render userChangesafter render', async () => {
    US_instance().setUser(null);
    render(<AdminWidget/>);

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
    await waitFor( () => US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN:test"]}));
    expect(screen.queryByText('admin')).toBeInTheDocument();
});

let mockDS = {fetchSites: () => Promise.resolve(["Site 1", "Site 2"])};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});

jest.mock("../SiteSetup", () => (props) => {
    return <div>SiteSetup-Sites={props.activeSites.join(",")}</div>;
});
jest.mock("../UserSetup", () => (props) => {
    return <div>UserSetup</div>;
});
  
test('render sidebar', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN"]});
    let component = render(<AdminWidget/>);

    await userEvent.click(screen.getByRole("button", {name: "admin"}));
    let d = document.getElementsByClassName("AdminDialog")[0];
    document.getElementsByClassName("AdminDialog")[0].open = true;

    let sidebar = screen.getByLabelText("SettingSiteTabs");
    expect(within(sidebar).getByRole("button", {name: "Global Settings"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 1"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Site 2"})).toBeInTheDocument();
    expect(within(sidebar).getByRole("button", {name: "Global Settings"})).toHaveClass("selectedTab");

    await userEvent.click(screen.getByRole("button", {name: "X"}));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test('selectTab', async () => {
    US_instance().setUser({userName: "bob", siteName:"test",userRoles:["ROLE_USER", "ROLE_ADMIN"]});
    let component = render(<AdminWidget/>);

    await userEvent.click(screen.getByRole("button", {name: "admin"}));
    document.getElementsByClassName("AdminDialog")[0].open = true;

    let settingBody = screen.getByLabelText("SettingSiteBody");
    expect(within(settingBody).getByText("Global Settings")).toBeInTheDocument();
    expect(within(settingBody).getByText("SiteSetup-Sites=Site1,Site2")).toBeInTheDocument();
    expect(within(settingBody).getByText("UserSetup")).toBeInTheDocument();

    let sidebar = screen.getByLabelText("SettingSiteTabs");
    await userEvent.click(within(sidebar).getByRole("button", {name: "Site 1"}));
    expect(screen.getByText("Settings for - Site 1")).toBeInTheDocument();
});
