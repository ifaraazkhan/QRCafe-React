import React, { useState } from "react"


import logoImg from "../assets/images/home/core-img/logo.png";
import foodMenuImg from "../assets/images/home/demo-img/foodmenu.png";
import aboutImg from "../assets/images/home/demo-img/about.png";
import locationImg from "../assets/images/home/demo-img/location.png";
import discountImg from "../assets/images/home/demo-img/discount.png";
import starsImg from "../assets/images/home/demo-img/stars.png";
import starImg from "../assets/images/home/demo-img/star.png";
import elegantImg from "../assets/images/home/demo-img/elegant.png";
import lightningtImg from "../assets/images/home/demo-img/lightning.png";

const Home = (props) => {

    const [showMenu, setShowMenu] = useState(false)
    const [darkTheme, setDarkTheme] = useState(false)

    const toggleMenu = (value) => {
        setShowMenu(value)
    }
    const toggleDarkTheme = (value) => {
        setDarkTheme(value == true ? true : false)
    }

    return(
        <React.Fragment>
            {/* <div id="preloader">
                <div className="spinner-grow text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div> */}
            <div id={`home_section`} data-theme={darkTheme ? "dark" : ""}>

                <div className="internet-connection-status" id="internetStatus"></div>

                <div className="header-area" id="headerArea">
                    <div className="container">
                        <div className="header-content header-style-five position-relative d-flex align-items-center justify-content-between">

                            <div className="navbar--toggler" id="affanNavbarToggler"  onClick={() => toggleMenu(showMenu ? false : true)}>
                                <span className="d-block"></span>
                                <span className="d-block"></span>
                                <span className="d-block"></span>
                            </div>

                            <div className="logo-wrapper">
                                <a href="home.html">
                                    <img src={logoImg} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`offcanvas offcanvas-start ${showMenu ? "show" : ""}`} id="affanOffcanvas" data-bs-scroll="true" tabindex="-1"
                    aria-labelledby="affanOffcanvsLabel">

                    <button className="btn-close btn-close-white text-reset" type="button" onClick={() => toggleMenu(false)}></button>

                    <div className="offcanvas-body p-0">
                        <div className="sidenav-wrapper">
                            <div className="sidenav-profile bg-gradient">
                                <div className="sidenav-style1"></div>
                                <div className="user-info">
                                    <h6 className="user-name mb-0">Mordern Bakery</h6>
                                    <span>Fresh cupcakes and special breads</span>
                                </div>
                            </div>

                            <ul className="sidenav-nav ps-0">
                                <li>
                                    <a href="home.html"><i className="bi bi-house-door"></i> Food Menu</a>
                                </li>
                                <li>
                                    <a href="elements.html"><i className="bi bi-folder2-open"></i> About us
                                    </a>
                                </li>
                                <li>
                                    <a href="pages.html"><i className="bi bi-collection"></i> Direction

                                    </a>
                                </li>
                                <li>
                                    <a href="#"><i className="bi bi-cart-check"></i> Feedback <span className="badge bg-success rounded-pill ms-2">Speak your mind</span></a>
                                    <ul>
                                        <li>
                                            <a href="#">Audio Feedback</a>
                                        </li>
                                        <li>
                                            <a href=""> Write your Review</a>
                                        </li>
                                        <li>
                                            <a href="">Feedback Surbey</a>
                                        </li>
                                        <li>
                                            <a href="">Give Rating</a>
                                        </li>

                                    </ul>
                                </li>
                                <li>
                                    <a href="settings.html"><i className="bi bi-gear"></i> Promotions and Offers </a>
                                </li>
                                <li>
                                    <div className="night-mode-nav">
                                        <i className="bi bi-moon"></i> Night Mode
                                        <div className="form-check form-switch">
                                            <input className="form-check-input form-check-success" id="darkSwitch" type="checkbox" onChangeCapture={(e) => toggleDarkTheme(e.target.checked) } />
                                        </div>
                                    </div>
                                </li>
                            </ul>

                            <div className="social-info-wrap">
                                <a href="#">
                                    <i className="bi bi-facebook"></i>
                                </a>
                                <a href="#">
                                    <i className="bi bi-twitter"></i>
                                </a>
                                <a href="#">
                                    <i className="bi bi-linkedin"></i>
                                </a>
                            </div>

                            <div className="copyright-info">
                                <p>
                                    <span id="copyrightYear"></span>
                                    &copy; Powered by <a href="#">HappyVibes</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="page-content-wrapper">

                    <div className="container">
                        <div className="card card-bg-img bg-img bg-overlay bakery_bg_img" >
                            <div className="card-body p-5 direction-rtl">
                                <h2 className="text-white display-3 mb-4 text-center">Modern Bakery</h2>
                            </div>
                            <div className="container direction-rtl">
                                <div className="card mb-3 bg-transparent">
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-4">
                                                <div className="feature-card mx-auto text-center">
                                                    <div className="card mx-auto bg-gray">
                                                        <img src={foodMenuImg} alt="" />
                                                    </div>
                                                    <p className="mb-0">Food Menu</p>
                                                </div>
                                            </div>

                                            <div className="col-4">
                                                <div className="feature-card mx-auto text-center" data-bs-toggle="modal" data-bs-target="#bottomAlignModal">
                                                    <div className="card mx-auto bg-gray">
                                                        <img src={aboutImg} alt="" />
                                                    </div>
                                                    <p className="mb-0">About us</p>
                                                </div>
                                            </div>

                                            <div className="col-4">
                                                <div className="feature-card mx-auto text-center">
                                                    <div className="card mx-auto bg-gray">
                                                        <img src={locationImg} alt="" />
                                                    </div>
                                                    <p className="mb-0">Direction</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="pt-3"></div>



                    <div className="container">
                        <div className="card card-round">
                            <div className="card-body d-flex align-items-center direction-rtl">
                                <div className="card-img-wrap">
                                    <img src={discountImg} alt="" />
                                </div>
                                <div className="card-content">
                                    <h5 className="mb-3">Dine Smart with Exclusive Offers</h5>
                                    <a className="btn btn-info rounded-pill" href="#">Get your deals</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-3"></div>

                    <div className="container">
                        <div className="card card-round">
                            <div className="card-body d-flex align-items-center direction-rtl">
                                <div className="card-img-wrap">
                                    <img src={starsImg} alt="" />
                                </div>
                                <div className="card-content">
                                    <h5 className="mb-3">Share Your Voice, Shape Our Future</h5>
                                    <a className="btn btn-warning rounded-pill" href="#">Record Audio feedback</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-3"></div>

                    <div className="container direction-rtl">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="feature-card mx-auto text-center">
                                            <div className="card mx-auto bg-gray">
                                                <img src={starImg} alt="" />
                                            </div>
                                            <p className="mb-0">Best Rated</p>
                                        </div>
                                    </div>

                                    <div className="col-4">
                                        <div className="feature-card mx-auto text-center">
                                            <div className="card mx-auto bg-gray">
                                                <img src={elegantImg} alt="" />
                                            </div>
                                            <p className="mb-0">Elegant</p>
                                        </div>
                                    </div>

                                    <div className="col-4">
                                        <div className="feature-card mx-auto text-center">
                                            <div className="card mx-auto bg-gray">
                                                <img src={lightningtImg} alt="" />
                                            </div>
                                            <p className="mb-0">Trendsetter</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-3"></div>
                    <div className="copyright-info">
                        <p>
                            <span id="copyrightYear"></span>
                            &copy; Powered by <a href="#">HappyVibes</a>
                        </p>
                    </div>

                </div>
                {showMenu && <div className="offcanvas-backdrop fade show"></div>}
            </div>
        </React.Fragment>
    )

}

export default Home