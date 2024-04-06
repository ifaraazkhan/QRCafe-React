import React, { useContext, useEffect, useState } from "react";
import Style from "../../Styles/Page400.module.css";
import { AuthContext } from "../../ContextProvider/AuthContext";
import AuthFooter from "../../Components/Partials/AuthFooter";
import img400 from "../../assets/images/error.svg" 

const Page400 = (props) => {
  const {} = useContext(AuthContext);
  useEffect(() => {
  }, []);
  const pageRefresh = () => {
    window.location.reload();
  };
  return (
    <>
      <React.Fragment>
        <div className="auth-page-wrapper pt-5">
          <div className="auth-one-bg-position auth-one-bg" id="auth-particles">

            <div className="bg-overlay"></div>

            <div className="shape">
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 1440 120">
                <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z"></path>
              </svg>
            </div>
          </div>

          <div className="auth-page-content">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="text-center pt-4">
                            <div className="">
                                <img src={img400} alt="" className="error-basic-img move-animation" />
                            </div>
                            <div className="mt-n4">
                                <h1 className="display-1 fw-medium">400</h1>
                                <h3 className="text-uppercase">Oops, Something went wrong ! 😭</h3>
                                <button className={`btn btn-primary-2 btn_04 fs-18 px-4`} onClick={() => pageRefresh()}>Try Again</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

          {/* pass the children */}
          {props.children}

          {/* <AuthFooter /> */}
        </div>
      </React.Fragment>
    </>
  );
};

export default Page400;
