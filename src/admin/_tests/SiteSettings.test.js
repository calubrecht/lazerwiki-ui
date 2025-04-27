import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteSettings from '../SiteSettings';


test('render', () => {
  render(<SiteSettings siteDisplayName="Test Site" visible={true} siteName="testSite"/>);

  expect(screen.getByText("Settings for - Test Site"));
  expect(screen.getByRole("group", {name: "SettingSiteBody"}));
  expect(screen.getByLabelText('Site Name:')).toBeInTheDocument();
  expect(screen.getByLabelText('Site Name:').value).toBe("testSite");
});

test('render novisible', () => {
  render(<SiteSettings siteDisplayName="Test Site" visible={false} siteName="testSite"/>);

  expect(screen.getByText("Settings for - Test Site"));
  expect(screen.getByRole("group", {name: "SettingSiteBodyHidden"}));
  expect(screen.getByLabelText('Site Name:')).toBeInTheDocument();
  expect(screen.getByLabelText('Site Name:').value).toBe("testSite");
});

test('enterField', async () => {
  render(<SiteSettings siteDisplayName="Test Site" visible={true} siteName="testSite" siteHostname="host" siteSettings={{}}/>);
    
  await waitFor( () => {});
  expect(screen.getByLabelText('Site Name:').value).toBe("testSite");
  expect(screen.getByLabelText('Site Hostname:').value).toBe("host");
  screen.getByLabelText("Site Hostname:").focus();
  
  await act( () => userEvent.keyboard("1"));
  expect(screen.getByLabelText('Site Hostname:').value).toBe("host1");

});


var saveSettingsPromise =  null;
var fetchNSPromise =  null;
let mockDS = {saveSiteSettings: jest.fn(() => saveSettingsPromise),
      fetchNamespaces: jest.fn(() => fetchNSPromise)};

jest.mock("../../svc/DataService", () => {
  return {instance: () => mockDS};

});

beforeEach(() => {
  fetchNSPromise = Promise.resolve({"namespaces": {"fullNamespace": "", children:[]}});
})

test('button', async () => {
  render(<SiteSettings siteDisplayName="Test Site" visible={true} siteName="testSite" siteHostname="host" siteSettings={{}}/>);
    
  await waitFor( () => {});
  screen.getByLabelText("Site Hostname:").focus();

  await act( () => userEvent.keyboard("1"));
  expect(screen.getByLabelText('Site Hostname:').value).toBe("host1");

  saveSettingsPromise =  Promise.resolve({site: {hostName: "host1", settings: "{}"}, success: true, msg:""})
  await act( () => userEvent.click(screen.getByRole("button", {name: "Save"})));

  expect(mockDS.saveSiteSettings).toHaveBeenCalled();
  saveSettingsPromise =  Promise.resolve({site: {hostName: "host1", settings: "{}"}, success: false, msg:"oops"})
  screen.getByLabelText("Settings:").focus();

  await act( () => userEvent.keyboard("1"));
  await act( () => userEvent.click(screen.getByRole("button", {name: "Save"})));

  await waitFor( () => {});

  expect(screen.getByText("oops"));

});
