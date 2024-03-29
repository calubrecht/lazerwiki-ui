
var INSTANCE = null;

export default class UserService{
  constructor()
  {
    this.user = null;
    this.listeners = []
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

  getUser() {
    return this.user;
  }

  setUser(user) {
    this.user = user;
    this.triggerListeners();
  }

  triggerListeners() {
    this.listeners.forEach((l) => l.setUser(this.user));
  }

  /*
   * For after tests*/
  cleanup() {
    this.listeners = [];
  }
}

export function instance() {
    if (INSTANCE == null) {
      INSTANCE = new UserService();
    }
    return INSTANCE;
}

export function setInstance(instance) {
    INSTANCE = instance;
}
