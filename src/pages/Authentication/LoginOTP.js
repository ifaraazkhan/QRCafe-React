import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Input , Label, Card, Button, Container, Row, Col, Checkbox} from '../../Helpers/UiHelper'
import Style from "../../Styles/auth.module.css"
import AuthSlider from "../../Components/Elements/AuthSlider";
import AuthFooter from '../../Components/Partials/AuthFooter';
import { setDocumentTitle } from '../../Helpers/Helper';
import { useForm } from 'react-hook-form';
import C_MSG from '../../Helpers/MsgsList';

const LoginOTP = () => {
    const navigate = useNavigate()
    const { register, setValue, handleSubmit, formState: { errors }, setFocus} = useForm();
    const [errMsg, setErrMsg] = useState('')
    const [formSubmitted, setFormSbmt] = useState(false);

    useEffect(() => {
        setDocumentTitle(C_MSG.login_otp_document_title)
    }, [])

    const resendOTP = async () => {
        let payloadUrl = `auth/resendOTP`
        let method = "GET"
        let formData = {}
        // let res = await ApiService.fetchData(payloadUrl, method);
        let res = false;
        if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
            window.location.reload()
        }
    }

    const onPaste = (event) => {
        let pastedData = event.clipboardData.getData("text/plain")
        let numbers = pastedData.replace(/[^0-9]/g, "");
        if (numbers.length == 0 || numbers.length < 6) {
          event.preventDefault()
          return false
        }
        let copiedOtp = pastedData.split("")
        setValue("otpInp1", numbers[0]);
        setValue("otpInp2", numbers[1]);
        setValue("otpInp3", numbers[2]);
        setValue("otpInp4", numbers[3]);
        setValue("otpInp5", numbers[4]);
        setValue("otpInp6", numbers[5]);
        setFocus("otpInp6", { shouldSelect: true })
    }

    const checkOtpValidation = (event, index) => {
        let inptVal = event.key
        let pattern = new RegExp(/^[0-9]$/);
        if (event.keyCode == 8) {
          event.target.value = ''
          if (event.target.value.length == 0) {
            let ele = document.getElementById(`authOtp${index + 1}`)
            if (ele.previousElementSibling) {
              ele.previousElementSibling.focus()
            }
          }
    
        }
        if ((event.metaKey || event.ctrlKey) && event.keyCode == 86) {
          return false
        }
        let numbers = inptVal.replace(/[^0-9]/g, "");
        if (event.keyCode == 13) {
          handleSubmit(onSubmit)
          return false
        }
        if (numbers.length == 0 || !pattern.test(numbers)) {
          event.preventDefault();
          return false
        }
        if (inptVal.length > 0) {
          let ele = document.getElementById(`authOtp${index + 1}`)
          if (ele.nextElementSibling) {
            setTimeout(() => {
              ele.nextElementSibling.focus()
            }, 50);
          }
        }
      }

    const onSubmit = async (data) => {
        setErrMsg('')
        if (
            !data.otpInp1 || data.otpInp1 == '',
            !data.otpInp2 || data.otpInp2 == '',
            !data.otpInp3 || data.otpInp3 == '',
            !data.otpInp4 || data.otpInp4 == '',
            !data.otpInp5 || data.otpInp5 == '',
            !data.otpInp6 || data.otpInp6 == ''
        ) {
            return false
        };
        let otp = Object.values(data).join('')
        if (!otp || otp == '') {
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `auth/validateOTP`
        let method = "POST"
        let formData = { otp }
        // let res = await ApiService.fetchData(payloadUrl, method, formData);
        let res = false;
        if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
            let result = res.response || null
            if (result) {
                // result = decryptData(result)
                let resultArr = (result).split("|");
                let now = (new Date).getTime()
                let resDate = (new Date(resultArr[0])).getTime()
                let diff = Math.floor((now - resDate) / 1000)
                if (diff > 1800) {
                    // logOut()
                }
                if (resultArr[1] == otp) {
                    // let userData = userInfo
                    let userData = {}
                    userData.otpVerified = true
                    // let setcookie = SetCookie('currentUser', JSON.stringify(userData))
                    let user = userData?.user || {}
                    // let redirectUrl = GetCookie("redirect_url")
                    navigateToUrl("/")
                }
            }
        } else {
            setErrMsg(res.message)
        }
        setFormSbmt(false)
    }

    const navigateToUrl = (modulesArr = [], userData = {}) => {
        navigate('/user/profile', { replace: true })
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
                                                    <h5 className="text-primary">Verify OTP</h5>
                                                    <p className="text-muted">Please enter otp to continue to login</p>
                                                </div>

                                                <div className="mt-4">
                                                    <form action="/">
                                                        <div className={`form-group mt-3 otp_box ${Style.otp_box}`}>
                                                            <input type="text" className={`otp_input_field ${Style.otp_input_field}`} {...register("otpInp1")} id="authOtp1" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 0)} onPasteCapture={onPaste} />
                                                            <input type="text" className={`otp_input_field ${Style.otp_input_field}`} {...register("otpInp2")} id="authOtp2" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 1)} onPaste={onPaste} />
                                                            <input type="text" className={`otp_input_field ${Style.otp_input_field}`} {...register("otpInp3")} id="authOtp3" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 2)} onPaste={onPaste} />
                                                            <input type="text" className={`otp_input_field ${Style.otp_input_field}`} {...register("otpInp4")} id="authOtp4" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 3)} onPaste={onPaste} />
                                                            <input type="text" className={`otp_input_field ${Style.otp_input_field}`} {...register("otpInp5")} id="authOtp5" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 4)} onPaste={onPaste} />
                                                            <input type="text" className={`otp_input_field ${Style.otp_input_field}`} {...register("otpInp6")} id="authOtp6" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 5)} onPaste={onPaste} />
                                                        </div>
                                                        {
                                                            errMsg && errMsg != ''
                                                                ? <span className="form_err text-danger d-block mb-3">{errMsg}</span>
                                                                : ''
                                                        }
                                                        <div className="d-flex justify-content-end form-group mt-3">
                                                            <span className="text-muted link_url" onClick={() => resendOTP()} >Resend OTP</span>
                                                        </div>
                                                        <div className="form_submit_btn mt-3">
                                                            <button type="submit" className="btn btn-primary btn-success w-100" disabled={formSubmitted}>Verify</button>
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
        </React.Fragment>
    );
}

export default LoginOTP