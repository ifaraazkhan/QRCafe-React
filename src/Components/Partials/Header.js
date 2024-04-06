import logoSm from "../../assets/images/logo-sm.png";
import logoDark from "../../assets/images/logo-dark.png";
import logoLight from "../../assets/images/logo-light.png";

import React, { Fragment, useContext, useEffect } from "react"
import { Navigate } from "react-router-dom";
import { LayoutContext } from "../../ContextProvider/LayoutContext";
import NotificationDropdown from "../Elements/NotificationDropdown";
import NavigationDropdown from "../Elements/NavigationDropdown";
import ProjectDropDown from "../Elements/ProjectDropDown";
import { SetCookie } from "../../Helpers/Helper";
import { AuthContext } from "../../ContextProvider/AuthContext";

const Header = (props) => {
    const { headerClass = "" } = props
    const {userAccType = null, setUserAccType} = useContext(AuthContext)
    const {layoutModeType = "", onChangeLayoutMode, sidebarVisibilitytype,  sidebartype, setSidebartype, setShowMobileSideBar, reloadPage = false, setReloadPage} = useContext(LayoutContext)
    
    useEffect(() => {
      
        if(userAccType == null){
            changeUserAccType(1)
        }

    }, [userAccType])
    
    
    const toogleMenuBtn = () => {
        var windowSize = document.documentElement.clientWidth;
        
        if (windowSize > 767)
            document.querySelector(".hamburger-icon").classList.toggle('open');
        //For collapse vertical and semibox menu
        if (sidebarVisibilitytype === "show") {
            if (windowSize < 1025 && windowSize > 767) {
                sidebartype == "sm" ? setSidebartype("") : setSidebartype("sm");
            } else if (windowSize > 1025) {
                sidebartype == "lg" ? setSidebartype("sm") : setSidebartype("lg");
            } else if (windowSize <= 767) {
                setSidebartype("lg");
                setShowMobileSideBar(true)
            }
        }
        
    };

    const changeUserAccType = (type = null) => {
        if(!type){
            return false
        }
        SetCookie("selectedAccType",JSON.stringify(type))
        setUserAccType(type)
        setReloadPage(true)
    }

    return (
        <React.Fragment>
            <header id="page-topbar" className={headerClass}>
                <div className="layout-width">
                    <div className="navbar-header">
                        <div className="d-flex">
                            {/* <div className="navbar-brand-box horizontal-logo">
                                <a onClick={null} className="logo logo-dark link_url">
                                    <span className="logo-sm"> <img src={logoSm} alt="" height="22" /> </span>
                                    <span className="logo-lg"> <img src={logoDark} alt="" height="17" /></span>
                                </a>

                                <a onClick={null}  className="logo logo-light link_url">
                                    <span className="logo-sm"> <img src={logoSm} alt="" height="22" /> </span>
                                    <span className="logo-lg"> <img src={logoLight} alt="" height="17" /> </span>
                                </a>
                            </div> */}

                            <button onClick={toogleMenuBtn} type="button" className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger shadow-none" id="topnav-hamburger-icon">
                                <span className="hamburger-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
                        </div>

                        {/* <div className="flex-shrink-0 ml-auto">
                            <ul className="card-header-pills nav nav-pills">
                                <li className="nav-item link_url"><a className={`nav-link ${userAccType == 1 ? "active" : ""}`} onClick={() => changeUserAccType(1)}>Personal</a></li>
                                <li className="nav-item link_url"><a className={`nav-link ${userAccType == 2 ? "active" : ""}`} onClick={() => changeUserAccType(2)}>Approver</a></li>
                                <li className="nav-item link_url"><a className={`nav-link ${userAccType == 3 ? "active" : ""}`} onClick={() => changeUserAccType(3)}>Finance</a></li>
                            </ul>
                        </div> */}

                        <div className="d-flex align-items-center ml-auto">
                            {/* <ProjectDropDown /> */}
                        </div>

                        <div className="d-flex align-items-center">
                            
                            <div className="ms-1 header-item d-none d-sm-flex">
                                <button
                                    onClick={() => onChangeLayoutMode(layoutModeType == "dark" ? "light" : "dark")}
                                    type="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode shadow-none">
                                    <i className='bx bx-moon fs-22'></i>
                                </button>
                            </div>
                            {/* <NotificationDropdown /> */}

                            <NavigationDropdown />
                        </div>
                    </div>
                </div>
            </header>
        </React.Fragment>
    )
}

export default Header