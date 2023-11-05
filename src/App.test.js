import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import App from './App';
import {setInstance as set_DS_instance} from './svc/DataService';


/**
 * Move these to test for rootFrame
 */
var ds = {
  getUIVersion: () => Promise.resolve({version: "TEST"}),
  getVersion: () => Promise.resolve({version: "TEST"}),
  fetchPage: () => Promise.resolve("data")
};

//set_DS_instance(ds);

jest.mock("./rootFrame", () => () => {
  return <div className="RootFrame">Mocked Root</div>;
});

test('renders ', async () => {
    //render(<App />);
    await waitFor( () => {
      render(<App />);
    });
    let rootFrame = screen.getByText('Mocked Root');
    expect(rootFrame).not.toBeNull(); 
}
);
