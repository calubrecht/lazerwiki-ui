import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextArea from '../TextArea';

const onChange = jest.fn(() => {});

test('render', () => {
  const {container} = render(<div><TextArea name="t1" className="SomeClass" label="theLabel" varName="var" onChange={onChange}/><TextArea name="t2" label="classless" varName="var2" onChange={onChange}/></div>)


  expect(screen.getByText("theLabel")).toBeInTheDocument();
  expect(screen.getByLabelText("theLabel")).toBeInTheDocument();
  expect(screen.getByText("classless")).toBeInTheDocument();
  expect(screen.getByLabelText("classless")).toBeInTheDocument();
  expect(container.getElementsByClassName('SomeClass').length).toBe(1);
  expect(container.getElementsByClassName('TextArea').length).toBe(1);
});

test('change', async () => {
  render(<TextArea name="t1" className="SomeClass" label="theLabel" varName="var" onChange={onChange}/>)

  let area = screen.getByLabelText("theLabel");

  area.focus();
  await userEvent.keyboard("someText");

  expect(onChange.mock.toHaveBeenCalled);

});

