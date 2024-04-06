import { Fragment } from "react"
import Style from "../../Styles/PublicFooter.module.css"

const PublicFooter = () => {
    return (
        <Fragment>
            <footer id={Style.footer} className="p_footer py-4 px-3 bg-white fw-600">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-6">
                            &copy; {new Date().getFullYear()}
                        </div>
                        <div className="col-sm-6">
                            <div className="text-sm-end d-none d-sm-block">
                            {process.env.REACT_APP_SITE_NAME} - All Rights Reserved
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </Fragment>
    )
}

export default PublicFooter