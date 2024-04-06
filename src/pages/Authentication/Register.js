import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Container, Row, Input, Button } from "../../Helpers/UiHelper";
import { useForm } from "react-hook-form";
import Style from "../../Styles/auth.module.css"

import AuthSlider from '../../Components/Elements/AuthSlider';
import AuthFooter from '../../Components/Partials/AuthFooter';
import { setDocumentTitle } from '../../Helpers/Helper';
import C_MSG from '../../Helpers/MsgsList';
import { ApiService } from '../../Services/ApiService';
import SweetAlert from 'react-bootstrap-sweetalert';

const Register = () => {
    const navigate = useNavigate()
    // const { register, handleSubmit, watch, setValue, getValues, formState: { errors }, trigger, clearErrors } = useForm();
    const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm();
    const [formSubmitted, setFormSbmt] = useState(false);
    const [passwordShow, setPasswordShow] = useState(false);
    const [confpasswordShow, setConfPasswordShow] = useState(false);
    const [showAlert, setShowAlert] = useState(false)
    const passRegex = new RegExp(/((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,32})/)
    const passCondsObj = { showConds: false, hasLowerChar: false, hasUpperChar: false, hasSpecialChars: false, hasNumber: false }
    const [passConds, setPassConds] = useState(passCondsObj)
    const passInp = watch("password")

    useEffect(() => {
        setDocumentTitle(C_MSG.register_document_title)
    }, [])

    useEffect(() => {
        checkValidationConditions(passInp, setPassConds)
    }, [passInp])


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

    const getPassCondsList = (fieldType = "") => {
        if (fieldType == null) {
            return false
        }

        let inpField = fieldType == "password" ? passInp : passInp
        let condObj = fieldType == "password" ? passConds : passConds
        if (!condObj.showConds) {
            return false
        }
        return (
            <>
                <ul className={`${Style.pass_cond_list} fs-11 p-0 row m-0 mt-2`}>
                    {condObj.hasLowerChar}
                    <li className={`pl-0 col-6 text-${condObj.hasLowerChar ? "dark" : "muted"}`}>
                        <span className={`mr-2 ${condObj.hasLowerChar ? "text-success" : ""}`}>
                            <i className={`fa fa-${condObj.hasLowerChar ? "check" : "circle"}`}></i>
                        </span>
                        One lowercase character
                    </li>
                    <li className={`pl-0 col-6 text-${condObj.hasUpperChar ? "dark" : "muted"}`}>
                        <span className={`mr-2 ${condObj.hasUpperChar ? "text-success" : ""}`}>
                            <i className={`fa fa-${condObj.hasUpperChar ? "check" : "circle"}`}></i>
                        </span>
                        One uppercase character
                    </li>
                    <li className={`pl-0 col-6 text-${condObj.hasSpecialChars ? "dark" : "muted"}`}>
                        <span className={`mr-2 ${condObj.hasSpecialChars ? "text-success" : ""}`}>
                            <i className={`fa fa-${condObj.hasSpecialChars ? "check" : "circle"}`}></i>
                        </span>
                        One special character
                    </li>
                    <li className={`pl-0 col-6 text-${inpField.length >= 8 ? "dark" : "muted"}`}>
                        <span className={`mr-2 ${inpField.length >= 8 ? "text-success" : ""}`}>
                            <i className={`fa fa-${inpField.length >= 8 ? "check" : "circle"}`}></i>
                        </span>
                        8 characters minimum

                    </li>
                    <li className={`pl-0 col-6 text-${condObj.hasNumber ? "dark" : "muted"}`}>
                        <span className={`mr-2 ${condObj.hasNumber ? "text-success" : ""}`}>
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

    const onSubmit = async (data = null) => {
        if(data == null){
            return false;
        }
        setFormSbmt(true)
        let payloadUrl = "auth/register"
        let method = "POST";
        let formData = data
        // delete formData.confpassword
        const res = await ApiService.fetchData(payloadUrl,method,formData)
        if(res){
            toggleAlert({ show: true, type: 'success', message: "Registration Successful! You will be redirected to login to continue" })
            setTimeout(() => {
                navigate("/admin/login")
            }, 3000);
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
                                <Card className="overflow-hidden m-0">
                                    <Row className="justify-content-center g-0">
                                        <AuthSlider />
                                        <Col lg={6}>
                                            <div className="p-lg-5 p-4">
                                                <div>
                                                    <h5 className="text-primary">Register Account</h5>
                                                    <p className="text-muted">Get your Free account now.</p>
                                                </div>
                                                <div className="mt-4">
                                                    <form className="needs-validation"  onSubmit={handleSubmit(onSubmit)}>
                                                        <div className='row'>
                                                            <div className='col-sm-6'>
                                                                <div className="form-group mb-3">
                                                                    <label htmlFor="fname" className="form-label text_color_2">First Name <span className="text-danger">*</span></label>
                                                                    <input type="text" className="form-control" id="fname" placeholder="Enter First Name" {...register("firstname", { required: true })} />
                                                                    {errors.firstname?.type === 'required' && <div className="field_err text-danger">{C_MSG.fname_required}</div>}
                                                                </div>
                                                            </div>
                                                            <div className='col-sm-6'>
                                                                <div className="form-group mb-3">
                                                                    <label htmlFor="lname" className="form-label text_color_2">Last Name <span className="text-danger">*</span></label>
                                                                    <input type="text" className="form-control" id="lname" placeholder="Enter Last Name" {...register("lastname", { required: true })} />
                                                                    {errors.lastname?.type === 'required' && <div className="field_err text-danger">{C_MSG.lname_required}</div>}
                                                                </div>
                                                            </div>
                                                            <div className='col-sm-6'>
                                                                <div className="form-group mb-3">
                                                                    <label htmlFor="useremail" className="form-label text_color_2">Email <span className="text-danger">*</span></label>
                                                                    <input type="email" className="form-control" id="useremail" placeholder="Enter email address" {...register("email",{required:true})} />
                                                                    {errors.email?.type === 'required' && <div className="field_err text-danger">{C_MSG.email_required}</div>} 
                                                                </div>
                                                            </div>
                                                            <div className='col-sm-6'>
                                                                <div className="form-group mb-3">
                                                                    <label htmlFor="mobile" className="form-label text_color_2">Mobile Number <span className="text-danger">*</span></label>
                                                                    <input type="text" className="form-control" id="mobile" placeholder="Enter Mobile Number" {...register("mobile", { required: true })} />
                                                                    {errors.mobile?.type === 'required' && <div className="field_err text-danger">{C_MSG.ph_number_required}</div>}
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-12">
                                                                <div className="form-group mb-3">
                                                                    <label className="form-label text_color_2" htmlFor="password-input">Password</label>
                                                                    <div className="position-relative auth-pass-inputgroup">
                                                                        <Input type={passwordShow ? "text" : "password"} className="form-control pe-5 password-input" placeholder="Password" id="password-input"  {...register("password", { required: true, pattern: passRegex })} />
                                                                        <Button color="link" onClick={() => setPasswordShow(!passwordShow)} className="position-absolute end-0 top-0 text-decoration-none text-muted password-addon" type="button" id="password-addon"><i className="ri-eye-fill align-middle"></i></Button>
                                                                        {errors.password?.type === 'required' && <div className="field_err text-danger">{C_MSG.pass_required}</div>}
                                                                        {passConds.showConds && getPassCondsList("password")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* <div className="col-sm-12">
                                                                <div className="form-group mb-3">
                                                                    <label className="form-label text_color_2" htmlFor="conf-password-input">Confirm Password</label>
                                                                    <div className="position-relative auth-pass-inputgroup">
                                                                        <Input type={confpasswordShow ? "text" : "password"} className="form-control pe-5 password-input" placeholder="Confirm password" id="conf-password-input"  {...register("confpassword", { required: true, pattern: passRegex })} />
                                                                        <Button color="link" onClick={() => setConfPasswordShow(!confpasswordShow)} className="position-absolute end-0 top-0 text-decoration-none text-muted password-addon" type="button" id="password-addon"><i className="ri-eye-fill align-middle"></i></Button>
                                                                        {errors.confpassword?.type === 'required' && <div className="field_err text-danger">{C_MSG.conf_pass_required}</div>}
                                                                    </div>
                                                                </div>
                                                            </div> */}
                                                        </div>
                                                        <div className="mb-4">
                                                            <p className="mb-0 fs-12 text-muted fst-italic">By registering you agree to the <a onClick={() => navigate("/termscondition")} className="text-primary text-decoration-underline fst-normal fw-medium link_url">Terms of Use</a></p>
                                                        </div>
                                                        <div className="mt-4">
                                                            <button className="btn btn-success w-100" type="submit" disabled={formSubmitted}>Sign Up</button>
                                                        </div>
                                                    </form>
                                                </div>
                                                <div className="mt-5 text-center">
                                                    <p className="mb-0">Already have an account ? <a onClick={() => navigate("/admin/login")} className="fw-semibold text-primary text-decoration-underline link_url"> Signin</a> </p>
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

export default Register