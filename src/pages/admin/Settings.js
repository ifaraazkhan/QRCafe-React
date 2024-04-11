import React, { lazy, useContext, useEffect, useState } from "react";
import {Input , Label, Card, Container, Row, Col, Nav, NavDropdown, Tab} from '../../Helpers/UiHelper'

import { AuthContext } from "../../ContextProvider/AuthContext";
import C_MSG from "../../Helpers/MsgsList";
import { setDocumentTitle } from "../../Helpers/Helper";
import { useLocation, useNavigate } from "react-router-dom";

const AdminUsers = lazy(() => import("./Users"))
const Categories = lazy(() => import("./Categories"))
const Roles = lazy(() => import("./Roles"))

const AdminSetttings = () => {
    const {user:authUser = null} = useContext(AuthContext)
    const user = authUser?.user || {}
    const userId = user.user_id || null
    const navigate = useNavigate()
    const location = useLocation()
    const [view, setView] = useState(0)
    
    useEffect(() => {
        setDocumentTitle(C_MSG.admin_users_settings_document_title)
    }, [])

    useEffect(() => {
        getCurrentView()
    }, [])

    const getCurrentView = (url = null, retRes = false) => {
        
        let view  = 1
        let urlPath = url || location.pathname
        let viewType = urlPath.split("/")
        viewType = viewType.pop()
        switch(viewType){
            case 'users':
                view = 1
            break;
            case 'categories':
                view = 2
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
                                <a onClick={null} className="list-group-item list-group-item-action pl-4 fw-700 disabled">User Management</a>
                                <a onClick={() => goToUrl("/admin/users")} className={`list-group-item list-group-item-action pl-5 ${view == 1 ? "active" : "link_url"}`}>Users</a>
                            </div>
                            <div className="list-group list-group-fill-success">
                                <a onClick={null} className="list-group-item list-group-item-action pl-4 fw-700 disabled">Fields</a>
                                <a  onClick={() => goToUrl("/admin/categories")}  className={`list-group-item list-group-item-action pl-5 ${view == 5 ? "active" : "link_url"}`}>Categories</a>
                            </div>
                        </div>
                        <div className="col-sm-10">
                            {view == 1 && <AdminUsers />}
                            {view == 2 && <Categories />}
                            {view == 3 && <Roles />}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default AdminSetttings