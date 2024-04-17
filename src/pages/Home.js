import React, { useEffect, useRef, useState } from "react"


import logoImg from "../assets/images/home/core-img/logo.png";
import foodMenuImg from "../assets/images/home/demo-img/foodmenu.png";
import aboutImg from "../assets/images/home/demo-img/about.png";
import locationImg from "../assets/images/home/demo-img/location.png";
import discountImg from "../assets/images/home/demo-img/discount.png";
import starsImg from "../assets/images/home/demo-img/stars.png";
import starImg from "../assets/images/home/demo-img/star.png";
import elegantImg from "../assets/images/home/demo-img/elegant.png";
import lightningtImg from "../assets/images/home/demo-img/lightning.png";

import SweetAlert from "react-bootstrap-sweetalert";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiService } from "../Services/ApiService";
import StackModal from "../Components/Elements/StackModal";
import C_MSG from "../Helpers/MsgsList";
import { encryptData } from "../Helpers/Helper";

const Home = (props) => {

    const [showMenu, setShowMenu] = useState(false)
    const [darkTheme, setDarkTheme] = useState(true)

    const [searchParams, setSearchParams] = useSearchParams();
    const [accInfo, setAccInfo] = useState({});
    const [modalType, setModalType] = useState(null)
    const [modalData, setModalData] = useState({});
    const [openModal, setShowModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const [formSubmitted, setFormSbmt] = useState(false);
    const [permission, setPermission] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);
    const [stream, setStream] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(null);
    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const mimeType = "audio/mp4";

    const qrc = searchParams.get("qrc")
    const navigate = useNavigate();
    const timerSubscription = useRef()
    const timeOutSubscription = useRef()

    useEffect(() => {
        if (!qrc) {
            navigate("/page404")
        }
        if(accInfo && Object.keys(accInfo).length == 0){
            getAccountInfo(qrc)
        }
        
    }, [qrc])

    const getAccountInfo = async (uniqId = null) => {
        if(uniqId == null){
            return false
        }
        let payloadUrl = `public/account/${uniqId}`
        let method = "GET"
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let account = res.results[0]
            console.log(account);
            setAccInfo(oldVal => ({...account}))
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
    }

    const toggleAlert = (val) => {
        setShowAlert(val)
    }
    
    const toggleMenu = (value) => {
        setShowMenu(value)
    }
    const toggleDarkTheme = (value) => {
        setDarkTheme(value == true ? true : false)
    }

    const showModal = async (modalName = null, data = null) => {
        if (modalName == null) {
          return false;
        }
        setModalData({})
        switch (modalName) {
          case "view_text_modal":
            if(data != null){
               setModalData(data)
            }
            setModalType(modalName);
            setShowModal(true);
            break;

          case "record_audio_feedback_modal":
            // setModalData({ })
            setModalType(modalName);
            setShowModal(true);
            break;
          case "view_pdf_modal":
            if(data != null){
                // let file = await getFileDetails(data.fileUrl)
                data.file = data.fileUrl
                // data.file = "http://localhost:3002/sample_pdf.pdf"
                setModalData({...data})
            }
            setModalType(modalName);
            setShowModal(true);
            break;
        }
        
    };

    const hideModal = () => {
        setModalType(null);
        setShowModal(false);
        discardMicrophonePermission()
    };

    const newtabURL = (url = "", data = {}, ev) => {
        if (url == "") {
          return;
        }
        window.open(url, '_blank', 'noreferrer')
    };

    const onStartRecordAudio = async () => {
        const result = getMicrophonePermission()
    }

    const getMicrophonePermission = async () => {
        // console.log(navigator.permissions);
        if ("MediaRecorder" in window) {
            try {
                let micPermission = await navigator.permissions.query({name: 'microphone'})
                if(micPermission.state == "granted" || micPermission.state == "prompt"){
                    const streamData = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: false,
                    });
                    setMediaStream(streamData)
                    setPermission(true);
                    setStream(streamData);
                    showModal("record_audio_feedback_modal")
                } else if(micPermission.state == "denied"){
                    toggleAlert({ show: true, type: 'danger', message: "Please allow your microphone permission in your browser."})
                }
            } catch (err) {
                toggleAlert({ show: true, type: 'danger', message: err.message})
            }
        } else {
            toggleAlert({ show: true, type: 'danger', message: "Recording is not supported in your browser."})
        }
    };
    const discardMicrophonePermission = async () => {
        clearInterval(timerSubscription.current);
        clearTimeout(timeOutSubscription.current)
        setElapsedTime(null)
        setStartTime(null)
        if ("MediaRecorder" in window) {
            try {
                let micPermission = await navigator.permissions.query({name: 'microphone'})
                if(micPermission.state == "granted" || micPermission.state == "prompt"){
                    mediaStream.getTracks().forEach(track => track.stop());
                    
                    setPermission(false);
                    setRecordingStatus("inactive");
                    setAudio(null);
                    setAudioBlob(null);
                    setAudioChunks([]);
                }
            } catch (err) {
                toggleAlert({ show: true, type: 'danger', message: err.message})
            }
        } else {
            toggleAlert({ show: true, type: 'danger', message: "Recording is not supported in your browser."})
        }
    }

    const onStartRecording = () => {
        let stTime = new Date().getTime()
        const interval = setInterval(() => startTimer(stTime), 1000);
        timerSubscription.current = interval
        const timeout = setTimeout(() => {
            stopRecording()
        }, 120000);
        timeOutSubscription.current = timeout;
        startRecording()
    }

    const startRecording = async () => {
        setAudio(null);
        setAudioChunks([]);
        setRecordingStatus("recording");
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, { type: mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
           if (typeof event.data === "undefined") return;
           if (event.data.size === 0) return;
           localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
      };

      const stopRecording = () => {
        clearInterval(timerSubscription.current);
        clearTimeout(timeOutSubscription.current)
        setElapsedTime(null)
        setStartTime(null)
        setRecordingStatus("inactive");
        //stops the recording instance
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
          //creates a blob file from the audiochunks data
           const audioBlob = new Blob(audioChunks, { type: mimeType });
          //creates a playable URL from the blob file.
           const audioUrl = URL.createObjectURL(audioBlob);
           setAudio(audioUrl);
           setAudioBlob(audioBlob);
           setAudioChunks([]);
        };
    };

    const submitFeedack = async (data = null) => {
        if(data == null ){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `public/submitFeedback`
        let method = "POST"
        // let formData = data
        // formData.qrc = qrc;
        // formData.member_id = 0;
        // formData.audioFile = audioBlob;
        // console.log(formData);

        let formData = new FormData();
        formData.append(`qrc`, qrc)
        formData.append(`member_id`, 0)
        formData.append(`feedback_text`, data.feedback_text)
        formData.append(`audioFile`, audioBlob)
            
        const res = await ApiService.fetchData(payloadUrl,method,formData,{formType:"form",fileUpload:true})
        // const res = await ApiService.fetchData(payloadUrl,method, formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            discardMicrophonePermission()
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message || C_MSG.technical_err })
        }
        setFormSbmt(false)
        return res
    }

    const startTimer = (stTime = null) => {
        const now = new Date().getTime();
        if(stTime != null){
            setStartTime(stTime)
        }
        stTime = stTime || startTime
        const timeElapsed = now - stTime
        const seconds = Math.floor((timeElapsed / 1000) % 60)
        const minutes = Math.floor((timeElapsed / 1000 / 60) % 60)

        let obj = {
            min : ('00' + minutes).slice(-2),
            sec : ('00' + seconds).slice(-2)
        }

        setElapsedTime(obj)
    }

    const getFileDetails = async (fileUrl = null) => {
        if (fileUrl != null) {
            let payloadUrl = `${fileUrl}`
            // let payloadUrl = `http://localhost:3002/sample_pdf.pdf`
            let method = "GET";
            // let response = await ApiService.fetchFile(payloadUrl, method);
            let formData = {};
            let response = await ApiService.fetchData(payloadUrl, method, formData, { isFileRequest: true })
            // let jsonResponse = response.clone()
            let res = await response.arrayBuffer();
            if (res) {
                let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'application/pdf';
                if (contentType.indexOf('application/json') == -1) {
                    var blob = new Blob([res], { type: contentType });
                    let reader = new FileReader();
                    // let url = reader.readAsDataURL(blob);
                    let fileUrl = window.URL.createObjectURL(blob);
                    
                    return fileUrl
                } else {
                    return false
                }
            }
        }
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
                                    <h6 className="user-name mb-0">{accInfo?.title}</h6>
                                    <span>{accInfo?.sub_title}</span>
                                </div>
                            </div>

                            <ul className="sidenav-nav ps-0">
                                <li>
                                    <a className="link_url" onClick={() => showModal("view_pdf_modal",{fileUrl: accInfo.menu_path})}><i className="bi bi-house-door"></i> Food Menu</a>
                                </li>
                                <li>
                                    <a className={"link_url"} onClick={() => showModal("view_text_modal", {title: "About Us",text:accInfo?.about_us})}><i className="bi bi-folder2-open"></i> About us
                                    </a>
                                </li>
                                <li>
                                    <a className={"link_url"} onClick={() => newtabURL(accInfo?.g_map_url)}><i className="bi bi-collection"></i> Direction

                                    </a>
                                </li>
                                <li>
                                    <a className="link_url" onClick={() => onStartRecordAudio()}><i className="bi bi-cart-check"></i> Feedback <span className="badge bg-success rounded-pill ms-2">Speak your mind</span></a>
                                    {/* <ul>
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

                                    </ul> */}
                                </li>
                                <li>
                                    <a className={"link_url"} onClick={() => showModal("view_text_modal", {title: "Offers",text:accInfo?.offer})}><i className="bi bi-gear"></i> Promotions and Offers </a>
                                </li>
                                {/* <li>
                                    <div className="night-mode-nav">
                                        <i className="bi bi-moon"></i> Night Mode
                                        <div className="form-check form-switch">
                                            <input className="form-check-input form-check-success" id="darkSwitch" type="checkbox" onChangeCapture={(e) => toggleDarkTheme(e.target.checked) } />
                                        </div>
                                    </div>
                                </li> */}
                            </ul>

                            <div className="social-info-wrap">
                                <a className={"link_url"} onClick={() => newtabURL(accInfo?.fb_url)}>
                                    <i className="bi bi-facebook"></i>
                                </a>
                                <a className={"link_url"} onClick={() => newtabURL(accInfo?.twitter_url)}>
                                    <i className="bi bi-twitter"></i>
                                </a>
                                <a className={"link_url"} onClick={() => newtabURL(accInfo?.linkedin_url)}>
                                    <i className="bi bi-linkedin"></i>
                                </a>
                            </div>

                            <div className="copyright-info">
                                <p>
                                    <span id="copyrightYear"></span>
                                    &copy; Powered by <a className={"link_url"} onClick={() => newtabURL("")}>HappyVibes</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="page-content-wrapper">

                    <div className="container">
                        <div className="card card-bg-img bg-img bg-overlay bakery_bg_img" >
                            <div className="card-body p-5 direction-rtl">
                                <h2 className="text-white display-3 mb-3 text-center home_header">{accInfo?.title}</h2>
                                <p className="text-white text-center fs-16">{accInfo?.sub_title}</p>
                            </div>
                            <div className="container direction-rtl">
                                <div className="card mb-3 bg-transparent">
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-4">
                                                <div className="feature-card mx-auto text-center link_url"  onClick={() => showModal("view_pdf_modal",{fileUrl: accInfo.menu_path})}>
                                                    <div className="card mx-auto bg-gray">
                                                        <img src={foodMenuImg} alt="" />
                                                    </div>
                                                    <p className="mb-0">Food Menu</p>
                                                </div>
                                            </div>

                                            <div className="col-4">
                                                <div className="feature-card mx-auto text-center link_url" onClick={() => showModal("view_text_modal", {title: "About Us",text:accInfo?.about_us})}>
                                                    <div className="card mx-auto bg-gray">
                                                        <img src={aboutImg} alt="" />
                                                    </div>
                                                    <p className="mb-0">About us</p>
                                                </div>
                                            </div>

                                            <div className="col-4">
                                                <div className="feature-card mx-auto text-center link_url" onClick={() => newtabURL(accInfo?.g_map_url)}>
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
                                    <h5 className="mb-3">{accInfo?.headline1_text}</h5>
                                    <a className="btn btn-info rounded-pill link_url" onClick={() => showModal("view_text_modal", {title: "Offers",text:accInfo?.offer})}>{accInfo?.headline1_button}</a>
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
                                    <h5 className="mb-3">{`Share Your Voice, Shape Our Future`}</h5>
                                    <a className="btn btn-warning rounded-pill link_url" onClick={() => onStartRecordAudio()}>{`Record Audio Feedback`}</a>
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
                                    <h5 className="mb-3">{accInfo?.headline2_text}</h5>
                                    <a className="btn btn-warning rounded-pill link_url" onClick={() => showModal("view_text_modal", {title: "Offers",text:accInfo?.offer})}>{accInfo?.headline2_button}</a>
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
                            &copy; Powered by <a className={"link_url"} onClick={() => newtabURL("")}>HappyVibes</a>
                        </p>
                    </div>

                </div>
                {showMenu && <div className="offcanvas-backdrop fade show"></div>}
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
                } else if (showAlert && showAlert.show && showAlert.type == "danger") {
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
            {(() => {
                if (modalType && modalType != "" && modalType != null) {

                    if (modalType == "view_text_modal") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData}}
                                formSubmit={null}
                                customClass=""
                                cSize="sm"
                            />
                        );
                    }
                    if (modalType == "record_audio_feedback_modal") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData, permission, recordingStatus, audio,timer: elapsedTime, getMicrophonePermission, startRecording:onStartRecording, stopRecording}}
                                formSubmit={submitFeedack}
                                customClass=""
                                cSize="sm"
                            />
                        );
                    }
                    if (modalType == "view_pdf_modal") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData}}
                                formSubmit={null}
                                customClass=""
                                cSize="md"
                            />
                        );
                    }
                    
                }

            })()}
        </React.Fragment>
    )

}

export default Home