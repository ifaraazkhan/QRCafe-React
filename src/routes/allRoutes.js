import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Page400 from "../pages/Error/Page400";


const Login = lazy(() => import("../pages/Authentication/Login"))
const LoginOTP = lazy(() => import("../pages/Authentication/LoginOTP"))
const Register = lazy(() => import("../pages/Authentication/Register"))
const ForgotPassword = lazy(() => import("../pages/Authentication/ForgotPassword"))
const ResetPassword = lazy(() => import("../pages/Authentication/ResetPassword"))
const LockScreen = lazy(() => import("../pages/Authentication/LockScreen"))
const Home = lazy(() => import("../pages/Home"))

const Dashboard = lazy(() => import("../pages/admin/Dashboard"))
const UserAccounts = lazy(() => import("../pages/user/UserAccounts"))
const AdminSetttings = lazy(() => import("../pages/admin/Settings"))


const adminAuthRoutes = [
    // {path:"/auth/login", component: <Login />},
    // {path:"/auth/otp", component: <LoginOTP />},
    // {path:"/auth/signup", component: <Register />},
    // {path:"/auth/forgotpassword", component: <ForgotPassword />},
    // {path:"/auth/resetpassword/:token", component: <ResetPassword />},
    // {path:"/auth/lockscreen", component: <LockScreen />},
    {path:"/admin/login", component: <Login />},
    {path:"/admin/signup", component: <Register />},
    {path:"/admin/forgotpassword", component: <ForgotPassword />},
    {path:"/admin/resetpassword/:token", component: <ResetPassword />},
    {path:"/admin/lockscreen", component: <LockScreen />},
    {path:"*", component: <Navigate to={"/dashboard"} />}
]
const adminRoutes = [
    {path:"/admin/users", component: <AdminSetttings />},
    {path:"/admin/categories", component: <AdminSetttings />},
    {path:"/admin/roles", component: <AdminSetttings />},
    {path:"/admin/accounts", component: <AdminSetttings />},
    // {path:"/admin/account-info", component: <AdminSetttings />},
    {path:"/admin", component: <Navigate to={"/admin/users"} />},
    {path:"*", component: <Navigate to={"/dashboard"} />}
]

const dashboardRoutes = [
    // {path:"/dashboard/personal", component: <Dashboard />},
    // {path:"/dashboard/approver", component: <Dashboard />},
    {path:"/dashboard", component: <Dashboard />},
    // {path:"/dashboard", component: <Navigate to={"/dashboard/personal"} />},
]

const userRoutes = [
    {path:"/user/accounts", component: <UserAccounts />},
    {path:"/user", component: <Navigate to={"/user/accounts"} />},
    {path:"*", component: <Navigate to={"/user/accounts"} />}
]


// Authenticated routes

const publicRoutes = [
    {path:"/faq", component: <Navigate to={"/dashboard"} />},
    {path:"/termscondition", component: <Navigate to={"/dashboard"} />},
    {path:"/privacypolicy", component: <Navigate to={"/dashboard"} />},
    // {path:"/home", component: <Home />},
    {path:"/", component: <Navigate to={"/home"} />},
]

export { adminAuthRoutes, publicRoutes, adminRoutes, dashboardRoutes, userRoutes }