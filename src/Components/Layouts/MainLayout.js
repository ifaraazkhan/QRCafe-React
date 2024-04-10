import React, { useEffect, useState } from "react"
import MyErrorBoundary from "../../ErrorHandler/ErrorBoundary"
import { LayoutContext } from "../../ContextProvider/LayoutContext"
import Header from "../Partials/Header"
import Footer from "../Partials/Footer"
import Asidebar from "../Partials/Asidebar"
import Loader from "../Partials/Loader"

const MainLayout = (props) => {

    const [headerClass, setHeaderClass] = useState("")
    const [layoutModeType, setLayoutModeType] = useState("light")
    const [sidebarVisibilitytype, SetSidebarVisibilitytype] = useState("show")
    const [sidebartype, setSidebartype] = useState("lg")
    const [layoutType, setLayoutType] = useState("vertical")
    const [reloadPage, setReloadPage] = useState(false)
    const [reloadHeader, setReloadHeader] = useState(false)
    const [PageId, setPageId] = useState(null)
    const [showLoader, setShowLoader] = useState(false)
    const [showMobileSideBar, setShowMobileSideBar] = useState(false)
    const [subViewType, setSubViewType] = useState(null)
    // let mlContextObj = {}

    useEffect(() => {
      document.addEventListener("click", toggleMobileMenu);
      return () => {
        document.removeEventListener("click", toggleMobileMenu);
      };
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", scrollNavigation, true);
        return () => {
            window.removeEventListener("scroll", toggleMobileMenu,true);
        };
    }, []);

    useEffect(() => {
        if(reloadPage || PageId == null){
          let pageId = "id" + Math.random().toString(16).slice(2);
          setPageId(pageId)
          setReloadPage(false)
        }
      }, [reloadPage,PageId])

    const scrollNavigation = () => {
        var scrollup = document.documentElement.scrollTop;
        if (scrollup > 50) {
            setHeaderClass("topbar-shadow");
        } else {
            setHeaderClass("");
        }
    }

    const toggleMobileMenu = (e) => {
        const element = e.target;
        const toggleEle = element.closest("button#topnav-hamburger-icon")
        const parent = element.closest("ul#navbar-nav")
        if ((!parent && !toggleEle)) {
            setShowMobileSideBar(false)
        }
    }

    /*
    call dark/light mode
    */
    const onChangeLayoutMode = (mode = null) => {
        if(mode == null){
            return false
        }
        setLayoutModeType(mode)
    };
    let mlContextObj = {layoutModeType, onChangeLayoutMode, sidebarVisibilitytype, SetSidebarVisibilitytype, sidebartype, setSidebartype, layoutType, setLayoutType, reloadPage, setReloadPage, setShowLoader, reloadHeader, setReloadHeader,subViewType, setSubViewType, setShowMobileSideBar}

    return (
        <React.Fragment>
            
                <MyErrorBoundary>
                    <LayoutContext.Provider value={mlContextObj}>
                    {/* <Loader showLoader={true} pos={'fixed'} /> */}
                    {showLoader && <Loader showLoader={showLoader} pos={'fixed'} />}
                    {PageId &&
                        <div key={PageId} id="layout-wrapper" data-bs-theme={layoutModeType == "dark" ? "dark" : "light"} data-sidebar-size={sidebartype} data-layout={layoutType} data-layout-style="default" data-sidebar={layoutModeType == "dark" ? "dark" : "light"} data-layout-width="fluid" data-layout-position="fixed" data-topbar={layoutModeType == "dark" ? "dark" : "light"} data-sidebar-image="none" data-sidebar-visibility={sidebarVisibilitytype} className={showMobileSideBar ? "twocolumn-panel vertical-sidebar-enable" : ""} >
                            <Header headerClass={headerClass} layoutModeType={layoutModeType} onChangeLayoutMode={onChangeLayoutMode} pageId={PageId}/>
                            <Asidebar layoutType={layoutType} pageId={PageId} />
                            <div className="main-content">
                                {props.children}
                                {/* <Footer /> */}
                            </div>
                        </div>
                    }
                    
                    {/* <RightSidebar /> */}
                    {/* <div className="main_layout">{props.children}</div> */}
                    </LayoutContext.Provider>
                </MyErrorBoundary>
            
            
        </React.Fragment>
    )
}

export default MainLayout