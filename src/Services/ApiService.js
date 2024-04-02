import axios, {isCancel, AxiosError} from "axios";
import { api } from '../config';
import { GetCookie } from "../Helpers/Helper";
import { RedirectToLogin } from "../Helpers/AuthHelper";

// default
axios.defaults.baseURL = api.API_URL;
// content type
// axios.defaults.headers.post["Content-Type"] = "application/json";

// content type
let user = GetCookie("currentUser") ? JSON.parse(GetCookie("currentUser")) : {}
const token = user ? `${user.tokenType} ${user.accessToken}` : null
if(token)
axios.defaults.headers.common["Authorization"] = token;

// intercepting to capture errors
axios.interceptors.response.use(
  function (response) {
    return response.data ? response.data : response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    let redirect = false;
    let status = error.status || error.response.status
    switch (status) {
      case 403:
        redirect = true
    }
    if(redirect){
      // return Promise.reject(error);
      // perform action to redirect
      RedirectToLogin(status)
    }else{
      return Promise.reject(error);
    }
    
  }
);
/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common["Authorization"] = "Bearer " + token;
};

class ApiService {
    static fetchData = async (url = null, method = null, data = {},options = {}) => {
        if(!url ||  !method){
            return false
        }
        // let axiosFetch = null
        // if(method.toLowerCase() == "get"){
        //     axiosFetch = axios.get
        // }else if(method.toLowerCase() == "post"){
        //     axiosFetch = axios.post
        // }else if(method.toLowerCase() == "delete"){
        //     axiosFetch = axios.delete
        // }
        // if(axiosFetch){}
        try {
            let formData = new FormData();
            if(options.formType && options.formType == 'form'){
              formData = data
            }else{
              formData = JSON.stringify(data)
            }
            
            let config = {
                method: method,
            }
            if(method == 'POST' || method == 'PATCH' || method == 'POST'){
              config.data = formData
            }
            if(options.isFileRequest){
                config.responseType = 'stream'
            }
            if(!options.fileUpload){
              // config.headers= {'Content-Type': 'multipart/form-data'}
              config.headers= {'Content-Type': 'application/json'}
            }
          const response = await axios(`${url}`,config);
          // const response = await axios(config);
          return response
        }
        catch (AxiosError) {
          console.log(AxiosError.message);
          let {response} = AxiosError
          return response.data
          // console.log(err);
        }
    }
}

export { ApiService, setAuthorization}