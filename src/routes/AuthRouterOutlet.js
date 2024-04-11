import { Navigate, Outlet, useLocation } from "react-router-dom"
import { AuthContext } from "../ContextProvider/AuthContext"
import { useEffect, useState } from "react";
import { IsAuthenticated } from "../Helpers/AuthHelper";
import { GetCookie } from "../Helpers/Helper";

const AuthRouterOutlet = (props) => {
    const {layout:PageLayout = null,...otherProps} = props
    const location = useLocation();

    const [showLoader, setShowLoader] = useState(false)
    const [reloadHeader, setReloadHeader] = useState(false)
    const [reloadPage, setReloadPage] = useState(false)
    const [user, setUser] = useState(null);
    const [authRoles, setAuthRoles] = useState([]);
    const [projectId, setProjectId] = useState(null);
    let savedUserAccType = GetCookie("selectedAccType") ? JSON.parse(GetCookie("selectedAccType"))   : null
    const [userAccType, setUserAccType] = useState( savedUserAccType );
    const getAuthUser = IsAuthenticated(true)
    const isAuthenticated = getAuthUser && getAuthUser.isLoggedIn ? true : false
    // const isSuperAdmin = getAuthUser && getAuthUser?.user?.account_type == -97 ? true : false;
    // const isAuthorized = isAuthenticated && otherProps?.authorizeLevel && getAuthUser?.user?.account_type.some(item => otherProps?.authorizeLevel.includes(item)) ? true : false ;
    const isAuthorized = isAuthenticated && otherProps?.authorizeLevel && otherProps?.authorizeLevel.includes(getAuthUser?.user?.account_type) ? true : false ;
    useEffect(() => {
      if(user == null && isAuthenticated == true){
        updateData("user")
      }
    
    //   return () => {
    //     setUser(null)
    //     setAuthRoles([])
    //     setAuthRoles(null)
    //   }
    }, [user])
    


    const updateData = (type = '') => {
        if (type == null) {
            return false
        }
        switch (type) {
            case 'user':
                let userData = IsAuthenticated(true)
                if (userData) {
                    setUser(userData);
                    setAuthRoles(userData?.user.role)
                }
                break;
            case 'clear':
                setShowLoader(false)
                setProjectId(null)
                setUser(IsAuthenticated(true))
                break
        }
    }

    const authContextObj = {user, setUser, updateData, projectId, authRoles, setAuthRoles, setProjectId, showLoader, setShowLoader, reloadHeader, setReloadHeader, reloadPage, setReloadPage, userAccType, setUserAccType}


    if(!isAuthorized || !isAuthenticated){
        return <Navigate to={"/admin/login"} />
    }

    return (
        <AuthContext.Provider value={authContextObj}>
            {PageLayout ? <PageLayout><Outlet /></PageLayout> : <Outlet />}
        </AuthContext.Provider>
    )
}

export default AuthRouterOutlet
