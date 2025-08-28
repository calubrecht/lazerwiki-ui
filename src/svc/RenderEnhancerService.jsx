var INSTANCE = null;

export default class RenderEnhancerService{

    enhanceRenderedCode(rootElement) {
        // Add JS for hidden elements
        rootElement.addEventListener("click", handleToggle);
    }
}

function handleToggle(ev) {
    if (ev.target.attributes["data-named"]?.value === "true") {
        ev.handled = true;
        return;
    }
    if (ev.target.classList.contains('hdn-toggle') && !ev.handled) {
        if (ev.target.innerHTML === 'Hidden') {
            ev.target.innerHTML = 'Hide';
        } else {
            ev.target.innerHTML = 'Hidden';
        }
        ev.handled = true;
    }

}



export function instance() {
    if (INSTANCE == null) {
      INSTANCE = new RenderEnhancerService();
    }
    return INSTANCE;
}