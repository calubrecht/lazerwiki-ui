var INSTANCE = null;

export default class DataService
{
  constructor()
  {
    this.handleErrors = this.handleErrors.bind(this);
    this.apiServer = import.meta.env.VITE_REACT_APP_API_SERVER;
    //this.apiServer = '/app';
    this.baseRequest = this.apiServer + '/api/';
  }

  /**
   * Make sure we have an CSRF token
   */
  init() {
    fetch(this.baseRequest + 'csrf')
         .then(this.handleErrors);
  }
  
  
  handleErrors(response)
  {
    if (!response.ok)
    {
      if (response.status === 403)
      {
        throw Error('403');
      }
      if (response.status === 400)
      {
         let e = Error();
         e.message = response.text().then( r=> {return r});
         throw e;
      }
      throw Error(response.statusText);
    }
    return response;
  } 

  fetchPage(pageDescriptor)
  {
    return fetch(
      this.baseRequest + 'page/' + pageDescriptor).then(this.handleErrors).then(response => response.text());
  }

  getUIVersion() 
  {
    return fetch('/meta.json')
      .then((response) => response.json());
  }
  
  getVersion() 
  {
    return fetch(
      this.baseRequest + 'version')
         .then(this.handleErrors)
         .then(res => res.text().then(r=> {return r}));
  }

  getUser() {
    return fetch(
      this.baseRequest + 'sessions/username')
         .then(this.handleErrors)
         .then(res => res.text().then(r=> {return r}));
  }
  
  login(username, password)
  {
    return fetch(
      this.baseRequest + 'sessions/login',
       {method: 'post', body: JSON.stringify({username: username, password:password}), credentials: 'include',
         headers: this.getPostHeaders() })
         .then(this.handleErrors)
         .then(response => response.text());
  }
  
  getTokenCookie()
  {
    let cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='));
    return cookie ? cookie.split('=')[1] : null;
  }
  
  getPostHeaders()
  {
    return {
      'Content-Type': 'application/json',
      'x-xsrf-token': this.getTokenCookie()
    }
  }
}

export function instance() {
    if (INSTANCE == null) {
      INSTANCE = new DataService();
    }
    return INSTANCE;
}

export function setInstance(instance) {
    INSTANCE = instance;
}
