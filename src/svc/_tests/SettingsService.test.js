import {instance} from '../SettingsService';

let mockDS = {
    setGlobalSettings: jest.fn(() => {})
};

jest.mock("../../svc/DataService", () => {
    return {instance: () => mockDS};

});

test('test instance', ()  => {
    let instance1 = instance();
    let instance2 = instance();
    expect(instance1).toBe(instance2);
});


test('test listeners', ()  => {
    let settingsService = instance();

    let listener = {setSettings: jest.fn( () => {})};
    settingsService.addListener(listener);

    expect(settingsService.listeners).toHaveLength(1);

    settingsService.updateSettings({setting1: "1", setting2: "2"})

    expect(listener.setSettings.mock.calls[0][0]).toEqual({setting1: "1", setting2: "2"});
    expect(mockDS.setGlobalSettings.mock.calls[0][0]).toEqual({id: 1, settings: {setting1: "1", setting2: "2"}});

    expect(settingsService.getSettings()).toEqual({setting1: "1", setting2: "2"});

    settingsService.removeListener(listener);

    expect(settingsService.listeners).toHaveLength(0);

    settingsService.removeListener(listener);
});