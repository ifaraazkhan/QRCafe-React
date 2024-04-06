import { useNavigate } from "react-router-dom";
import {DelCookie, GetCookie} from "./Helper"
import { useContext } from "react";
import { AuthContext } from "../ContextProvider/AuthContext";

export const IsAuthenticated = (fetchUser = false) => {
    let userData = GetCookie('currentUser')
    userData  = userData ? JSON.parse(userData) : false;
    let result = {isLoggedIn : false,user: null,token: ''}
    if(userData){
        let otpVerified = userData.otpVerified  ? userData.otpVerified : true
        result.isLoggedIn = true;
        result.user = fetchUser ? userData : null;
        result.token = fetchUser ? userData.accessToken : '';
        result.otpVerified = otpVerified;
    }
    return result
}

export const RedirectToLogin = (errCode = 200) =>{
    // const navigate = useNavigate()
    const loggedInUser = IsAuthenticated(true);
    // const {updateData} = useContext(AuthContext)
    if (loggedInUser.isLoggedIn) {
        let del = DelCookie("currentUser");
        let delProject = DelCookie("selectedProject");
        let delRedirectUrl = DelCookie("redirect_url");
        let auth_roles = DelCookie("auth_roles");
        // updateData("clear");
        if (del) {
            let url = `/admin/login`
            if(errCode == 403){
                url += `?error=sess_exp`
            }
            // navigate(url)
            document.location.href=url
        }
    }
}
