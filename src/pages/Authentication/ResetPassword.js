import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Label, Card, Button, Container, Row, Col, Checkbox } from '../../Helpers/UiHelper'

import AuthSlider from "../../Components/Elements/AuthSlider";
import AuthFooter from '../../Components/Partials/AuthFooter';
import { setDocumentTitle } from '../../Helpers/Helper';
import C_MSG from '../../Helpers/MsgsList';
import { useForm } from 'react-hook-form';
import Style from "../../Styles/auth.module.css"
import { ApiService } from '../../Services/ApiService';
import SweetAlert from 'react-bootstrap-sweetalert';

const ResetPassword = () => {
    const navigate = useNavigate()
    const { token = "" } = useParams();
    const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm();
    const [showAlert, setShowAlert] = useState(false)
    const [formSubmitted, setFormSbmt] = useState(false);
    const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
    const passRegex = new RegExp(/((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,32})/);
    const passCondsObj = { showConds: false, hasLowerChar: false, hasUpperChar: false, hasSpecialChars: false, hasNumber: false };
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfPass, setShowConfPass] = useState(false);
    const [passConds, setPassConds] = useState(passCondsObj)
    const newPassInp = watch("password");
    const confPassInp = watch("confpassword");

    useEffect(() => {
        setDocumentTitle(C_MSG.reset_pwd_document_title)
    }, [])

    useEffect(() => {
        checkValidationConditions(newPassInp, setPassConds)
    }, [newPassInp])
    useEffect(() => {
        checkPassMismatch()
    }, [confPassInp])

    const checkValidationConditions = async (passInp, setPassConds) => {
        if (passInp == undefined || passInp == null || !setPassConds || setPassConds == null) {
            return false
        }
        await trigger("password")
        let obj = { ...passCondsObj }
        if (passInp.length > 0) {
            obj.showConds = true;
            let lowerCaseRegex = new RegExp(/[a-z]/)
            let upperCaseRegex = new RegExp(/[A-Z]/)
            let specialCharRegex = new RegExp(/\W/)
            let numberRegex = new RegExp(/\d/)

            obj.hasLowerChar = lowerCaseRegex.test(passInp) ? true : false
            obj.hasUpperChar = upperCaseRegex.test(passInp) ? true : false
            obj.hasSpecialChars = specialCharRegex.test(passInp) ? true : false
            obj.hasNumber = numberRegex.test(passInp) ? true : false
        } else {
            obj.showConds = false
            obj.hasLowerChar = false
            obj.hasUpperChar = false
            obj.hasSpecialChars = false
            obj.hasNumber = false
        }
        setPassConds(oldVal => {
            return { ...obj }
        })
    }

    const checkPassMismatch = () => {
        let formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
        if (newPassInp == '' || confPassInp == '') {
            return false
        }
        if (newPassInp != confPassInp) {
            formRes = { status: false, err_status: true, error: { pass_not_match: { required: true, msg: C_MSG.password_mismatch } } }
            setFormRes(formRes)
        }
    }

    const getPassCondsList = (fieldType = "") => {
        if (fieldType == null) {
            return false
        }

        let inpField = fieldType == "password" ? newPassInp : newPassInp
        let condObj = fieldType == "password" ? passConds : passConds
        if (!condObj.showConds) {
            return false
        }
        return (
            <>
                <ul className={`${Style.pass_cond_list} fs-11 p-0 row m-0 mt-2`}>
                    {condObj.hasLowerChar}
                    <li className={`pl-0 col-6 text-${condObj.hasLowerChar ? "dark" : "muted"}`}>
                        <span className={`me-2 ${condObj.hasLowerChar ? "text-success" : ""}`}>
                            <i className={`fa fa-${condObj.hasLowerChar ? "check" : "circle"}`}></i>
                        </span>
                        One lowercase character
                    </li>
                    <li className={`pl-0 col-6 text-${condObj.hasUpperChar ? "dark" : "muted"}`}>
                        <span className={`me-2 ${condObj.hasUpperChar ? "text-success" : ""}`}>
                            <i className={`fa fa-${condObj.hasUpperChar ? "check" : "circle"}`}></i>
                        </span>
                        One uppercase character
                    </li>
                    <li className={`pl-0 col-6 text-${condObj.hasSpecialChars ? "dark" : "muted"}`}>
                        <span className={`me-2 ${condObj.hasSpecialChars ? "text-success" : ""}`}>
                            <i className={`fa fa-${condObj.hasSpecialChars ? "check" : "circle"}`}></i>
                        </span>
                        One special character
                    </li>
                    <li className={`pl-0 col-6 text-${inpField.length >= 8 ? "dark" : "muted"}`}>
                        <span className={`me-2 ${inpField.length >= 8 ? "text-success" : ""}`}>
                            <i className={`fa fa-${inpField.length >= 8 ? "check" : "circle"}`}></i>
                        </span>
                        8 characters minimum

                    </li>
                    <li className={`pl-0 col-6 text-${condObj.hasNumber ? "dark" : "muted"}`}>
                        <span className={`me-2 ${condObj.hasNumber ? "text-success" : ""}`}>
                            <i className={`fa fa-${condObj.hasNumber ? "check" : "circle"}`}></i>
                        </span>
                        One number
                    </li>
                </ul>
            </>
        )
    }

    const toggleAlert = (val) => {
        setShowAlert(val)
    }

    const onSubmit = async (data) => {
        let formRes =  {status: false, err_status: false, error: {} }
        setFormRes(formRes)
        if(!data.password || data.password == '' || !data.conf_password || data.conf_password == ''){
          return false
        };
        if(data.password != data.confpassword){
          formRes = {status:false,err_status:true,error:{pass_not_match:{required:true,msg: C_MSG.password_mismatch}}}
          setFormRes(formRes)
          return
        }
        setFormSbmt(true)
        let payloadUrl = "auth/reset-password"
        let method = "POST";
        let formData = {newPassword:data.password,token:token}
        let res = await ApiService.fetchData(payloadUrl,method,formData);
        if(res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
        //   formRes = {status:true,err_status:false,error:{},type:"reset_pass",msg:"Password updated successfully"}
        //   setFormRes(formRes)
          setTimeout(() => {
            toggleAlert({ show: true, type: 'success', message: res })
          }, 3000);
        }else{
          formRes['err_status'] = true
          formRes['error']['type'] = "reset_pass"
          formRes['error']['msg'] = res.message ? res.message :  C_MSG.technical_err
          setFormRes(formRes)
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
                                                    <h5 className="text-primary">Create new password</h5>
                                                    <p className="text-muted">Your new password must be different from previous used password.</p>
                                                </div>

                                                <div className="mt-4">
                                                    <form onSubmit={handleSubmit(onSubmit)}>

                                                        <div className="mb-3">
                                                            <Label className="form-label" htmlFor="password-input">Password</Label>
                                                            <div className="position-relative auth-pass-inputgroup mb-3">
                                                                <Input type="password" className="form-control pe-5 password-input" placeholder="Enter password" id="password-input" {...register("password", { required: true, pattern: passRegex })} />
                                                                <button onClick={() => setShowNewPass(!showNewPass)} className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon" type="button" id="password-addon"><i className="ri-eye-fill align-middle"></i></button>
                                                                {errors.password?.type === 'required' && <div className="field_err text-danger">{C_MSG.pass_required}</div>}
                                                                {passConds.showConds && getPassCondsList("password")}
                                                            </div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <Label className="form-label" htmlFor="password-input">Confirm Password</Label>
                                                            <div className="position-relative auth-pass-inputgroup mb-3">
                                                                <Input type="password" className="form-control pe-5 password-input" placeholder="Confirm password" id="password-input" {...register("confpassword", { required: true, pattern: passRegex })} />
                                                                <button onClick={() => setShowConfPass(!showConfPass)} className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon" type="button" id="password-addon"><i className="ri-eye-fill align-middle"></i></button>
                                                                {errors.confpassword?.type === 'required' && <div className="field_err text-danger">{C_MSG.conf_pass_required}</div>}
                                                                {
                                                                    formRes.err_status && formRes.error?.pass_not_match?.required
                                                                        ? <div className="field_err text-danger"><div>{formRes.error?.pass_not_match?.msg}</div> </div>
                                                                        : ''
                                                                }
                                                            </div>
                                                        </div>

                                                        {/* <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" value="" id="auth-remember-check" />
                                                            <Label className="form-check-label" htmlFor="auth-remember-check">Remember me</Label>
                                                        </div> */}

                                                        <div className="mt-4">
                                                            <button className="btn btn-success w-100" type="submit">Reset Password</button>
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

export default ResetPassword