import { useContext, useEffect, useState } from "react";
import Style from "../../Styles/Page400.module.css";
import { AuthContext } from "../../ContextProvider/AuthContext";
const Page400_2 = (props) => {
  const {} = useContext(AuthContext);
  useEffect(() => {
  }, []);
  const pageRefresh = () => {
    window.location.reload();
  };
  return (
    <>
      <div className="container-fluid">
        <section className="custom_err_page_sec">
          <div className="custom_err_page d-flex align-items-center ">
            <div className="page404block w-100">
              <div className="d-flex flex-wrap align-items-center justify-content-center">
                <div className="w-100 text-center">
                  <div className="logo_box">
                    <img alt="404 img" src="/assets/img/400.svg" className="img-fluid page404_img" />
                  </div>
                </div>
                <div
                  className={`custom_err_msg_section mt-4 text-center ${Style.custom_err_msg_section}`}
                >
                  <p className={`m-0 ${Style.fs_big} fw-500`}>
                    Something went wrong
                  </p>
                  <p className={`m-0 mt-2 fs-18 fw-400`}>
                    please try again or report an issue to support
                  </p>
                  <div className="mt-4">
                    <button className={`btn btn-primary-2 btn_04 fs-18 px-4`} onClick={() => pageRefresh()}>Try Again</button>
                    <a className={`ml-4 btn btn_2 fs-18 px-4`} href="mailto:support@qrcafe.com">Report an issue</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Page400_2;
