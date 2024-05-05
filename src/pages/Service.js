import React, { useEffect, useRef, useState } from "react"

import demoUser from "../assets/images/users/user-dummy-img.jpg"
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
import { encryptData, getFileName } from "../Helpers/Helper";
import moment from "moment";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const Service = (props) => {

    const [showMenu, setShowMenu] = useState(false)
    const [darkTheme, setDarkTheme] = useState(true)

    const [searchParams, setSearchParams] = useSearchParams();
    const [accInfo, setAccInfo] = useState({});
    const [requestsInfo, setRequestsInfo] = useState([]);
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
    const [view, setView] = useState(1);
    const [viewFile, setViewFile] = useState(false);
    const [fileType, setFileType] = useState(false);
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
            case "reply_service_request_modal":
                if(data != null){
                    setModalData(data)
                }
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
            case "view_documents":
                if(data != null){
                    const {file_path = null} = data;
                    if(file_path){
                        let fullPath = `${file_path}`
                        let filename = getFileName(file_path)
                        let fileExt = filename.split(".")[1]
                        setViewFile(fullPath)
                        setFileType(fileExt)
                        setModalType(modalName);
                        setShowModal(true);
                    }
                }
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

    const onStartRecordAudio = async (type= "feedback",feedbackId) => {
        const result = getMicrophonePermission(type, feedbackId)
    }

    const getMicrophonePermission = async (type = "feedback", feedbackId) => {
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
                    showModal(type == "feedback" ? "record_audio_feedback_modal" : "reply_service_request_modal",{feedbackId})
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
                    mediaStream && mediaStream.getTracks().forEach(track => track.stop());
                    
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

    const submitServiceRequest = async (data = null) => {
        if(data == null ){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `public/submitServiceRequest`
        let method = "POST";

        let formData = new FormData();
        formData.append(`qrc`, qrc)
        formData.append(`member_id`, 0)
        formData.append(`feedback_text`, data.feedback_text)
        formData.append(`file_id`, data.file_id || 0)
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

    const uploadDocs = async (data = null) => {
        if(data == null){
            return false
        }
        setFormSbmt(true)
        let result = false
        const {uploadfiles = [],type=""} = data
        if(uploadfiles.length > 0){
            let payloadUrl = `admin/uploadImages/file`
            let method = "POST"
            let formData = new FormData();
            for (var i = 0; i < uploadfiles.length; i++) {
                // formData.append(`file[${i}]`, uploadfiles[i])
                formData.append(`files`, uploadfiles[i])
            }
            // formData.append(`images`, Array.from(uploadfiles))
            // let formData = {'images[]':uploadfiles}
            const res = await ApiService.fetchData(payloadUrl,method,formData,{formType:"form",fileUpload:true})
            if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
                result = res
            }else{
                
            }
            setFormSbmt(false)
            return result
        }
        
    }

    const onGetServiceRequest = async (uniqId = null) => {
        if(uniqId == null){
            return false
        }
        let payloadUrl = `public/getservice_request/${uniqId}`
        let method = "GET"
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let items = res.results
            for (let item of items) {
                let replies = await onGetServiceReply(item.feedback_id)
                item.replies = replies
            }
            setRequestsInfo(oldVal => ([...items]))
            setView(2)
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
    }

    const onGetServiceReply = async (uniqId = null) => {
        if(uniqId == null){
            return false
        }
        let payloadUrl = `public/getservice_reply/${uniqId}`
        let method = "GET"
        let results = []
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            if(res.results && res.results.length > 0){
                results = res.results
            }
        }
        return results
    }

    const submitReplyServiceRequest = async (data = null) => {
        const {feedbackId = null} = modalData
        if(data == null, feedbackId == null ){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `public/submitServiceRequest`
        let method = "POST";

        let formData = new FormData();
        formData.append(`qrc`, qrc)
        formData.append(`member_id`, 0)
        formData.append(`feedback_text`, data.feedback_text)
        formData.append(`file_id`, data.file_id || 0)
        formData.append(`audioFile`, audioBlob)
        formData.append(`p_feedback_id`, feedbackId)
        formData.append(`is_reply`, true)
            
        const res = await ApiService.fetchData(payloadUrl,method,formData,{formType:"form",fileUpload:true})
        // const res = await ApiService.fetchData(payloadUrl,method, formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            discardMicrophonePermission()
            onGetServiceRequest(qrc)
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message || C_MSG.technical_err })
        }
        setFormSbmt(false)
        return res
    }

    const changeView = (view = null) => {
        if( view == null){
            return false
        }
        if(view ==  1){
            setRequestsInfo([])
        }
        setView(view)
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
                        <div className="card card-bg-img bg-img positio-relative min_h_320 banner_box" style={{backgroundImage:accInfo?.background_img ? `url(${accInfo?.background_img})` : "radial-gradient(black, transparent)"}} >
                            <div className="direction-rtl position-absolute w-100 banner_text_box">
                                <h2 className="text-white display-3 mb-3 text-center home_header fs-30 fw-600">{accInfo?.title}</h2>
                                <p className="text-white text-center fs-18">{accInfo?.sub_title}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3"></div>


                    {view  == 1 &&
                        <React.Fragment>
                            <div className="container">
                                <div className="card card-round">
                                    <div className="card-body d-flex align-items-center direction-rtl">
                                    <div className="card-img-wrap">
                                            <img src={discountImg} alt="" />
                                        </div>
                                        <div className="card-content">
                                            <h5 className="mb-3">{accInfo?.headline1_text}</h5>
                                            <button type="button" className="btn btn-danger w-md waves-effect waves-light rounded-pill" onClick={() => showModal("view_text_modal", {title: "Offers",text:accInfo?.offer})}>{accInfo?.headline1_button}</button>
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
                                            <button type="button" className="btn btn-warning w-md waves-effect waves-light rounded-pill" onClick={() => onStartRecordAudio()}>{accInfo?.headline2_button}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {accInfo?.headline3_text && accInfo?.headline3_button &&
                                <React.Fragment>
                                    <div className="pt-3"></div>

                                    <div className="container">
                                        <div className="card card-round">
                                            <div className="card-body d-flex align-items-center direction-rtl">
                                                <div className="card-img-wrap">
                                                    <img src={starsImg} alt="" />
                                                </div>
                                                <div className="card-content">
                                                    <h5 className="mb-3">{accInfo?.headline3_text}</h5>
                                                    <button type="button" className="btn btn-danger w-md waves-effect waves-light rounded-pill" onClick={() => showModal("view_text_modal", {title: "Offers",text:accInfo?.offer})}>{accInfo?.headline3_button}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            }
                            <div className="pt-3"></div>

                            <div className="container direction-rtl">
                                <div className="card card-round">
                                    <div className="card-body">
                                        <div className="row min_h_100 align-items-center">
                                            <div className="col">
                                                <div className="feature-card mx-auto text-center">
                                                    <button className="btn btn-info w-md waves-effect waves-light rounded-pill" onClick={() => onGetServiceRequest(qrc)}> Check Service Request Status</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    }

                    {view  == 2 &&
                        <React.Fragment>
                            <div className="container">
                                <div className="card">
                                    <div className="card-body p-4">
                                        {/* <h5 className="card-title mb-4">Status</h5> */}
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div><h5 className="">Service Request Status</h5></div>
                                            <div className="">
                                                <a onClick={() => changeView(1)} className="btn btn-warning link_url"><i className="fa fa-long-arrow-left"></i> Go Back</a>
                                            </div>
                                        </div>

                                        <div data-simplebar className="px-3 mx-n3 min_h_320">
                                            {requestsInfo && requestsInfo.length > 0 && React.Children.toArray(requestsInfo.map((info, nIndex) => {
                                                return (
                                                    <React.Fragment>
                                                        <div className="d-flex mb-4">
                                                            <div className="flex-shrink-0">
                                                                <img src={demoUser} alt="" className="avatar-xs rounded-circle" />
                                                            </div>
                                                            <div className="flex-grow-1 ms-3">
                                                                <h5 className="fs-15 text-info">Ticket Number - {info?.ticket_no} <small className="text-muted">{info?.created_on ? moment(info?.created_on).format("MMM DD, YYYY") : ""}</small></h5>
                                                                <div className="d-flex align-items-center mb-3">
                                                                    <p className="mb-0">{info.audio_file_path && <audio id="audio" controls src={info.audio_file_path}></audio>}</p>
                                                                    <p className="ms-3 mb-0 fs-20">
                                                                        {info.file_path && 
                                                                            <span className="link_url" onClick={() => showModal("view_documents", info)}>
                                                                                <OverlayTrigger overlay={<Tooltip id={`tooltip-top`}>View File</Tooltip>} placement={"top"}>
                                                                                    <i className="fa fa-file"></i>
                                                                                </OverlayTrigger>
                                                                            </span>
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <p className="text-muted">{info?.feedback_text}</p>
                                                                <a onClick={() => onStartRecordAudio("reply",info.feedback_id)} className="badge text-muted bg-light link_url"><i className="mdi mdi-reply"></i> Reply</a>
                                                                {info?.replies && info?.replies.length > 0 && React.Children.toArray(info?.replies.map((reply, rIndex) => {
                                                                    return (
                                                                        <React.Fragment>
                                                                            <div className="d-flex mt-4">
                                                                                <div className="flex-shrink-0">
                                                                                    <img src={demoUser} alt="" className="avatar-xs rounded-circle" />
                                                                                </div>
                                                                                <div className="flex-grow-1 ms-3">
                                                                                    <h5 className="fs-15">anonymous User <small className="text-muted">{reply?.created_on ? moment(reply?.created_on).format("MMM DD, YYYY") : ""}</small></h5>
                                                                                    <div className="d-flex align-items-center mb-3">
                                                                                        <p className="mb-0">{reply.audio_file_path && <audio id="audio" controls src={reply.audio_file_path}></audio>}</p>
                                                                                        <p className="ms-3 mb-0 fs-20">
                                                                                            {reply.file_path && 
                                                                                                <span className="link_url" onClick={() => showModal("view_documents", reply)}>
                                                                                                    <OverlayTrigger overlay={<Tooltip id={`tooltip-top`}>View File</Tooltip>} placement={"top"}>
                                                                                                        <i className="fa fa-file"></i>
                                                                                                    </OverlayTrigger>
                                                                                                </span>
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                    <p className="text-muted">{reply?.feedback_text}</p>
                                                                                    <a onClick={() => onStartRecordAudio("reply", info.feedback_id)} className="badge text-muted bg-light link_url"><i className="mdi mdi-reply"></i> Reply</a>
                                                                                </div>
                                                                            </div>
                                                                        </React.Fragment>
                                                                    )
                                                                }))}
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                )
                                            }))}
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    }


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
                                customClass="bottom"
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
                                modalData={{ ...modalData, permission, recordingStatus, audio,timer: elapsedTime, getMicrophonePermission, startRecording:onStartRecording, stopRecording, uploadDocs}}
                                formSubmit={submitServiceRequest}
                                customClass="bottom"
                                cSize="sm"
                            />
                        );
                    }
                    if (modalType == "reply_service_request_modal") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData, permission, recordingStatus, audio,timer: elapsedTime, getMicrophonePermission, startRecording:onStartRecording, stopRecording, uploadDocs}}
                                formSubmit={submitReplyServiceRequest}
                                customClass="bottom"
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
                                customClass="bottom"
                                cSize="md"
                            />
                        );
                    }

                    if (modalType == "view_documents") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData, viewFile, fileType }}
                                formSubmit={null}
                                customClass="bottom"
                                cSize="sm"
                            />
                        );
                    }
                    
                }

            })()}
        </React.Fragment>
    )

}

export default Service