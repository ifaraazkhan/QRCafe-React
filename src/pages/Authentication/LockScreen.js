import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Input , Label, Card, Button, Container, Row, Col, Checkbox} from '../../Helpers/UiHelper'
import Style from "../../Styles/auth.module.css"
import AuthSlider from "../../Components/Elements/AuthSlider";
import AuthFooter from '../../Components/Partials/AuthFooter';
import { setDocumentTitle } from '../../Helpers/Helper';
import { useForm } from 'react-hook-form';

import avatar1 from "../../assets/images/users/avatar-1.jpg";
import C_MSG from '../../Helpers/MsgsList';

const LockScreen = () => {
    const navigate = useNavigate()
    const { register, setValue, handleSubmit, formState: { errors }, setFocus} = useForm();
    const [formSubmitted, setFormSbmt] = useState(false);

    useEffect(() => {
        setDocumentTitle(C_MSG.lockscreen_document_title)
    }, [])

    
    const onSubmit = async (data) => {
        if(data != null){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `auth/validateOTP`
        let method = "POST"
        let formData = data 
        // let res = await ApiService.fetchData(payloadUrl, method, formData);
        let res = false;
        if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
            let result = res.response || null
            if (result) {
                // result = decryptData(result)
            }
        } else {

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
                                                    <h5 className="text-primary">Lock Screen</h5>
                                                    <p className="text-muted">Enter your password to unlock the screen!</p>
                                                </div>
                                                <div className="user-thumb text-center">
                                                    <img src={avatar1} className="rounded-circle img-thumbnail avatar-lg" alt="thumbnail" />
                                                    <h5 className="mt-3">Anna Adame</h5>
                                                </div>

                                                <div className="mt-4">
                                                    <form onSubmit={handleSubmit(onSubmit)}>
                                                        <div className="mb-3">
                                                            <label className="form-label" htmlFor="userpassword">Password</label>
                                                            <input type="password" className="form-control" id="userpassword" placeholder="Enter password" {...register("password",{required:true})} />
                                                        </div>
                                                        <div className="mb-2 mt-4">
                                                            <button className="btn btn-primary btn-success w-100" type="submit">Unlock</button>
                                                        </div>
                                                    </form>
                                                </div>

                                                <div className="mt-5 text-center">
                                                    <p className="mb-0">Not you ? return <a onClick={() => navigate("/admin/login")} className="fw-semibold text-primary text-decoration-underline"> Signin</a></p>
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

export default LockScreen