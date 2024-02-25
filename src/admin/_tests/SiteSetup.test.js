import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
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
  await userEvent.click(screen.getByRole("button", {name: "Add New Site"}));
  let sitesRes = [{siteName:"Site 1", site:"site1"}, {siteName:"New Site", site:"newSite"}];
  mockDS.addSite = jest.fn(() => Promise.resolve(sitesRes));
  
  expect(screen.getByText("Available Sites"));
  
  let dlg= document.getElementsByClassName("addSiteDialog")[0];
  dlg.open = true;

  let siteInput = screen.getByLabelText("New Site:");
  let siteDisplayInput = screen.getByLabelText("Display Name:");
  let siteHostInput = screen.getByLabelText("Host Name:");
  await(siteInput.focus());
  await userEvent.keyboard("NewSite[TAB]New Site[TAB]Host");
  expect(siteInput.value).toBe("NewSite");
  expect(siteDisplayInput.value).toBe("New Site");
  expect(siteHostInput.value).toBe("Host");

  await userEvent.click(screen.getByRole("button", {name: "Cancel"}));
  expect(siteInput.value).toBe("");
  expect(siteDisplayInput.value).toBe("");
  expect(siteHostInput.value).toBe("");

  await(siteInput.focus());
  await userEvent.keyboard("NewSite[TAB]New Site[TAB]newsite.com[ENTER]");
  expect(mockDS.addSite.mock.calls[0][0]).toBe("NewSite");
  expect(mockDS.addSite.mock.calls[0][1]).toBe("New Site");
  expect(mockDS.addSite.mock.calls[0][2]).toBe("newsite.com");
  expect(setSitesCB.mock.calls[0][0]).toStrictEqual(sitesRes);

  await(siteInput.focus());
  await userEvent.keyboard("NewSite[TAB]New Site[TAB]newsite.com");
  await userEvent.click(screen.getByRole("button", {name: "Submit New Site"}));
  expect(mockDS.addSite.mock.calls[1][0]).toBe("NewSite");
  expect(mockDS.addSite.mock.calls[1][1]).toBe("New Site");
  expect(mockDS.addSite.mock.calls[1][2]).toBe("newsite.com");
  expect(setSitesCB.mock.calls[1][0]).toStrictEqual(sitesRes);

  // test error
  await(siteInput.focus());
  console.log = jest.fn(() => {});
  mockDS.addSite = jest.fn(() => Promise.reject("Server error"));
  await userEvent.keyboard("NewSite[TAB]New Site[TAB]newsite.com[ENTER]");
  expect(console.log.mock.calls[0][0]).toBe("Server error");
});
