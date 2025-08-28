import { render, screen, act, waitFor, queryByAttribute } from '@testing-library/react';
import {useEffect, useRef} from 'react';
import {instance as RES_instance} from '../RenderEnhancerService';


function ElementWithHidden(props) {
    let elRef = useRef();
    useEffect( () => {
        RES_instance().enhanceRenderedCode(elRef.current);
      }, []);

    let named = props.name ? "true" : "";
    let name = props.name ? props.name : "Hidden";
  
    return <div ref={elRef}><div className="hdn-toggle" data-named={named}>{name}</div><div>Not a button</div></div>
 }

 function NestedElementWithHidden(props) {
    let elRef = useRef();
    useEffect( () => {
        RES_instance().enhanceRenderedCode(elRef.current);
      }, []);
  
    return <div ref={elRef}><ElementWithHidden/></div>
 }
 

test('clickToHide', async () => {
    render(<ElementWithHidden/>);

    expect(screen.getByText('Hidden')).toBeInTheDocument();
    screen.getByText("Hidden").click();
    expect(screen.getByText('Hide')).toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    screen.getByText("Hide").click();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
    expect(screen.queryByText('Hide')).not.toBeInTheDocument();
});


test('clickToHideNested', async () => {
    render(<NestedElementWithHidden/>);

    expect(screen.getByText('Hidden')).toBeInTheDocument();
    screen.getByText("Hidden").click();
    expect(screen.getByText('Hide')).toBeInTheDocument();
    screen.getByText("Hide").click();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
});

test('clickNotAButtondoesnothing', async () => {
    render(<ElementWithHidden/>);

    expect(screen.getByText('Hidden')).toBeInTheDocument();
    screen.getByText("Not a button").click();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
});


test('clickToHideNamed', async () => {
    render(<ElementWithHidden name="bro"/>);

    expect(screen.getByText('bro')).toBeInTheDocument();
    screen.getByText("bro").click();
    expect(screen.getByText('bro')).toBeInTheDocument();
    screen.getByText("bro").click();
    expect(screen.getByText('bro')).toBeInTheDocument();
});