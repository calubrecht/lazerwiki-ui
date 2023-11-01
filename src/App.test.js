import { render, screen, act } from '@testing-library/react';
import App from './App';

/**
 * Replace this. Should mock out svc so fetch never gets called here
 */
global.fetch = jest.fn( () =>  new Promise ( () => {}));
test('renders ', () => {
    render(<App />);
}
);
