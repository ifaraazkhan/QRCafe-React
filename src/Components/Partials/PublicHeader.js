import { Fragment } from "react"
import Style from "../../Styles/PublicHeader.module.css"

import logo from "../../assets/images/logo-sm-1.png"

const PublicHeader = () => {
    return (
        <Fragment>
            <header id={Style.header} className="p_header p-2 bg-white fw-600">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-3">
                           <div className={`${Style.logo_box}`}>
                                <img src={logo} className="img-fluid h-100" />
                           </div>
                        </div>
                    </div>
                </div>
            </header>
        </Fragment>
    )
}

export default PublicHeader