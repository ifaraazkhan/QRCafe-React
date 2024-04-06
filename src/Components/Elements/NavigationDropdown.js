import React, { useState, useEffect, useContext } from 'react';
import {Input , Label, Card, Container, Row, Col, Nav, NavDropdown, Tab, Dropdown} from '../../Helpers/UiHelper'
//import images
import avatar1 from "../../assets/images/users/user-dummy-img.jpg";
import { AuthContext } from '../../ContextProvider/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IsAuthenticated } from '../../Helpers/AuthHelper';
import { DelCookie, GetCookie } from '../../Helpers/Helper';
import { LayoutContext } from '../../ContextProvider/LayoutContext';

const NavigationDropdown = () => {
    const {user:AuthUser, updateData} = useContext(AuthContext)
    const {reloadHeader = false,setReloadHeader} = useContext(LayoutContext)
    const user = AuthUser?.user || {}
    const navigate = useNavigate()

    //Dropdown Toggle
    const [isProfileDropdown, setIsProfileDropdown] = useState(false);
    
    const toggleProfileDropdown = () => {
        setIsProfileDropdown(!isProfileDropdown);
    };

    let logOut = () => {
        let loggedInUser = IsAuthenticated(true);
        if (loggedInUser.isLoggedIn) {
          let del = DelCookie("currentUser");
          let delProject = DelCookie("selectedProject");
          let delRedirectUrl = DelCookie("redirect_url");
          let auth_roles = DelCookie("auth_roles");
          updateData("clear");
          if (del) {
            navigate("/admin/login");
          }
        }
    };

    return (
        <React.Fragment>
            <Dropdown className="ms-sm-3 header-item topbar-user">
                <Dropdown.Toggle tag="button" type="button" variant="none" className="btn shadow-none">
                    <span className="d-flex align-items-center">
                        <img className="rounded-circle header-profile-user" src={user?.avatar_url || avatar1}
                            alt="Header Avatar" />
                        <span className="text-start ms-xl-2">
                            <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{!user?.first_name ?  user?.username : (`${user?.first_name} ${user?.last_name}`)}</span>
                            {/* <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">Founder</span> */}
                        </span>
                    </span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-end">
                    <h6 className="dropdown-header">Welcome {!user?.first_name ?  user?.username : (`${user?.first_name} ${user?.last_name}`)}!</h6>
                    <Dropdown.Item onClick={() => navigate("/user/profile")}>
                        <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                        <span className="align-middle">Profile</span>
                    </Dropdown.Item>
                    <div className="dropdown-divider"></div>
                    <Dropdown.Item className='link_url'>
                        <span className="badge bg-success-subtle text-success mt-1 float-end">New</span>
                        <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i> 
                        <span className="align-middle">Settings</span>
                    </Dropdown.Item>
                    <Dropdown.Item >
                        <span onClick={() => logOut()} >
                            <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i> 
                            <span className="align-middle" data-key="t-logout">Logout</span>
                        </span>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </React.Fragment>
    );
};

export default NavigationDropdown;