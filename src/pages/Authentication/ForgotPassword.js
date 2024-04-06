import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {Input , Label, Card, Button, Container, Row, Col} from '../../Helpers/UiHelper'
import { useForm } from "react-hook-form";

import AuthSlider from "../../Components/Elements/AuthSlider";
import AuthFooter from '../../Components/Partials/AuthFooter';
import { setDocumentTitle } from '../../Helpers/Helper';
import C_MSG from '../../Helpers/MsgsList';
import { ApiService } from '../../Services/ApiService';
import SweetAlert from 'react-bootstrap-sweetalert';

const ForgotPassword = () => {
    const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm();
    const navigate = useNavigate()
    const [showAlert, setShowAlert] = useState(false);
    const [formSubmitted, setFormSbmt] = useState(false);

    useEffect(() => {
        setDocumentTitle(C_MSG.forgot_pwd_document_title)
    }, [])

    const toggleAlert = (val) => {
        setShowAlert(val)
    }

    const onSubmit = async (data = null) => {
        if(data == null){
            return false;
        }
        if(data.email == ""){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = "auth/forgot-password"
        let method = "POST"
        let formData = data

        const res = await ApiService.fetchData(payloadUrl,method,formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            
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
                                                <h5 className="text-primary">Forgot Password?</h5>
                                                <p className="text-muted">Reset password with {process.env.REACT_APP_SITE_NAME}</p>

                                                <div className="mt-2 text-center text-success">
                                                <span className="fs-30"><i className='fal fa-spin fa-envelope'></i> </span>
                                                </div>

                                                <div className="alert border-0 alert-warning text-center mb-2 mx-2" role="alert">
                                                    Enter your email and instructions will be sent to you!
                                                </div>
                                                <div className="p-2">
                                                    <form onSubmit={handleSubmit(onSubmit)}>
                                                        <div className="mb-4">
                                                            <Label className="form-label">Email</Label>
                                                            <Input type="email" className="form-control" id="email" placeholder="Enter email address" {...register("email", {required: true})} />
                                                            {errors.email?.type === 'required' && <div className="field_err text-danger">{C_MSG.email_required}</div>} 
                                                        </div>

                                                        <div className="text-center mt-4">
                                                            <button className="btn btn-success w-100" type="submit" disabled={formSubmitted}>Send Reset Link</button>
                                                        </div>
                                                    </form>
                                                </div>

                                                <div className="mt-5 text-center">
                                                    <p className="mb-0">Wait, I remember my password... <a onClick={() => navigate("/admin/login")} className="fw-bold text-primary text-decoration-underline link_url"> Click here </a> </p>
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
                if (showAlert && showAlert.show && showAlert.type == "success") {
                    return (
                        <SweetAlert
                            success
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
                }else if (showAlert && showAlert.show && showAlert.type == "danger") {
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

export default ForgotPassword