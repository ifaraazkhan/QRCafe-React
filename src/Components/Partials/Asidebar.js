import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
//import logo
import logoDark from "../../assets/images/home/core-img/logo.png";
import logoLight from "../../assets/images/home/core-img/logo.png";
import logoSm from "../../assets/images/home/core-img/logo.png";

import { Container, Collapse, Dropdown } from "../../Helpers/UiHelper";
import { AuthContext } from "../../ContextProvider/AuthContext";
import { LayoutContext } from "../../ContextProvider/LayoutContext";
import { GetCookie } from "../../Helpers/Helper";

const Asidebar = ({ layoutType }) => {
  const {authRoles = []} = useContext(AuthContext);
  const {subViewType, setSubViewType} = useContext(LayoutContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentModule, setCurrentModule] = useState("");
  const [subHeaderView, setSubHeaderView] = useState("");
  const toggleRef = useRef([]);

  useEffect(() => {
      let savedView = GetCookie("subViewType") ? JSON.parse(GetCookie("subViewType")) : null
      let subview = subViewType || savedView  || 1;
      let isValidAccess = authRoles.includes(subview)
      if(!isValidAccess){
        subview = authRoles.includes(1) ? 1 : authRoles.includes(3) ? 3 : authRoles.includes(2) ? 2 : 4
      }
      if(subViewType == null){
        setSubViewType(subview);
        let url = subview == 1 ? `personal` : subview == 2 ? `approver` : subview == 3 ? `finance` : ``
        setSubHeaderView(url)
      }else{
        let url = subview == 1 ? `personal` : subview == 2 ? `approver` : subview == 3 ? `finance` : ``
        setSubHeaderView(url)
      }
  }, [subViewType])

  useEffect(() => {
    let urlPath = location.pathname
        let viewType = urlPath.split("/")
        viewType = viewType[1];
        setCurrentModule(viewType)
  }, [location])
  
  const addEventListenerOnSmHoverMenu = () => {
    // add listener Sidebar Hover icon on change layout from setting
    if (document.documentElement.getAttribute('data-sidebar-size') === 'sm-hover') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover-active');
    } else if (document.documentElement.getAttribute('data-sidebar-size') === 'sm-hover-active') {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    } else {
      document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    }
  };

  let menuItems = [
      {
        label: "Menu",
        isHeader: true,
      },
      {
        id: "dashboard",
        label: "Dashborad",
        link: `/dashboard`,
        parentId: "dashboard",
        icon: "mdi mdi-speedometer",
        roles:[1, -97]
      },
      {
        id: "userAccount",
        label: "User Accounts",
        link: "/user/accounts",
        parentId: "userAccount",
        icon:"mdi mdi-card-account-details-outline",
        roles:[1]
      },
      {
        id: "feedback",
        label: "Feedback",
        link: "/user/feedbacks",
        parentId: "userFeedbacks",
        icon:"mdi mdi-comment-check-outline",
        roles:[1, -97]
      },
      {
        id: "service",
        label: "Service Reuests",
        link: "/user/service-requests",
        parentId: "userFeedbacks",
        icon:"mdi mdi-face-agent",
        roles:[1, -97]
      },
      {
        id: "admin",
        label: "Admin",
        link: "/admin",
        parentId: "admin",
        icon:"mdi mdi-account-key",
        roles:[-97]
      },
      
  ];

  const SimpleBar = (props) => {
    const {id, className} = props
    return (
      <React.Fragment>
        <div id={id} className={className}>
          {props.children}
        </div>
      </React.Fragment>
    )
  }

  const toggleSubMenu = (key = null) => {
    if(key == null){
      return false
    }
    let subMenrArr = [...toggleRef.current] || []
    for (const iKey in subMenrArr) {
      if(iKey != key){
        toggleRef.current[iKey] = false
      }
    }
    toggleRef.current[key] = toggleRef.current[key] ? false : true
    navigate(`${location.pathname}`)
  };

  const getMenuList = (items = null, parentKey="") => {
    if(items == null){
      return false
    }
    if(!Array.isArray(items)){
      items = []
    }
    return (
      <React.Fragment>
          {React.Children.toArray(items.map((item, key) => {
            if(item.isHeader || (item.roles && authRoles.some(role => item.roles.includes(role)))){
              return (
                <React.Fragment>
                  {item["isHeader"] ? (
                    <li className="menu-title">
                      <span data-key="t-menu">{item.label}</span>
                    </li>
                  ) : item.subItems ? (
                    <li className="nav-item">
                      <a className={`nav-link menu-link px-2 text-center link_url ${toggleRef.current[`subitem_${parentKey}_${key}`] ? "" : "collapsed"}`} onClick={() => toggleSubMenu(`subitem_${parentKey}_${key}`)} data-bs-toggle="collapse" aria-expanded={toggleRef.current[`subitem_${parentKey}_${key}`]} aria-controls={`subitem_${parentKey}_${key}`} >
                        {item.icon && <i className={item.icon}></i>}
                        <span data-key="t-apps">{item.label}</span>
                      </a>
                      <Collapse className="menu-dropdown" ref={toggleRef[`subitem_${parentKey}_${key}`]} id={`subitem_${parentKey}_${key}`} in={toggleRef.current[`subitem_${parentKey}_${key}`]} >
                        <div className="">
                          <ul className="nav nav-sm flex-column test" >
                            {/* subItms  */}
                            {getMenuList(item.subItems, key)}
                          </ul>
                        </div>
                      </Collapse>
                    </li>
                  ) : (
                    <React.Fragment>
                          <li className="nav-item">
                            <a className={`nav-link menu-link px-2 text-center link_url ${currentModule.toLowerCase() == item.id.toLowerCase() ? "active" : ""}`} onClick={() => item.link ? navigate(item.link) : null} >
                              {item.icon && <i className={item.icon}></i>}
                              <span>{item.label}</span>
                            </a>
                          </li>
                    </React.Fragment>
                  )}
                </React.Fragment>
              )
            }
          }))}
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <div className="app-menu navbar-menu">
        <div className="navbar-brand-box">
          <Link to="/" className="logo logo-dark">
            <span className="logo-sm">
              <img src={logoSm} alt="" height="22" />
            </span>
            <span className="logo-lg">
              <img src={logoLight} alt="" height="40" />
            </span>
          </Link>

          <Link to="/" className="logo logo-light">
            <span className="logo-sm">
              <img src={logoSm} alt="" height="22" />
            </span>
            <span className="logo-lg">
              <img src={logoDark} alt="" height="40" />
            </span>
          </Link>
          <button
            onClick={addEventListenerOnSmHoverMenu}
            type="button"
            className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover"
          >
            <i className="ri-record-circle-line"></i>
          </button>
        </div>
        <div className="new_actn_sec px-3">
        </div>
        <React.Fragment>
          <SimpleBar id="scrollbar" className="h-100">
            <Container className="fluid">
            <ul className="navbar-nav" id="navbar-nav">
              {getMenuList(menuItems)}
            </ul>
            </Container>
          </SimpleBar>
          <div className="sidebar-background"></div>
        </React.Fragment>
      </div>
      <div className="vertical-overlay"></div>
    </React.Fragment>
  );
};

export default Asidebar;
