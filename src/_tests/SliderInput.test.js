import { render, screen } from '@testing-library/react';
import SliderInput from '../SliderInput';


test('render', () => {

    let val;
    let setter = (t) => {val = t}
    render(<div><SliderInput label="theSlider" value={true} setter={setter} id="someId"/></div>);


    expect(screen.getByText("theSlider")).toBeInTheDocument();
    expect(screen.getByLabelText("theSlider")).toBeInTheDocument();
    expect(screen.getByLabelText("theSlider")).toBeChecked();
    screen.getByLabelText("theSlider").click();

    expect(val).toBe(false);
});