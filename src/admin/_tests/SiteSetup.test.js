import { render, screen, getByRole, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteSetup from '../SiteSetup';

let mockDS = {};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});

let realConsoleLog = console.log;

afterEach( () => {
  console.log = realConsoleLog;

});

test('render', () => {
  render(<SiteSetup activeSites={[{siteName:"Site 1", name:"site1"}, {siteName:"Site 2", name:"site2"}]}/>);

  expect(screen.getByText("Available Sites"));
  expect(screen.getByRole("option", {name: "Site 1"}));
  expect(screen.getByRole("option", {name: "Site 2"}));
  expect(screen.getByRole("button", {name:"Add New Site"}));
  expect(screen.getByRole("button", {name:"Delete Site"}));
});

test('addSite', async () => {
  let setSitesCB = jest.fn(() => {});
  render(<SiteSetup activeSites={[{siteName:"Site 1", name:"site1"}, {siteName:"Site 2", name:"site2"}]} setSites={setSitesCB}/>);
  await act( () => userEvent.click(screen.getByRole("button", {name: "Add New Site"})));
  let sitesRes = [{siteName:"Site 1", site:"site1"}, {siteName:"New Site", site:"newSite"}];
  mockDS.addSite = jest.fn(() => Promise.resolve(sitesRes));
  
  expect(screen.getByText("Available Sites"));
  
  let dlg= document.getElementsByClassName("addSiteDialog")[0];
  dlg.open = true;

  let siteInput = screen.getByLabelText("New Site:");
  let siteDisplayInput = screen.getByLabelText("Display Name:");
  let siteHostInput = screen.getByLabelText("Host Name:");
  await(siteInput.focus());
  await act( () => userEvent.keyboard("NewSite[TAB]New Site[TAB]Host"));
  expect(siteInput.value).toBe("NewSite");
  expect(siteDisplayInput.value).toBe("New Site");
  expect(siteHostInput.value).toBe("Host");

  await act( () => userEvent.click(screen.getByRole("button", {name: "Cancel"})));
  expect(siteInput.value).toBe("");
  expect(siteDisplayInput.value).toBe("");
  expect(siteHostInput.value).toBe("");

  await(siteInput.focus());
  await act( () => userEvent.keyboard("NewSite[TAB]New Site[TAB]newsite.com[ENTER]"));
  expect(mockDS.addSite.mock.calls[0][0]).toBe("NewSite");
  expect(mockDS.addSite.mock.calls[0][1]).toBe("New Site");
  expect(mockDS.addSite.mock.calls[0][2]).toBe("newsite.com");
  expect(setSitesCB.mock.calls[0][0]).toStrictEqual(sitesRes);

  await(siteInput.focus());
  await act( () => userEvent.keyboard("NewSite[TAB]New Site[TAB]newsite.com"));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Submit New Site"})));
  expect(mockDS.addSite.mock.calls[1][0]).toBe("NewSite");
  expect(mockDS.addSite.mock.calls[1][1]).toBe("New Site");
  expect(mockDS.addSite.mock.calls[1][2]).toBe("newsite.com");
  expect(setSitesCB.mock.calls[1][0]).toStrictEqual(sitesRes);

  // test error
  await(siteInput.focus());
  console.log = jest.fn(() => {});
  mockDS.addSite = jest.fn(() => Promise.reject("Server error"));
  await act( () => userEvent.keyboard("NewSite[TAB]New Site[TAB]newsite.com[ENTER]"));
  expect(console.log.mock.calls[0][0]).toBe("Server error");
});

test('deleteSite', async () => {
  let setSitesCB = jest.fn(() => {});
  render(<SiteSetup activeSites={[{siteName:"Site 1", name:"site1"}, {siteName:"Site 2", name:"site2"}]} setSites={setSitesCB}/>);
  
  let sitesRes = [{siteName:"Site 1", site:"site1"}];
  mockDS.deleteSite = jest.fn(() => Promise.resolve(sitesRes)); 
  
  await act( () => userEvent.selectOptions(screen.getByTestId('siteList'), 'Site 2'));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Delete Site"})));

  let dlg= document.getElementsByClassName("confirmDeleteDialog")[0];
  dlg.open = true;

  await act( () => userEvent.click(getByRole(dlg, "button", {name: "Cancel"})));
  expect(mockDS.deleteSite.mock.calls).toHaveLength(0);

  await act( () => userEvent.click(getByRole(dlg, "button", {name: "Delete Site"})));
  expect(mockDS.deleteSite.mock.calls).toHaveLength(0); // Delete doesn't work if what site name not entered

  let siteInput = screen.getByLabelText("Site Name:");
  await(siteInput.focus());
  await act( () => userEvent.keyboard("Site 2"));
  await waitFor( () => {});
  await act( () => userEvent.click(getByRole(dlg, "button", {name: "Delete Site"})));
  expect(mockDS.deleteSite.mock.calls).toHaveLength(1);
  expect(mockDS.deleteSite.mock.calls[0][0]).toBe("Site 2");

  expect(setSitesCB.mock.calls[0][0]).toStrictEqual(sitesRes);

    // test error
    await(siteInput.focus());
    console.log = jest.fn(() => {});
    mockDS.deleteSite = jest.fn(() => Promise.reject("Server error"));
    await act( () => userEvent.keyboard("Site 2"));
    await act( () => userEvent.click(getByRole(dlg, "button", {name: "Delete Site"})));
    expect(console.log.mock.calls[0][0]).toBe("Server error");
});
