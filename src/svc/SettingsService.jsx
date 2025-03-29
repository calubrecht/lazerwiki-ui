import {instance as DS_instance} from './DataService';

class SettingsService {
    constructor() {
        this.settings = {};
        this.listeners = []
    }


    setSettings(settings) {
        this.settings = settings;
        this.triggerListeners();
    }

    getSettings() {
        return this.settings;
    }

    updateSettings(settings) {
        DS_instance().setGlobalSettings({id: 1, settings});
        this.setSettings(settings);
    }

    triggerListeners() {
        this.listeners.forEach((l) => l.setSettings(this.settings));
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
}

var INSTANCE = new SettingsService();

export function instance() {
    return INSTANCE;
}

/*export function setInstance(instance) {
    INSTANCE = instance;
}*/