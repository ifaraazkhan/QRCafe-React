import React, { lazy, useContext, useEffect, useState } from "react";
import {Input , Label, Card, Container, Row, Col, Nav, NavDropdown, Tab} from '../../Helpers/UiHelper'

import { AuthContext } from "../../ContextProvider/AuthContext";
import C_MSG from "../../Helpers/MsgsList";
import { setDocumentTitle } from "../../Helpers/Helper";
import { useLocation, useNavigate } from "react-router-dom";

const AdminUsers = lazy(() => import("./Users"))
const Categories = lazy(() => import("./Categories"))
const Roles = lazy(() => import("./Roles"))
const Accounts = lazy(() => import("./Accounts"))
// const UserAccounts = lazy(() => import("./UserAccounts"))

const AdminSetttings = () => {
    const {user:authUser = null, authRoles = [], isSuperAdmin} = useContext(AuthContext)
    const user = authUser?.user || {}
    const userId = user.user_id || null
    const navigate = useNavigate()
    const location = useLocation()
    const [view, setView] = useState(0)

    useEffect(() => {
        getCurrentView()
    }, [location])
    
    useEffect(() => {
        setDocumentTitle(C_MSG.admin_settings_document_title)
    }, [])

    useEffect(() => {
        // getCurrentView()
    }, [])

    const getCurrentView = (url = null, retRes = false) => {
        
        let view  = 1
        let urlPath = url || location.pathname
        let viewType = urlPath.split("/")
        viewType = viewType.pop();
        const adminViews = [1, 2, 3, 4]
        // if(!adminViews.includes(viewType) && isSuperAdmin){
        //     navigate("/admin/users")
        // }else if(!isSuperAdmin && adminViews.includes(viewType)){
        //     navigate("/admin/account")
        // }
        switch(viewType){
            case 'users':
                view = 1
            break;
            case 'categories':
                view = 2
            break;
            case 'roles':
                view = 3
            break;
            case 'accounts':
                view = 4
            break;
            case 'account-info':
                view = 5
            break;
        }
        setView(view)
        return view
    }

    const goToUrl = (url = "") => {
        if(url == ""){
            return false
        }
        getCurrentView(url)
        navigate(url)
    }

    return (
        <React.Fragment>
            <div className="page-content px-0 mt-4 pt-5">
                <div className="container-fluid p-0 m-0">
                    <div className="row m-0">
                        <div className="col-sm-2 p-0">
                            <div className="list-group list-group-fill-success">
                                <a onClick={null} className="list-group-item list-group-item-action pl-4 fw-700 disabled">Management</a>
                                {isSuperAdmin && 
                                    <React.Fragment>
                                        <a onClick={() => goToUrl("/admin/users")} className={`list-group-item list-group-item-action pl-5 ${view == 1 ? "active" : "link_url"}`}>Users</a>
                                        <a onClick={() => goToUrl("/admin/accounts")} className={`list-group-item list-group-item-action pl-5 ${view == 4 ? "active" : "link_url"}`}>Accounts</a>
                                        <a  onClick={() => goToUrl("/admin/categories")}  className={`list-group-item list-group-item-action pl-5 ${view == 2 ? "active" : "link_url"}`}>Categories</a>
                                    </React.Fragment>
                                }
                                {/* {isSuperAdmin && 
                                    <React.Fragment>
                                        <a onClick={() => goToUrl("/admin/account-info")} className={`list-group-item list-group-item-action pl-5 ${view == 5 ? "active" : "link_url"}`}>Account</a>
                                    </React.Fragment>
                                } */}
                            </div>
                        </div>
                        <div className="col-sm-10">
                            {view == 1 && <AdminUsers />}
                            {view == 2 && <Categories />}
                            {view == 3 && <Roles />}
                            {view == 4 && <Accounts />}
                            {/* {view == 5 && <UserAccounts />} */}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default AdminSetttings