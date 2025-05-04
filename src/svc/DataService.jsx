var INSTANCE = null;


export const FOUR_O_THREE = 'Operation Not Permitted';

export default class DataService
{

  constructor()
  {
    this.handleErrors = this.handleErrors.bind(this);
    this.apiServer = import.meta.env.VITE_REACT_APP_API_SERVER;
    this.baseRequest = this.apiServer + '/api/';
    this.baseMediaRequest = '/_media/';
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
        throw Error(FOUR_O_THREE);
      }
      if (response.status === 400)
      {
         let e = Error();
         e.promise = response.text();
         throw e;
      }
      let text = response.text();
      if (text) {
        let e = Error(response.statusText);
        e.promise = text;
        throw e;
      }
      throw Error(response.statusText);
    }
    return response;
  }

  fetchPage(pageDescriptor)
  {
    return fetch(
      this.baseRequest + 'page/get/' + pageDescriptor).then(this.handleErrors).then(response => response.json());
  }
  
  fetchHistoricalPage(pageDescriptor, revision)
  {
    if (pageDescriptor != '') {
      pageDescriptor = pageDescriptor + '/';
    }
    return fetch(
      this.baseRequest + 'page/getHistorical/' + pageDescriptor + revision).then(this.handleErrors).then(response => response.json());
  }
  
  fetchPageHistory(pageDescriptor)
  {
    return fetch(
      this.baseRequest + 'page/history/' + pageDescriptor).then(this.handleErrors).then(response => response.json());
  }

  fetchRecentChanges()
  {
    return fetch(
      this.baseRequest + 'history/recentChanges').then(this.handleErrors).then(response => response.json());
  }
  
  fetchPageDiff(pageDescriptor, rev1, rev2)
  {
    
    if (pageDescriptor != '') {
      pageDescriptor = pageDescriptor + '/';
    }
    return fetch(
      this.baseRequest + 'page/diff/' + pageDescriptor + rev1 + "/" + rev2).then(this.handleErrors).then(response => response.json());
  }

  fetchImageList() {
    return fetch(
      this.baseMediaRequest + 'list').then(this.handleErrors).then(response => response.json());
  }

  fetchPageList() {
    return fetch(
      this.baseRequest + 'page/listPages').then(this.handleErrors).then(response => response.json());
  }

  fetchNamespaces(site) {
    return fetch(
        this.baseRequest + 'page/listNamespaces/' + site).then(this.handleErrors).then(response => response.json());
  }
  
  doPageSearch(searchTerm) {
    return fetch(
      this.baseRequest + 'page/searchPages?search='+ encodeURIComponent(searchTerm) ).then(this.handleErrors).then(response => response.json());
  }
  
  fetchTagList() {
    return fetch(
      this.baseRequest + 'page/listTags').then(this.handleErrors).then(response => response.json());
  }

  getPageLock(pageDescriptor) {
    return fetch(
      this.baseRequest + 'page/lock/' + pageDescriptor,
       {method: 'post', credentials: 'include',
         headers: this.getPostHeaders() }).then(response => response.json());
  }

  overrideLock(pageDescriptor) {
    return fetch(
      this.baseRequest + 'page/lock/' + pageDescriptor + "?overrideLock=true",
       {method: 'post', credentials: 'include',
         headers: this.getPostHeaders() }).then(response => response.json());
  }

  clearLock(pageDescriptor, pageLockId) {
    return fetch(
      this.baseRequest + 'page/releaseLock/' + pageDescriptor + '/id/' + pageLockId,
       {method: 'post', credentials: 'include',
         headers: this.getPostHeaders() });
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
  
  getSiteName()
  {
    return fetch(
      this.baseRequest + 'site/')
         .then(this.handleErrors)
         .then(res => res.text().then(r=> {return r}));
  }

  getPluginMenus()
  {
    return fetch(
      this.baseRequest + 'plugin/editPagePlugins')
         .then(this.handleErrors)
         .then(res => res.json().then(r=> {return r}));
  }

  getUser() {
    return fetch(
      this.baseRequest + 'sessions/username')
         .then(this.handleErrors)
         .then(res => res.json());
  }

  setPassword(username, password) {
    return fetch(
        this.baseRequest + 'users/setPassword',
        {method: 'post', body: JSON.stringify({userName: username, password:password}), credentials: 'include',
          headers: this.getPostHeaders() })
        .then(this.handleErrors)
        .then(res => res.json());
  }

  resetForgottenPassword(userName, email, password) {
    return fetch(
        this.baseRequest + "users/resetForgottenPassword",
        {method: 'post', body: JSON.stringify({userName, email, password}), credentials: 'include',
          headers: this.getPostHeaders()})
        .then(this.handleErrors);

  }

  saveEmail(username, email) {
    return fetch(
        this.baseRequest + 'users/saveEmail',
        {method: 'post', body: JSON.stringify({userName: username, email:email}), credentials: 'include',
          headers: this.getPostHeaders() })
        .then(this.handleErrors)
        .then(res => res.json());
  }

  verifyEmailToken(token) {
    return fetch(
        this.baseRequest + 'users/verifyEmailToken',
        {method: 'post', body: token, credentials: 'include',
          headers: this.getPostHeaders() })
        .then(this.handleErrors)
        .then(res => res.json());
  }

  verifyPasswordToken(token, username) {
    return fetch(
        this.baseRequest + 'users/verifyPasswordToken',
        {method: 'post', body: JSON.stringify({username, token}), credentials: 'include',
          headers: this.getPostHeaders() })
        .then(this.handleErrors)
        .then(res => res.json());
  }
  
  getUsers() {
    return fetch(
      this.baseRequest + 'admin/getUsers')
         .then(this.handleErrors)
         .then(res => res.json());
  }

  fetchLogin(username, password) {
    return fetch(
      this.baseRequest + 'sessions/login',
       {method: 'post', body: JSON.stringify({username: username, password:password}), credentials: 'include',
         headers: this.getPostHeaders() });
  }

  login(username, password)
  {
    return this.fetchLogin(username, password)
         .then(response => {
           if (!response.ok && response.status === 403) {
             return this.fetchLogin(username, password); }
           return response;})
         .then(this.handleErrors)
         .then(res => res.json());
  }

  logout()
  {
    return fetch(
      this.baseRequest + 'sessions/logout',
       {method: 'post',  credentials: 'include',
         headers: this.getPostHeaders() })
         .then(this.handleErrors)
         .then(response => response.text());
  }

  savePage(pageName, pageData)
  {
    return fetch(
      this.baseRequest + ('page/' + pageName + '/savePage').replace("//","/"),
       {method: 'post', body: JSON.stringify({pageName: pageName, text: pageData.text, tags:pageData.tags, revision:pageData.revision, force:pageData.force}), credentials: 'include',
         headers: this.getPostHeaders() })
         .then(this.handleErrors)
         .then(res => res.json());
  }
  
  previewPage(pageName, pageData)
  {
    return fetch(
      this.baseRequest + 'page/previewPage/' + pageName,
       {method: 'post', body: JSON.stringify({pageName: pageName, text: pageData.text, tags:pageData.tags}), credentials: 'include',
         headers: this.getPostHeaders() })
         .then(this.handleErrors)
         .then(res => res.json());
  }

  saveMedia(files, namespace)
  {
    let formData = new FormData();
    formData.append("file", files[0]);
    formData.append("namespace", namespace);
    return fetch(
      this.baseMediaRequest + 'upload',
       {method: 'post', body: formData, credentials: 'include',
         headers: {'x-xsrf-token': this.getTokenCookie() }})
         .then(this.handleErrors)
         .then(res => res.text());
  }

  deleteFile(fileName)
    {

      return fetch(
        this.baseMediaRequest + fileName,
         {method: 'delete', credentials: 'include',
           headers: {'x-xsrf-token': this.getTokenCookie() }})
           .then(this.handleErrors)
           .then(res => res.text());
  }

  deletePage(pageName)
    {

      return fetch(
        this.baseRequest + "page/" + pageName,
         {method: 'delete', credentials: 'include',
           headers: {'x-xsrf-token': this.getTokenCookie() }})
           .then(this.handleErrors)
           .then(res => res.text());
  }

  movePage(oldNS, oldPage, newNS, newPage) {
    return fetch(
        this.baseRequest + 'page/' + oldNS + ':' + oldPage + '/movePage',
        {method: 'post', credentials: 'include',
          body: JSON.stringify({oldNS, oldPage, newNS, newPage}),
          headers: this.getPostHeaders()})
        .then(this.handleErrors)
        .then(res => res.json());
  }

  deleteRole(userName, userRole) {
    return fetch(
      this.baseRequest + "admin/role/" + userName + "/" + userRole,
       {method: 'delete', credentials: 'include',
         headers: {'x-xsrf-token': this.getTokenCookie() }})
         .then(this.handleErrors)
         .then(res => res.json());

  }
  
  addRole(userName, userRole) {
    return fetch(
      this.baseRequest + "admin/role/" + userName + "/" + userRole,
       {method: 'put', credentials: 'include',
         headers: {'x-xsrf-token': this.getTokenCookie() }})
         .then(this.handleErrors)
         .then(res => res.json());

  }

  setRoles(userName, site, userRoles) {
    return fetch(
        this.baseRequest + "admin/roles/" + userName + "/site/" + site,
        {method: 'put', credentials: 'include',
          body: JSON.stringify(userRoles),
          headers: this.getPostHeaders() })
        .then(this.handleErrors)
        .then(res => res.json());

  }

  addUser(userName, password) {
    return fetch(
      this.baseRequest + "admin/user/" + userName,
       {method: 'put', body: JSON.stringify({userName, password}), credentials: 'include',
         headers: this.getPostHeaders()})
         .then(this.handleErrors)
         .then(res => res.json());

  }

  setUserPassword(userName, password) {
    return fetch(
      this.baseRequest + "admin/passwordReset/" + userName,
      {method: 'post', body: JSON.stringify({userName, password}), credentials: 'include',
       headers: this.getPostHeaders()})
         .then(this.handleErrors);

  }

  deleteUser(userName) {
    return fetch(
      this.baseRequest + "admin/user/" + userName,
       {method: 'delete', credentials: 'include',
         headers: {'x-xsrf-token': this.getTokenCookie() }})
         .then(this.handleErrors);

  }
  
  getSites(userName, password) {
    return fetch(
      this.baseRequest + 'admin/sites')
         .then(this.handleErrors)
         .then(res => res.json());
  }
  
  addSite(name, siteName, hostName) {
    return fetch(
      this.baseRequest + "admin/site/" + siteName,
       {method: 'put', credentials: 'include',
         body: JSON.stringify({name: name, siteName: siteName, hostName: hostName}),
         headers: this.getPostHeaders()})
         .then(this.handleErrors)
         .then(res => res.json());
  }

  deleteSite(siteName) {
    return fetch(
      this.baseRequest + "admin/site/" + siteName ,
       {method: 'delete', credentials: 'include',
         headers: {'x-xsrf-token': this.getTokenCookie() }})
         .then(this.handleErrors)
         .then(res => res.json());
  
  }

  saveSiteSettings(siteName, siteHostname, siteSettings) {
    return fetch(
        this.baseRequest + "admin/site/settings/" + siteName,
        {method: 'post', credentials: 'include',
          body: JSON.stringify({hostName: siteHostname, siteSettings}),
          headers: this.getPostHeaders()})
        .then(this.handleErrors)
        .then(res => res.json());
  }

  getGlobalSettings() {
    return fetch(
        this.baseRequest + 'admin/globalSettings')
        .then(this.handleErrors)
        .then(res => res.json());
  }

  setGlobalSettings(settings) {
    return fetch(
        this.baseRequest + 'admin/globalSettings',
        {method: 'post', credentials: 'include',
          body: JSON.stringify(settings),
          headers: this.getPostHeaders()})
        .then(this.handleErrors)
        .then(res => res.json());
  }

  setNamespaceRestriction(site, namespace, restrictionType) {
    return fetch(
        this.baseRequest + 'admin/namespace/restrictionType',
        {method: 'post', credentials: 'include',
          body: JSON.stringify({site, namespace, restrictionType}),
          headers: this.getPostHeaders()})
        .then(this.handleErrors)
        .then(res => res.json());
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
