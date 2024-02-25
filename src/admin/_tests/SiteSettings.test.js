import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteSettings from '../SiteSettings';


test('render', () => {
  render(<SiteSettings siteDisplayName="Test Site" visible={true} siteName="testSite"/>);

  expect(screen.getByText("Settings for - Test Site"));
  expect(screen.getByRole("group", {name: "SettingSiteBody"}));
  expect(screen.getByLabelText('Site Name:')).toBeInTheDocument();
  expect(screen.getByLabelText('Site Name:').value).toBe("Test Site");
});

test('render novisible', () => {
  render(<SiteSettings siteDisplayName="Test Site" visible={false} siteName="testSite"/>);

  expect(screen.getByText("Settings for - Test Site"));
  expect(screen.getByRole("group", {name: "SettingSiteBodyHidden"}));
  expect(screen.getByLabelText('Site Name:')).toBeInTheDocument();
  expect(screen.getByLabelText('Site Name:').value).toBe("Test Site");
});

test('enterField', async () => {
  render(<SiteSettings siteDisplayName="Test Site" visible="true" siteName="testSite"/>);
    
  await waitFor( () => {});
  screen.getByLabelText('Site Name:').focus();

  await userEvent.keyboard("1");

  expect(screen.getByLabelText('Site Name:').value).toBe("Test Site1");
});
