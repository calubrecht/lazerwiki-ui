import UserService, {instance} from '../UserService';

test('test instance', ()  => {
  let instance1 = instance();
  let instance2 = instance();
  expect(instance1).toBe(instance2);
});


test('test listeners', ()  => {
    let userService = instance();

    let listener = {setUser: jest.fn( () => {})};
    userService.addListener(listener);

    expect(userService.listeners).toHaveLength(1);

    userService.setUser("User");

    expect(listener.setUser.mock.calls[0][0]).toEqual("User");

    expect(userService.getUser()).toEqual("User");

    userService.removeListener(listener);

    expect(userService.listeners).toHaveLength(0);
  });