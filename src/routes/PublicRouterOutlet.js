import { Navigate, Outlet } from "react-router-dom"
import { IsAuthenticated } from "../Helpers/AuthHelper"


const PublicRouterOutlet = (props) => {
    const {layout:PageLayout,...otherProps} = props
    // check if user us loggedin or not
    const getAuthUser = IsAuthenticated(true)
    const isAuthenticated = getAuthUser && getAuthUser.isLoggedIn ? true : false

    if(isAuthenticated){
        return <Navigate to={"/admin/dashboard"} />
    }

    return PageLayout ? <PageLayout><Outlet /></PageLayout> : <Outlet />
}

export default PublicRouterOutlet