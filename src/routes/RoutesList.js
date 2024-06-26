import React, { Suspense, lazy } from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import PublicRouterOutlet from "./PublicRouterOutlet"
import { adminRoutes, adminAuthRoutes, dashboardRoutes, publicRoutes, userRoutes} from "./allRoutes"
import AuthRouterOutlet from "./AuthRouterOutlet"
import Loader from "../Components/Partials/Loader"


const MainLayout = lazy(() => import("../Components/Layouts/MainLayout"))
const PublicLayout = lazy(() => import("../Components/Layouts/PublicLayout"))
const Page404 = lazy(() => import("../pages/Error/Page404"))
const Home = lazy(() => import("../pages/Home"))
const Service = lazy(() => import("../pages/Service"))
// const ServiceRequestStatus = lazy(() => import("../pages/ServiceRequestStatus"))

const RoutesList = () => {
    return (
        <React.Fragment>
            <Router>
                <Suspense fallback={<Loader showLoader={true} pos={'fixed'} />}>
                    <Routes>
                        <Route path="/dashboard" element={<AuthRouterOutlet layout={MainLayout} authorizeLevel={[1, -97]} />}>
                            {dashboardRoutes && React.Children.toArray(dashboardRoutes.map((item) => {
                                return <Route path={item.path} element={item.component} />
                            }))}
                        </Route>
                        <Route path="/user" element={<AuthRouterOutlet layout={MainLayout} authorizeLevel={[1, -97]} />}>
                            {userRoutes && React.Children.toArray(userRoutes.map((item) => {
                                return <Route path={item.path} element={item.component} />
                            }))}
                        </Route>
                        <Route path="/admin" element={<PublicRouterOutlet layout={PublicLayout} />}>
                            {adminAuthRoutes && React.Children.toArray(adminAuthRoutes.map((item) => {
                                return <Route path={item.path} element={item.component} />
                            }))}
                        </Route>

                        <Route path="/admin" element={<AuthRouterOutlet layout={MainLayout} authorizeLevel={[1, -97]} />}>
                            {adminRoutes && React.Children.toArray(adminRoutes.map((item) => {
                                return <Route path={item.path} element={item.component} />
                            }))}
                        </Route>

                        <Route path="/" element={<PublicRouterOutlet layout={PublicLayout} />}>
                            {publicRoutes && React.Children.toArray(publicRoutes.map((item) => {
                                return <Route path={item.path} element={item.component} />
                            }))}
                        </Route>

                        <Route path="/home" element={<PublicLayout><Home /></PublicLayout>}></Route>
                        <Route path="/service" element={<PublicLayout><Service /></PublicLayout>}></Route>
                        {/* <Route path="/service-status/:token" element={<PublicLayout><ServiceRequestStatus /></PublicLayout>}></Route> */}
                        <Route path="/page404" element={<PublicLayout><Page404 /></PublicLayout>}></Route>
                        <Route path="*" element={<PublicLayout><Page404 /></PublicLayout>}></Route>
                        
                        
                    </Routes>
                </Suspense>
            </Router>
        </React.Fragment>
    )
    
}

export default RoutesList
