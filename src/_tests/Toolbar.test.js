import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import Toolbar from '../Toolbar';
import {setInstance as set_DS_instance} from '../svc/DataService';

let originalLog = console.log
afterEach( () => {console.log = originalLog;});

var ds = {
    fetchPage: () => Promise.resolve({rendered: "1 Item", flags: {exists:true}})
  };
  
  jest.mock("../DrawerLink", () => (props) => {
    return <div className="Drawer">{props.component}</div>;
  });

  test('renders ', async () => {
    set_DS_instance(ds);
    await act(() => render(<Toolbar />));

    await waitFor(() => {
        let userTB = screen.getByText('1 Item');
        expect(userTB).not.toBeNull();
    });
});


test('renderMissingUserToolbar ', async () => {
    console.log = jest.fn(() => {});
    let ds2 = {
        fetchPage: () => Promise.resolve({rendered: "1 Item", flags: {exists:false}})
      };
    set_DS_instance(ds2);
    await act(() => render(<Toolbar />));

    await waitFor(() => {
        expect(screen.queryByText('1 Item')).not.toBeInTheDocument();
    });
    expect(console.log.mock.calls[0][0]).toBe("No user toolbar info found. To add your own entries, create a page name _meta:toolbar");
    ds2.fetchPage = () => Promise.reject({message:"Not Found"});
    await act(() => render(<Toolbar />));

    await waitFor(() => {
        expect(screen.queryByText('1 Item')).not.toBeInTheDocument();
    });
    // Not found to fail silently
    expect(console.log.mock.calls).toHaveLength(1);
    ds2.fetchPage = () => Promise.reject({message:"Internal Server Error"});
    await act(() => render(<Toolbar />));
    await waitFor(() => {
        expect(screen.queryByText('1 Item')).not.toBeInTheDocument();
    });
    // Not found to fail silently
    expect(console.log.mock.calls[1][0]).toStrictEqual({"message": "Internal Server Error"});
}
);