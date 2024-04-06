import React, { useContext, useEffect } from "react"
import { AuthContext } from "../../ContextProvider/AuthContext"
import { LayoutContext } from "../../ContextProvider/LayoutContext";
import { useLocation, useNavigate } from "react-router-dom";
import { SetCookie } from "../../Helpers/Helper";


const SubHeader = (props) => {
    const {authRoles = []} = useContext(AuthContext);
    const { setReloadPage,setSubViewType } = useContext(LayoutContext)
    const {primaryUrlPath = "", expenseType = 0,txnType = 0,dashboardType=0} = props;
    const navigate = useNavigate();

    const location = useLocation()

    useEffect(() => {
        let urlPath = location.pathname
        let viewType = urlPath.split("/")
        viewType = viewType.pop()
        let view = viewType == "personal" ? 1 : (viewType == "approver" ? 2 : (viewType == "finance" ? 3 : 0))
        if(view){
            if(view == 2 && primaryUrlPath == "transactions"){
                view = 1
            }
            let isValidAccess = authRoles.includes(view)
            if(!isValidAccess){
                view = authRoles.includes(1) ? 1 : authRoles.includes(3) ? 3 : authRoles.includes(2) ? 2 : 4
            }
            setSubViewType(view)
            SetCookie("subViewType",view)
        }
        
    }, [location])

    const changeUserAccType = (type = null) => {
        if(!type){
            return false
        }
        setReloadPage(true)
        let url = type == 1 ? `/${primaryUrlPath}/personal` : type == 2 ? `/${primaryUrlPath}/approver` : `/${primaryUrlPath}/finance`
        setSubViewType(type)
        SetCookie("subViewType",type)
        navigate(url)
        
    }

    return (
        <React.Fragment>
            <ul className="card-header-pills nav nav-pills py-2 bg-white justify-content-center">
                {primaryUrlPath == "expenses" && (authRoles.length > 1 || (authRoles.length == 1 && !authRoles.includes(1))) && 
                    <React.Fragment>
                        {authRoles.some(item => [1,4].includes(item)) && <li className="nav-item link_url"><a className={`nav-link ${expenseType == 1 ? "active" : ""}`} onClick={() => changeUserAccType(1)}>Personal</a></li>}
                        {authRoles.some(item => [2,4].includes(item)) && <li className="nav-item link_url"><a className={`nav-link ${expenseType == 2 ? "active" : ""}`} onClick={() => changeUserAccType(2)}>Approver</a></li>}
                        {authRoles.some(item => [3,4].includes(item)) && <li className="nav-item link_url"><a className={`nav-link ${expenseType == 3 ? "active" : ""}`} onClick={() => changeUserAccType(3)}>Finance</a></li>}
                    </React.Fragment>
                }
                {primaryUrlPath == "dashboard" && (authRoles.length > 1 || (authRoles.length == 1 && !authRoles.includes(1))) && 
                    <React.Fragment>
                        {authRoles.some(item => [1,4].includes(item)) && <li className="nav-item link_url"><a className={`nav-link ${dashboardType == 1 ? "active" : ""}`} onClick={() => changeUserAccType(1)}>Personal</a></li>}
                        {authRoles.some(item => [2,4].includes(item)) && <li className="nav-item link_url"><a className={`nav-link ${dashboardType == 2 ? "active" : ""}`} onClick={() => changeUserAccType(2)}>Approver</a></li>}
                        {authRoles.some(item => [3,4].includes(item)) && <li className="nav-item link_url"><a className={`nav-link ${dashboardType == 3 ? "active" : ""}`} onClick={() => changeUserAccType(3)}>Finance</a></li>}
                    </React.Fragment>
                }
                {primaryUrlPath == "transactions" && (authRoles.length > 1 || (authRoles.length == 1 && !authRoles.includes(1))) && 
                    <React.Fragment>
                        {authRoles.some(item => [1,4].includes(item)) && <li className="nav-item link_url"><a className={`nav-link ${txnType == 1 ? "active" : ""}`} onClick={() => changeUserAccType(1)}>Personal</a></li>}
                        {authRoles.some(item => [3,4].includes(item)) && <li className="nav-item link_url"><a className={`nav-link ${txnType == 3 ? "active" : ""}`} onClick={() => changeUserAccType(3)}>Finance</a></li>}
                    </React.Fragment>
                }
                
            </ul>
        </React.Fragment>
    )
}

export default SubHeader