import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Input , Label, Card, Container, Row, Col, Button} from '../../Helpers/UiHelper'

import AuthSlider from "../../Components/Elements/AuthSlider";
import AuthFooter from '../../Components/Partials/AuthFooter';
import { SetCookie, setDocumentTitle } from '../../Helpers/Helper';
import C_MSG from '../../Helpers/MsgsList';
import { useForm } from 'react-hook-form';
import { ApiService, setAuthorization } from '../../Services/ApiService';
import SweetAlert from 'react-bootstrap-sweetalert';
import { AuthContext } from '../../ContextProvider/AuthContext';

const Login = () => {
    const {updateData} = useContext(AuthContext)
    const navigate = useNavigate()

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [passwordShow, setPasswordShow] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [formSubmitted, setFormSbmt] = useState(false);

    useEffect(() => {
        setDocumentTitle(C_MSG.login_document_title)
    }, [])

    const toggleAlert = (val) => {
        setShowAlert(val)
    }

    const onSubmit = async (data = null) => {
        if(data == null){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = "auth/login"
        let method = "POST"
        let formData = data

        const res = await ApiService.fetchData(payloadUrl,method,formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let userData = res.results
            userData.isLockedScreen = false
            let authRoles = userData?.role
            SetCookie('auth_roles', JSON.stringify(authRoles))
            let setcookie = SetCookie('currentUser', JSON.stringify(userData))
            let setTimecookie = SetCookie('last_login_activity', JSON.stringify(new Date().getTime()))
            setAuthorization(userData.accessToken)
            let redirectUrl = "/dashboard"
            navigate(redirectUrl)
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
        setFormSbmt(false)
    }


    return (
        <React.Fragment>
            <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
                <div className="bg-overlay"></div>
                <div className="auth-page-content overflow-hidden pt-lg-5">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <Card className="overflow-hidden">
                                    <Row className="g-0">
                                        <AuthSlider />

                                        <Col lg={6}>
                                            <div className="p-lg-5 p-4">
                                                <div>
                                                    <h5 className="text-primary">Welcome Back !</h5>
                                                    <p className="text-muted">Sign in to continue.</p>
                                                </div>

                                                <div className="mt-4">
                                                    <form onSubmit={handleSubmit(onSubmit)}>

                                                        <div className="mb-3">
                                                            <Label htmlFor="username" className="form-label">Username</Label>
                                                            <Input type="text" className="form-control" id="username" placeholder="Enter username" {...register("email",{required:true})} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <div className="float-end">
                                                                <a onClick={() => navigate("/admin/forgotpassword")} className="text-muted link_url">Forgot password?</a>
                                                            </div>
                                                            <Label className="form-label" htmlFor="password-input">Password</Label>
                                                            <div className="position-relative auth-pass-inputgroup mb-3">
                                                                <Input type={passwordShow ? "text" : "password"} className="form-control pe-5 password-input" placeholder="Enter password" id="password-input" {...register("password",{required:true})} />
                                                                <Button variant="link" color="link" onClick={() => setPasswordShow(!passwordShow)} className="position-absolute end-0 top-0 text-decoration-none text-muted password-addon" type="button" id="password-addon"><i className="ri-eye-fill align-middle"></i></Button>
                                                            </div>
                                                        </div>

                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" value="" id="auth-remember-check" />
                                                            <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>
                                                        </div>

                                                        <div className="mt-4">
                                                            <button className="btn btn-success w-100" type="submit" disabled={formSubmitted}>Sign In</button>
                                                        </div>
                                                    </form>
                                                </div>

                                                <div className="mt-5 text-center">
                                                    <p className="mb-0">Don't have an account ? <a onClick={()=> navigate("/admin/signup")} className="fw-semibold text-primary text-decoration-underline link_url"> Signup</a> </p>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>

                <AuthFooter />

            </div>

            {(() => {
                if (showAlert && showAlert.show && showAlert.type == "danger") {
                    return (
                        <SweetAlert
                            danger
                            title={showAlert.message}
                            onConfirm={() => toggleAlert({ show: false, type: 'success', message: '' })}
                            confirmBtnCssClass={'btn_15'}
                            onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                            showConfirm={true}
                            focusCancelBtn={false}
                            customClass={'i_alert fs-10'}
                            timeout={3000}
                        />
                    )
                }
            })()}
        </React.Fragment>
    );
}

export default Login