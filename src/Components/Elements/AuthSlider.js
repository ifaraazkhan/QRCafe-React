import React from "react";
import { Col } from '../../Helpers/UiHelper';
import { Link } from "react-router-dom";

// Import Images
import logoImg from "../../assets/images/home/core-img/logo.png";

const AuthSlider = () => {
    return (
        <Col lg={8} className="auth-slider-col" style={{paddingTop:"60px",paddingRight:"50px"}}>
            <div className="auth-slider-wrapper">
                <Link to="/dashboard" className="logo-container">
                    <img src={logoImg} alt="Logo" className="logo-img" />
                </Link>
            </div>
        </Col>
    );
};

export default AuthSlider;

