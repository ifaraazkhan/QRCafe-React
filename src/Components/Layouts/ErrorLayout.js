import React, { Fragment } from "react"
import MyErrorBoundary from "../../ErrorHandler/ErrorBoundary"
import Footer from "../Partials/PublicFooter"
import Header from "../Partials/PublicHeader"

const ErrorLayout = (props) => {
    return (
        <Fragment>
            <>
            {/* <div className="header_block">
                <Header />
            </div> */}
            <div className=" container-fluid">
                <section className="w-100">
                    <div className="err_layout">{props.children}</div>
                </section>
            </div>
            {/* <Footer /> */}
            </>
        </Fragment>
    )
}

export default ErrorLayout