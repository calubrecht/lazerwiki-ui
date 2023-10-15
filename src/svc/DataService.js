export default class DataService
{
  constructor()
  {
    this.handleErrors = this.handleErrors.bind(this);
    this.apiServer = process.env.REACT_APP_API_SERVER;
    this.baseRequest = this.apiServer + '/api/';
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
}
