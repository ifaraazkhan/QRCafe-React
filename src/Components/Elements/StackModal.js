import recordImg from "../../assets/images/record.png";
import stopImg from "../../assets/images/stop.png";
import demoUser from "../../assets/images/users/user-dummy-img.jpg"

import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Accordion, Button, Modal, OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
// import Loader from "../components/partials/Loader";
import StackCalender from "./StackCalendar";
import StackSelect from "./StackSelect";
import moment from "moment";
import C_MSG from "../../Helpers/MsgsList";
import { AuthContext } from "../../ContextProvider/AuthContext";
import Loader from "../Partials/Loader";
import { getFileName } from "../../Helpers/Helper";
import Styles from "../../Styles/StackModal.module.css"
import HTMLFlipBook from 'react-pageflip';
import { pdfjs, Document, Page as ReactPdfPage } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const StackModal = (intialData) => {
    const { modalType, formSubmit, show, hideModal, modalData, cSize = "xl", customClass = "", formType = "",mClass } = intialData
    const { projectId = null, user:AuthUser = {} } = useContext(AuthContext)
    const user = AuthUser?.user || {}
    const { user_id } = user;
    const navigate = useNavigate();
    const { register, handleSubmit, watch, setValue, getValues, formState: { errors }, trigger, clearErrors } = useForm();
    const [formRes, setFormRes] = useState({ staus: false, err: false, data: {} })
    const [formSubmitted, setFormSbmt] = useState(false)
    const [modalFormData, setModalFormData] = useState({})
    const [showLoader, setShowLoader] = useState(false)
    const [grpUsers, setGrpUsers] = useState([]);
    const [usrRoles, setusrRoles] = useState([]);
    // file upload states start
    const [uploadfiles, setUploadFiles] = useState(null)
    const [accBgImg, setAccBgImg] = useState(null)
    const [accFiles, setAccFiles] = useState(null)
    const [feedbackFiles, setFeedbackFiles] = useState(null)
    const [msgError, setMsgErr] = useState(null)
    const [uploadErr, setUploadErr] = useState('')
    const [fileUrls, setFileUrls] = useState([]);
    const [checkFileType, setCheckFileType] = useState(true);
    const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
    const [validFileTypes, setValidFileTypes] = useState(process.env.REACT_APP_SUPPORT_UPLOAD_FILE_TYPE.split(","));
    const [validImgFileTypes, setValidImgFileTypes] = useState(process.env.REACT_APP_SUPPORT_IMG_FILE_TYPE.split(","));
    const [validPdfFileTypes, setValidPdfFileTypes] = useState(process.env.REACT_APP_SUPPORT_PDF_FILE_TYPE.split(","));
    // file upload states end
    



    const form = watch()
    const chatScroller = useRef();
    

    useEffect(() => {

        if (modalType == "create_group_modal") {
            setShowLoader(false);
            setGrpUsers([])
            register("groupForm.users", { required: true })
        }
        if (modalType == "update_group_modal") {
            setShowLoader(false)
            register("groupForm.users", { required: true })
            if(modalData && modalData.group && modalData.group.users && modalData.group.users.length > 0){
                let selUserArr = modalData.group.users.map((item,index) => ({value: item.user_id,label:`${item.first_name} ${item.last_name}`}))
                setGrpUsers(selUserArr)
                setValue("groupForm.users",selUserArr)
            }
        }

        if (modalType == "create_user_modal") {
            setShowLoader(false)
            setusrRoles([])
        }
        if (modalType == "update_user_modal") {
            setShowLoader(false)
        }

        if (modalType == "create_account_modal") {
            setShowLoader(false);
            register("accountForm.bg_image_id", { required: true, })
            register("accountForm.file_id", { required: true,  })
        }
        if (modalType == "update_account_modal") {
            setShowLoader(false);
            if(modalData?.account?.background_img){
                setAccBgImg([modalData?.account?.background_img])
            }
            if(modalData?.account?.menu_path){
                setAccFiles([modalData?.account?.menu_path])
            }
            // register("accountForm.bg_image_id", { required: false, })
            // register("accountForm.file_id", { required: false,  })
        }
        if (modalType == "show_visit_modal") {
            setShowLoader(false)
        }
        if (modalType == "update_bill_credit") {
            setShowLoader(false)
        }
        
    }, []);


    const scrollToBottom = (el) => {
        el.scrollTop = el.scrollHeight;
    }

    const handleModalClose = (data = null) => {
        hideModal(data)
    };

    
    const addGrpUser = (val) => {
        let field = "";
        switch (modalType) {
            case "create_group_modal":
                field = "groupForm.users"
            break;
            case "update_group_modal":
                field = "groupForm.users"
            break;
        }
        if(field){
            setGrpUsers(val)
            if (Array.isArray(val)) {
                setValue(field, val, { shouldValidate: true })
            } else {
                setValue(field, val, { shouldValidate: true })
            }
        }
    }

    const addUsrRole = (val) => {
        let field = "";
        switch (modalType) {
            case "create_user_modal":
                field = "userForm.roles"
            break;
            case "update_user_modal":
                field = "userForm.roles"
            break;
            case "update_request_modal":
                field = "requestForm.roles"
            break;
        }
        if(field){
            setusrRoles(val)
            if (Array.isArray(val)) {
                setValue(field, val, { shouldValidate: true })
            } else {
                setValue(field, val, { shouldValidate: true })
            }
        }
    }

    /* File upload function start */
    const onFileChange = async (event = null,type = "") => {
        setMsgErr(null)
        setUploadErr('')
        if (event == null) {
            return false
        }
        let files = event.target.files
        let filesArray = Array.from(files) || [];
        const setFileState = type == "acc_bg_img" ? setAccBgImg : (type == "acc_files" ? setAccFiles : (type == "feedback_file" ? setFeedbackFiles : setUploadFiles))
        const uploadFn = type == "acc_bg_img" ? onUploadDocuments : (type == "acc_files" ? onUploadDocuments : (type == "feedback_file" ? onUploadDocuments : onUploadDocuments))
        const uploadtype = type == "acc_bg_img" ? "background" : (type == "acc_files" ? "menu" : (type == "feedback_file" ? "feedback_file" : "files"))
        const formField = type == "acc_bg_img" ? "accountForm.bg_image_id" : (type == "acc_files" ? "accountForm.file_id" : (type == "feedback_file" ? "feedbackForm.file_id" : ""))
        if (checkFileType) {
            if (checkFileTypeValidation(filesArray, uploadtype)) {
                const uploadRes = await uploadFn(filesArray, uploadtype)
                console.log(uploadRes);
                if(uploadRes){
                    setFileState(filesArray)
                    if(formField){
                        setValue(formField,uploadRes)
                    }
                }
                
            }
        } else {
            setFileState(filesArray)
        }
    }

    const checkFileTypeValidation = (filesArray = [], type = null) => {
        if (!filesArray.length || type == null) {
            return false;
        }
        if (!checkFileType) {
            return true;
        }
        let validExt = Object.assign([], type == "background" ? validImgFileTypes : (type == "menu" ? validPdfFileTypes : (type == "feedback_file" ? validFileTypes : validFileTypes)))
        for (let i = 0; i < filesArray.length; i++) {
            let fileName = filesArray[i]["name"];
            let ext = fileName.split('.').pop();
            if (!validExt.includes(ext)) {
                setMsgErr({type: type,message:C_MSG.select_valid_file_format})
                return false;
            }
        }
        return true;
    }

    const getFileUrl = (file = null) => {
        if (file == null) {
            return null
        }

        let fileObjUrl = URL.createObjectURL(file)
        if (fileObjUrl) {
            let tempFileUrls = Object.assign([], fileUrls)
            let obj = {
                url: fileObjUrl,
                details: file
            }
            tempFileUrls.push(obj)
        }

        return fileObjUrl
    }

    const isImg = (file = null) => {
        if (file == null) {
            return false
        }
        let fileType = (file.type).substr((file.type).lastIndexOf('/') + 1)
        if (fileType == 'jpeg' || fileType == 'jpg' || fileType == 'png' || fileType == 'webp' || fileType == 'svg' || fileType == 'gif') {
            return true
        } else {
            return false
        }

    }

    const removeUploadFile = async (fileIndex = null, type = "") => {
        if (fileIndex == null) {
            return false
        }
        const setFileState = type == "acc_bg_img" ? setAccBgImg : (type == "acc_files" ? setAccFiles : (type == "feedback_file" ? setFeedbackFiles : setUploadFiles))
        const fileState = type == "acc_bg_img" ? accBgImg : (type == "acc_files" ? accFiles : (type == "feedback_file" ? feedbackFiles : uploadfiles))
        let files = fileState;
        files.splice(fileIndex, 1)
        setFileState(oldVal => {
            return [...files]
        })
    }

    const onUploadDocuments = async (files = null, type) => {
        setFileUploadSuccess(false)
        setMsgErr(null)
        setUploadErr('')
        // setShowLoader(true)
        setShowLoader({status:true, type})
        if (files == '' || files == null || files == undefined || files.length == 0) {
            setMsgErr({type, message:C_MSG.file_required});
            setShowLoader(false)
            return false
        }
        if (files.length > 0) {
            let result = false
            let obj = { uploadfiles:files, type }
            const apiFn = type == "acc_bg_img" ? modalData.uploadAccDocs : (type == "acc_files" ? modalData.uploadAccDocs : (type == "feedback_file" ? modalData.uploadDocs : modalData.uploadAccDocs))
            let res = await apiFn(obj)
            if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                // setValue("expenseForm.image_ids",res.image_ids)
                result = res.image_ids.length ? res.image_ids[0] : false
                setFileUploadSuccess({status:true, type})
                setTimeout(() => {
                    setFileUploadSuccess(false)
                }, 3000);
            } else {
                setMsgErr({type, message:C_MSG.technical_err});
            }
            setShowLoader(false)
            return result
        }
    }
    /* File upload function end */
   

    const onChangeDate = (startDate = null, endDate = null, obj = null) => {
        if (modalType == 'create_user_modal' || modalType == "update_user_modal") {
            setValue('userForm.start_date', startDate, { shouldValidate: true })
        }
        if (modalType == 'add_expense_modal' || modalType == "update_expense_modal") {
            setValue('expenseForm.date_expensed', startDate, { shouldValidate: true })
        }
        if (modalType == 'process_expense_modal') {
            setValue('processExpenseForm.clearance_date', startDate, { shouldValidate: true })
        }
        if (modalType == 'add_invoice_modal' || modalType == "update_invoice_modal") {
            if(obj.type == "invoice_date"){
                setValue('invoiceForm.invoice_date', startDate, { shouldValidate: true })
            } else if(obj.type == "received_date"){
                setValue('invoiceForm.received_date', startDate, { shouldValidate: true })
            }
            
        }
    }

    const onSubmit = async (data = {},type = "submit") => {
        let stat = { status: false, err: false, data: {} }
        setFormRes(stat)
        
        
        if (modalType == 'create_category_modal') {
            if (data && data.categoryForm && Object.keys(data.categoryForm).length > 0) {
                let form = data.categoryForm
                let formData = {
                    category_name: form.name,
                }
                setFormSbmt(true)
                const res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_category_modal') {
            if (data && data.categoryForm && Object.keys(data.categoryForm).length > 0) {
                let form = data.categoryForm
                let formData = {
                    catId: modalData && modalData?.category?.category_id ? modalData?.category?.category_id : "",
                    category_name: form.name,
                }
                setFormSbmt(true)
                const res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'create_role_modal') {
            if (data && data.roleForm && Object.keys(data.roleForm).length > 0) {
                let form = data.roleForm
                let formData = {
                    name: form.name,
                    description: form.description
                }
                setFormSbmt(true)
                const res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_role_modal') {
            if (data && data.roleForm && Object.keys(data.roleForm).length > 0) {
                let form = data.roleForm
                let formData = {
                    project_id: modalData && modalData?.project?.project_id ? modalData?.project?.project_id : "",
                    name: form.name,
                    description: form.description
                }
                setFormSbmt(true)
                const res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        
        if (modalType == 'create_user_modal') {
            if (data && data.userForm && Object.keys(data.userForm).length > 0) {
                let form = data.userForm
                let formData = {
                    username: form.username,   
                    first_name: form.first_name,   
                    last_name: form.last_name,   
                    email: form.email,
                    password: form.password,     
                    phone: form.phone,     
                    address: form.address,
                    account_type_id: 1
                }
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_user_modal') {
            if (data && data.userForm && Object.keys(data.userForm).length > 0) {
                let form = data.userForm
                let formData = {
                    user_id: modalData && modalData?.user?.user_id ? modalData?.user?.user_id : "",
                    username: form.username,
                    first_name: form.first_name,   
                    last_name: form.last_name,   
                    email: form.email,
                    password: form.password,     
                    phone: form.phone,     
                    address: form.address,
                    account_type_id: 1,
                     
                }
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'create_account_modal') {
            if (data && data.accountForm && Object.keys(data.accountForm).length > 0) {
                let formData = data.accountForm
                formData.user_id = Number(formData.user_id)
                formData.category_id = Number(formData.category_id)
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_account_modal') {
            if (data && data.accountForm && Object.keys(data.accountForm).length > 0) {
                let formData = data.accountForm
                formData.user_id = Number(formData.user_id)
                formData.category_id = Number(formData.category_id)
                formData.account_id = Number(modalData?.account.account_id)
                
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'record_audio_feedback_modal') {
            if (data && data.feedbackForm && Object.keys(data.feedbackForm).length > 0) {
                let formData = data.feedbackForm
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'reply_service_request_modal') {
            if (data && data.feedbackForm && Object.keys(data.feedbackForm).length > 0) {
                let formData = data.feedbackForm
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'admin_service_chat_modal') {
            if (data && data.feedbackForm && Object.keys(data.feedbackForm).length > 0) {
                let formData = data.feedbackForm
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    // handleModalClose()
                    modalData.changeView(1)
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_bill_credit') {
            if (data && data.accountForm && Object.keys(data.accountForm).length > 0) {
                let formData = data.accountForm
                formData.bill_number = (formData.bill_number)
                formData.bill_amount = Number(formData.bill_amount)
                formData.member_id = modalData.data.memberID
                formData.user_id = modalData.data.userID
                formData.account_id = modalData.data.accountId
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        
        return false
    }

    const _ = (el) => {
        return document.getElementById(el);
    }

    

   
    if (modalType == 'view_documents') {
        return (
            <>

                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>
                    <Modal.Header closeButton className="py-2 bg_15 d-flex align-items-center text-white">
                        {/* <Modal.Title className="fs-12">Image Viewer</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <section className="view_document_section my-sm-5 my-lg-0">
                                <div className="container">
                                    <div className="row py-5 justify-content-center">
                                        <div className="col-12 col-md-12">
                                            <div className={`view_doc_container h-100 text-center`}>
                                                {(() => {
                                                    if (modalData.viewFile && modalData.viewFile != '') {
                                                        if (modalData.fileType && modalData.fileType != '') {
                                                            if (modalData.fileType == 'pdf') {
                                                                return <object data={modalData.viewFile} className="w-100 img-fluid h-100"></object>
                                                            } else if (modalData.fileType == 'jpeg' || modalData.fileType == 'jpg' || modalData.fileType == 'png' || modalData.fileType == 'webp' || modalData.fileType == 'svg' || modalData.fileType == 'gif') {
                                                                return <img src={modalData.viewFile} className="img-fluid" />
                                                            }
                                                        }
                                                    } else {
                                                        return <Loader showLoader={true} pos={'absolute'} />
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'view_text_modal') {
        return (
            <>

                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>
                    <Modal.Header closeButton className="py-2 bg_15 d-flex align-items-center text-white">
                        {/* <Modal.Title className="fs-12">{modalData?.title}</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <section className="view_document_section my-sm-5 my-lg-0">
                                <div className="container">
                                    <div className="row pb-5 justify-content-center">
                                        <div className="col-12 col-md-12">
                                            <div className="text_section">
                                                {/* <h2 className="fs20">{modalData?.title}</h2> */}
                                                <p>{modalData?.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'view_pdf_modal') {
        // const width = window.innerWidth - 50;
        // const height = window.innerHeight - 50;

        // const Page = React.forwardRef(({ pageNumber }, ref) => {
        // return (
        //     <div ref={ref}>
        //     <ReactPdfPage pageNumber={pageNumber} width={width} />
        //     </div>
        // );
        // });
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>
                    <Modal.Header closeButton className="py-2 bg_15 d-flex align-items-center text-white">
                        {/* <Modal.Title className="fs-12">{`Pdf Viewer`}</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="">
                            <section className="view_pdf_section my-sm-5 my-lg-0">
                                <div className="">
                                    <div className="row justify-content-center">
                                        <div className="col-12 col-md-12 p-0">
                                            <div className="text_section">
                                                <React.Fragment>
                                                    <div className="pdf_section h720 min_h_320 max_h_480">
                                                        <iframe src={`https://docs.google.com/viewer?url=${modalData.file}&embedded=true`} className="w-100 img-fluid h-100">
                                                            <div className="text-center">
                                                                <a className="btn btn-secondary waves-effect waves-light" href={modalData.file}>Open Menu</a>
                                                            </div>
                                                        </iframe>
                                                    </div>

                                                </React.Fragment>
                                                
                                                {/* <Document file={modalData?.file}>
                                                    <HTMLFlipBook width={width} height={height}>
                                                        <Page pageNumber={1} />
                                                        <Page pageNumber={2} />
                                                        <Page pageNumber={3} />
                                                    </HTMLFlipBook>
                                                </Document> */}
                                                {/* <object data={modalData.file} className="w-100 img-fluid h-100">
                                                    <a href={modalData.file}>test.pdf</a>
                                                </object> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    if (modalType == 'record_audio_feedback_modal') {

        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>
                    <Modal.Header closeButton className="py-2 bg_15 d-flex align-items-center text-white">
                        {/* <Modal.Title className="fs-12">{`Record Audio Feedback`}</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <section className="view_document_section my-sm-5 my-lg-0">
                                <div className="container">
                                    <div className="row justify-content-center">
                                        <div className="col-12 col-md-12">
                                            <div id={Styles.audio_recorder_section} className="text_section">
                                                <div className={Styles.app}>
                                                {modalData?.recordingStatus == "recording" &&
                                                    <React.Fragment>
                                                        <div className="timer_sec fs-20 fw-600 mb-4 d-block">
                                                            <span className="">{modalData?.timer?.min || "00"} : {modalData?.timer?.sec || "00"}</span>
                                                        </div>
                                                    </React.Fragment>
                                                }
                                                    <div className={Styles.audio_controls}>
                                                        {modalData?.permission &&
                                                            <React.Fragment>
                                                                {/* {modalData?.recordingStatus == "recording" && <div className="w40 d-inline-block"><img src={recordingImg}  className="img-fluid" /></div>} */}
                                                                
                                                                {modalData?.recordingStatus == "recording" &&
                                                                    <React.Fragment>
                                                                        <div className="recorder-container">
                                                                            <div className="outer"></div>
                                                                            <div className="outer-2"></div>
                                                                            <div className="icon-microphone"><img src={recordImg}  className="img-fluid" /></div>
                                                                        </div>
                                                                    </React.Fragment>
                                                                }
                                                                {modalData?.recordingStatus == "inactive" && 
                                                                    <button id="record" onClick={() => modalData?.startRecording() } disabled={modalData?.recordingStatus == "recording" ? true : false}>
                                                                        <span className="w85 d-inline-block"><img src={recordImg}  className="img-fluid" /></span>
                                                                        {/* <span className="d-block fs-20 fw-400 mt-2">Record your Audio Feedback</span> */}
                                                                        {(modalData?.permission && modalData?.audio)?<span className="d-block fs-20 fw-400 mt-2">Re-Record your Audio Feedback</span>
                                                                        : <span className="d-block fs-20 fw-400 mt-2">Record your Audio Feedback</span>}
                                                                    </button>
                                                                }
                                                                {modalData?.recordingStatus == "recording" && <button id="stop" className="ms-3" onClick={() => modalData?.stopRecording() } disabled={modalData?.recordingStatus == "inactive" ? true : false}><span className="w60 d-inline-block"><img src={stopImg}  className="img-fluid" /></span></button>}
                                                                {/* <audio id="audio" controls src={modalData?.audio}></audio> */}
                                                            </React.Fragment>
                                                        }
                                                    </div>
                                                    {/* {modalData?.recordingStatus == "recording" && <div className="w40"><img src={recordingImg}  className="img-fluid" /></div>} */}
                                                </div>
                                               
                                            </div>
                                            <div className="form">
                                                {modalData?.permission && modalData?.audio &&

                                                    <React.Fragment>
                                                         <hr/>
                                                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                                                            <div className="row align-items-start m-0 text-start">
                                                                <div className="col-sm-12 mb-3">
                                                                    
                                                                    <label htmlFor="customername-field" className="form-label fs-16">Your recorded feedback</label>
                                                                    <audio className="d-block" id="audio" controls src={modalData?.audio}></audio>
                                                                </div>
                                                                {/* New fields for FullName, Mobile, and Email */}
          <div className="col-sm-6 mb-3">
            <label htmlFor="fullname-field" className="form-label fs-16">Full Name (optional)</label>
            <input
              type="text"
              className="form-control"
              id="fullname-field"
              placeholder="Enter your full name"
              {...register("feedbackForm.fullName")}
            />
          </div>
          
          <div className="col-sm-6 mb-3">
            <label htmlFor="mobile-field" className="form-label fs-16">Mobile (optional)</label>
            <input
              type="tel"
              className="form-control"
              id="mobile-field"
              placeholder="Enter your mobile number"
              {...register("feedbackForm.mobile")}
            />
          </div>
          
          <div className="col-sm-12 mb-3">
            <label htmlFor="email-field" className="form-label fs-16">Email (optional)</label>
            <input
              type="email"
              className="form-control"
              id="email-field"
              placeholder="Enter your email address"
              {...register("feedbackForm.email")}
            />
          </div>
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label className="fs-16"><i className="fa fa-attachment"></i><span>Add an image (optional)</span></label>
                                                                        <div className="container-fluid h-100 col-sm-12 ml-0 px-0">
                                                                            <div id="form_file_upload_modal" className="h-100 position-relative">
                                                                                {showLoader && showLoader.type == "feedback_file" && <Loader heightClass="h-100" showLoader={showLoader.status}></Loader>}
                                                                                {(() => {
                                                                                    if (feedbackFiles == null || feedbackFiles.length < 1) {
                                                                                        return (
                                                                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                                                <input
                                                                                                    className="fileUploadInp"
                                                                                                    type="file"
                                                                                                    name="file"
                                                                                                    accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp,.msg,.eml,.zip,.ppt"
                                                                                                    onChange={(e) => onFileChange(e, "feedback_file")}
                                                                                                    id="file"
                                                                                                    data-multiple-caption="{count} files selected"
                                                                                                    multiple={false}
                                                                                                />
                                                                                                <i className="fa fa-camera" aria-hidden="true"></i>
                                                                                                <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or use camera </span>.</label>
                                                                                                <label htmlFor="file"><strong></strong></label>
                                                                                                {msgError && msgError.type == "feedback_file" && <p className="text-danger p-2">{msgError.message}</p>}
                                                                                            </div>
                                                                                        )

                                                                                    } else {
                                                                                        return (
                                                                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-50">
                                                                                                <div className="uploadsList my-2 text-center">
                                                                                                    {feedbackFiles && feedbackFiles.length > 0 && feedbackFiles.map((file, fIndex) => {
                                                                                                        return (
                                                                                                            <div key={fIndex} className="file_card position-relative">
                                                                                                                {getFileName(file)}
                                                                                                                <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex, "feedback_file")}><i className="fa fa-times"></i></span>
                                                                                                            </div>
                                                                                                        )
                                                                                                    })}
                                                                                                </div>
                                                                                                <div className="taskDetails_btn_block px-3">
                                                                                                    <div className="card_button_block ">
                                                                                                        {/* <Button className="btn_2 btn_wide " variant="outline-dark" onClick={() => onUploadDocuments()}>Upload</Button> */}
                                                                                                        {fileUploadSuccess && fileUploadSuccess.status == true && fileUploadSuccess.type == "feedback_file" && <span className="text-success">{C_MSG.file_upload_success}</span>}
                                                                                                    </div>
                                                                                                </div>

                                                                                            </div>
                                                                                        )

                                                                                    }
                                                                                })()}
                                                                            </div>
                                                                            {/* {errors.feedbackForm?.feedback_file && errors.feedbackForm?.file.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>} */}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-12 mb-3">
                                                                    <label htmlFor="customername-field" className="form-label fs-16">Any additional thoughts? (optional)</label>
                                                                    <textarea rows={5} className="form-control" placeholder="put your thoughts here.." {...register("feedbackForm.feedback_text")}></textarea>
                                                                    {/* {errors && errors.categoryForm && errors.categoryForm?.feedback_text && errors.categoryForm.feedback_text?.type == "required" && <div className="field_err text-danger">{C_MSG.field_required}</div>} */}
                                                                </div>
                                                            </div>
                                                            <hr />
                                                            <div className="d-flex align-items-center justify-content-end px-3">
                                                                <div className="">
                                                                    <button className="btn btn-outline-secondary waves-effect waves-light" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                                                </div>
                                                                <div className="ms-3">
                                                                    <button className="btn btn-primary waves-effect waves-light fs-18" type="submit" disabled={formSubmitted}>Send feedback</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </React.Fragment>

                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'create_group_modal' || modalType == "update_group_modal") {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>

                    <Modal.Header closeButton className="bg-light p-3 ">
                        {/* <Modal.Title className="fs-12">{modalType == "update_group_modal" ? "Update" : "New"} Group</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="customername-field" className="form-label">Group Name</label>
                                    <input type="text" className="form-control" placeholder="Enter Name" {...register("groupForm.name", { required: true })} defaultValue={modalData && modalData?.group?.group_name ? modalData?.group?.group_name : ""} />
                                    {errors && errors.groupForm && errors.groupForm?.name && errors.groupForm.name?.type == "required" && <div className="field_err text-danger">{C_MSG.group_name_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="customername-field" className="form-label">Group Users</label>
                                        <StackSelect cClass={'group_select_box'}
                                            cClassPrefix={'group_select'}
                                            hideOptionOnSelect={false}
                                            closeOnSelect={true}
                                            selectType="custom2"
                                            changeFn={addGrpUser}
                                            createFn={null}
                                            creatablePosition="first"
                                            selectOptions={modalData && modalData.users && modalData.users.length > 0 && modalData.users.map((item) => ({ value: item.user_id, label: item.fullname }))}
                                            selected={[]}
                                            selectedValue={grpUsers}
                                            selectPlaceholder='Select User'
                                            multi={true} />
                                        {errors.groupForm?.users && errors.groupForm?.users.type == "required" && <div className="field_err text-danger"><div>{C_MSG.user_select_required}</div></div>}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ms-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_group_modal" ? "Update" : "Create"}</button>
                                </div>
                            </div>

                            <div className="col-sm-12">
                                {(() => {
                                    if (formRes.err && formRes.data.err) {
                                        return (
                                            <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                        )
                                    }
                                })()}
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
    if (modalType == 'create_category_modal' || modalType == "update_category_modal") {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>

                    <Modal.Header closeButton className="bg-light p-3 ">
                        {/* <Modal.Title className="fs-12">{modalType == "update_category_modal" ? "Update" : "New"} Category</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="customername-field" className="form-label">Category Name</label>
                                    <input type="text" className="form-control" placeholder="Enter Name" {...register("categoryForm.name", { required: true })} defaultValue={modalData && modalData?.category?.category_name ? modalData?.category?.category_name : ""} />
                                    {errors && errors.categoryForm && errors.categoryForm?.name && errors.categoryForm.name?.type == "required" && <div className="field_err text-danger">{C_MSG.category_name_required}</div>}
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ms-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_category_modal" ? "Update" : "Create"}</button>
                                </div>
                            </div>

                            <div className="col-sm-12">
                                {(() => {
                                    if (formRes.err && formRes.data.err) {
                                        return (
                                            <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                        )
                                    }
                                })()}
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    
    if (modalType == 'create_user_modal' || modalType == "update_user_modal") {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>

                    <Modal.Header closeButton className="bg-light p-3">
                        {/* <Modal.Title className="fs-12">{modalType == "update_user_modal" ? "Update User Info" : "Add a User"}</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Username" className="form-control" {...register("userForm.username", { required: true })} autoComplete="off" defaultValue={modalData && modalData.user?.username ? modalData.user?.username : ""} />
                                        {errors.userForm?.username && errors.userForm?.username.type == "required" && <div className="field_err text-danger"><div>{C_MSG.fname_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="First Name" className="form-control" {...register("userForm.first_name", { required: true })} autoComplete="off" defaultValue={modalData && modalData.user?.first_name ? modalData.user?.first_name : ""} />
                                        {errors.userForm?.first_name && errors.userForm?.first_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.fname_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Last Name" className="form-control" {...register("userForm.last_name", { required: true })} autoComplete="off" defaultValue={modalData && modalData.user?.last_name ? modalData.user?.last_name : ""} />
                                        {errors.userForm?.last_name && errors.userForm?.last_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.lname_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Email" className="form-control" {...register("userForm.email", { required: true })} autoComplete="off" defaultValue={modalData && modalData.user?.email ? modalData.user?.email : ""} />
                                        {errors.userForm?.email && errors.userForm?.email.type == "required" && <div className="field_err text-danger"><div>{C_MSG.email_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="password" placeholder="Password" className="form-control" {...register("userForm.password", { required: true })} autoComplete="off" defaultValue={modalData && modalData.user?.password ? modalData.user?.password : ""} />
                                        {errors.userForm?.password && errors.userForm?.password.type == "required" && <div className="field_err text-danger"><div>{C_MSG.pass_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Phone" className="form-control" {...register("userForm.phone", { required: true })} autoComplete="off" defaultValue={modalData && modalData.user?.phone ? modalData.user?.phone : ""} />
                                        {errors.userForm?.phone && errors.userForm?.phone.type == "required" && <div className="field_err text-danger"><div>{C_MSG.ph_number_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-12">
                                    <div className="form-group">
                                        <input type="text" placeholder="address" className="form-control" {...register("userForm.address", { required: true })} autoComplete="off" defaultValue={modalData && modalData.user?.address ? modalData.user?.address : ""} />
                                        {errors.userForm?.address && errors.userForm?.address.type == "required" && <div className="field_err text-danger"><div>{C_MSG.addr_required}</div></div>}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ms-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_user_modal" ? "Update" : "Create"}</button>
                                </div>
                            </div>

                            <div className="col-sm-12">
                                {(() => {
                                    if (formRes.err && formRes.data.err) {
                                        return (
                                            <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                        )
                                    }
                                })()}
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    if (modalType == 'create_account_modal' || modalType == "update_account_modal") {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>

                    <Modal.Header closeButton className="bg-light p-3">
                        {/* <Modal.Title className="fs-12">{modalType == "update_account_modal" ? "Update Account Info" : "Add Account"}</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12">
                                    <div className="form-group">
                                        <select disabled className="form-control fw-600" {...register("accountForm.user_id", { required: true })} defaultValue={modalData && modalData.account?.user_id ? modalData.account?.user_id : ""}>
                                            <option value={''}>Select User</option>
                                            {modalData?.users && modalData?.users.length > 0 && React.Children.toArray(modalData?.users.map((item, uKey) => {
                                                return <option value={item.user_id}>{item.username} ({item.email})</option>
                                            }))}
                                        </select>
                                        {errors.accountForm?.user_id && errors.accountForm?.user_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <div className="form-group">
                                        <select className="form-control fw-600" {...register("accountForm.category_id", { required: true })} defaultValue={modalData && modalData.account?.category_id ? modalData.account?.category_id : ""}>
                                            <option value={''}>Select Category</option>
                                            {modalData?.cats && modalData?.cats.length > 0 && React.Children.toArray(modalData?.cats.map((item, uKey) => {
                                                return <option value={item.category_id}>{item.category_name}</option>
                                            }))}
                                        </select>
                                        {errors.accountForm?.category_id && errors.accountForm?.category_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <div className="form-group">
                                        <input type="text" placeholder="Title" className="form-control" {...register("accountForm.title", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.title ? modalData.account?.title : ""} />
                                        {errors.accountForm?.title && errors.accountForm?.title.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                
                                <div className="col-sm-12">
                                    <div className="form-group">
                                        <input type="text" placeholder="Subtitle" className="form-control" {...register("accountForm.sub_title", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.sub_title ? modalData.account?.sub_title : ""} />
                                        {errors.accountForm?.sub_title && errors.accountForm?.sub_title.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12">
                                    <div className="form-group">
                                        {/* <input type="text" placeholder="About Us" className="form-control" {...register("accountForm.about_us", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.about_us ? modalData.account?.about_us : ""} /> */}
                                        <textarea rows={5} placeholder="About Us" className="form-control" {...register("accountForm.about_us", { required: true })}  defaultValue={modalData && modalData.account?.about_us ? modalData.account?.about_us : ""}></textarea>
                                        {errors.accountForm?.about_us && errors.accountForm?.about_us.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 1" className="form-control" {...register("accountForm.headline1_text", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.headline1_text ? modalData.account?.headline1_text : ""} />
                                        {errors.accountForm?.headline1_text && errors.accountForm?.headline1_text.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 1 Button" className="form-control" {...register("accountForm.headline1_button", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.headline1_button ? modalData.account?.headline1_button : ""} />
                                        {errors.accountForm?.headline1_button && errors.accountForm?.headline1_button.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 2" className="form-control" {...register("accountForm.headline2_text", { required: false })} autoComplete="off" defaultValue={modalData && modalData.account?.headline2_text ? modalData.account?.headline2_text : ""} />
                                        {errors.accountForm?.headline2_text && errors.accountForm?.headline2_text.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 2 Button" value="Provide Your Feedback" disabled className="form-control" {...register("accountForm.headline2_button", { required: false })} autoComplete="off" defaultValue={modalData && modalData.account?.headline2_button ? modalData.account?.headline2_button : ""} />
                                        {errors.accountForm?.headline2_button && errors.accountForm?.headline2_button.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 2" className="form-control" {...register("accountForm.headline3_text", { required: false })} autoComplete="off" defaultValue={modalData && modalData.account?.headline3_text ? modalData.account?.headline3_text : ""} />
                                        {errors.accountForm?.headline3_text && errors.accountForm?.headline3_text.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 3 Button" className="form-control" {...register("accountForm.headline3_button", { required: false })} autoComplete="off" defaultValue={modalData && modalData.account?.headline3_button ? modalData.account?.headline3_button : ""} />
                                        {errors.accountForm?.headline3_button && errors.accountForm?.headline3_button.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Google Map Url" className="form-control" {...register("accountForm.g_map_url", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.g_map_url ? modalData.account?.g_map_url : ""} />
                                        {errors.accountForm?.g_map_url && errors.accountForm?.g_map_url.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Offer" className="form-control" {...register("accountForm.offer", { required: false })} autoComplete="off" defaultValue={modalData && modalData.account?.offer ? modalData.account?.offer : ""} />
                                        {errors.accountForm?.offer && errors.accountForm?.offer.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Facebook Url" className="form-control" {...register("accountForm.fb_url", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.fb_url ? modalData.account?.fb_url : ""} />
                                        {errors.accountForm?.fb_url && errors.accountForm?.fb_url.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Linkedin Url" className="form-control" {...register("accountForm.linkedin_url", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.linkedin_url ? modalData.account?.linkedin_url : ""} />
                                        {errors.accountForm?.linkedin_url && errors.accountForm?.linkedin_url.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Twitter Url" className="form-control" {...register("accountForm.twitter_url", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.twitter_url ? modalData.account?.twitter_url : ""} />
                                        {errors.accountForm?.twitter_url && errors.accountForm?.twitter_url.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Youtube Url" className="form-control" {...register("accountForm.youtube_url", { required: false })} autoComplete="off" defaultValue={modalData && modalData.account?.youtube_url ? modalData.account?.youtube_url : ""} />
                                        {errors.accountForm?.youtube_url && errors.accountForm?.youtube_url.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Instagram Url" className="form-control" {...register("accountForm.instagram_url", { required: false })} autoComplete="off" defaultValue={modalData && modalData.account?.instagram_url ? modalData.account?.instagram_url : ""} />
                                        {errors.accountForm?.instagram_url && errors.accountForm?.instagram_url.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>


                                <div className="col-sm-12">
                                    <div className="form-group">
                                        <label><i className="fa fa-attachment"></i><span>Background Image</span></label>
                                        <div className="container-fluid h-100 col-sm-12 ml-0 px-0">
                                            <div id="form_file_upload_modal" className="h-100 position-relative">
                                                {showLoader && showLoader.type == "background" && <Loader heightClass="h-100" showLoader={showLoader.status}></Loader>}
                                                {(() => {
                                                    if (accBgImg == null || accBgImg.length < 1) {
                                                        return (
                                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                <input
                                                                    className="fileUploadInp"
                                                                    type="file"
                                                                    name="file"
                                                                    accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp,.msg,.eml,.zip,.ppt"
                                                                    onChange={(e) => onFileChange(e, "acc_bg_img")}
                                                                    id="file"
                                                                    data-multiple-caption="{count} files selected"
                                                                    multiple={false}
                                                                />
                                                                <i className="fa fa-upload" aria-hidden="true"></i>
                                                                <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                                <label htmlFor="file"><strong>({C_MSG.supported_img_format})</strong></label>
                                                                {msgError && msgError.type == "background" && <p className="text-danger p-2">{msgError.message}</p>}
                                                            </div>
                                                        )

                                                    } else {
                                                        return (
                                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                <div className="uploadsList my-2 text-center">
                                                                    {accBgImg && accBgImg.length > 0 && accBgImg.map((file, fIndex) => {
                                                                        return (
                                                                            <div key={fIndex} className="file_card position-relative">
                                                                                {getFileName(file)}
                                                                                <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex, "acc_bg_img")}><i className="fa fa-times"></i></span>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                                <div className="taskDetails_btn_block px-3">
                                                                    <div className="card_button_block ">
                                                                        {/* <Button className="btn_2 btn_wide " variant="outline-dark" onClick={() => onUploadDocuments()}>Upload</Button> */}
                                                                        {fileUploadSuccess && fileUploadSuccess.status == true && fileUploadSuccess.type == "background"  && <span className="text-success">{C_MSG.file_upload_success}</span>}
                                                                    </div>
                                                                </div>
                                                                
                                                            </div>
                                                        )

                                                    }
                                                })()}
                                            </div>
                                            {errors.accountForm?.bg_image_id && errors.accountForm?.bg_image_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-12">
                                    <div className="form-group">
                                        <label><i className="fa fa-attachment"></i><span>File</span></label>
                                        <div className="container-fluid h-100 col-sm-12 ml-0 px-0">
                                            <div id="form_file_upload_modal" className="h-100 position-relative">
                                                {showLoader && showLoader.type == "menu" && <Loader heightClass="h-100" showLoader={showLoader.status}></Loader>}
                                                {(() => {
                                                    if (accFiles == null || accFiles.length < 1) {
                                                        return (
                                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                <input
                                                                    className="fileUploadInp"
                                                                    type="file"
                                                                    name="file"
                                                                    accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp,.msg,.eml,.zip,.ppt"
                                                                    onChange={(e) => onFileChange(e, "acc_files")}
                                                                    id="file"
                                                                    data-multiple-caption="{count} files selected"
                                                                    multiple={false}
                                                                />
                                                                <i className="fa fa-upload" aria-hidden="true"></i>
                                                                <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                                <label htmlFor="file"><strong>({C_MSG.supported_pdf_format})</strong></label>
                                                                {msgError && msgError.type == "menu" && <p className="text-danger p-2">{msgError.message}</p>}
                                                            </div>
                                                        )

                                                    } else {
                                                        return (
                                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                <div className="uploadsList my-2 text-center">
                                                                    {accFiles && accFiles.length > 0 && accFiles.map((file, fIndex) => {
                                                                        return (
                                                                            <div key={fIndex} className="file_card position-relative">
                                                                                {getFileName(file)}
                                                                                <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex, "acc_files")}><i className="fa fa-times"></i></span>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                                <div className="taskDetails_btn_block px-3">
                                                                    <div className="card_button_block ">
                                                                        {/* <Button className="btn_2 btn_wide " variant="outline-dark" onClick={() => onUploadDocuments()}>Upload</Button> */}
                                                                        {fileUploadSuccess && fileUploadSuccess.status == true && fileUploadSuccess.type == "menu"  && <span className="text-success">{C_MSG.file_upload_success}</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )

                                                    }
                                                })()}
                                            </div>
                                            {errors.accountForm?.file_id && errors.accountForm?.file_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ms-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_account_modal" ? "Update" : "Create"}</button>
                                </div>
                            </div>

                            <div className="col-sm-12">
                                {(() => {
                                    if (formRes.err && formRes.data.err) {
                                        return (
                                            <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                        )
                                    }
                                })()}
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    if (modalType == 'reply_service_request_modal') {

        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>
                    <Modal.Header closeButton className="py-2 bg_15 d-flex align-items-center text-white">
                        {/* <Modal.Title className="fs-12">{`Record Audio Feedback`}</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <section className="view_document_section my-sm-5 my-lg-0">
                                <div className="container">
                                    <div className="row justify-content-center">
                                        <div className="col-12 col-md-12">
                                            <div id={Styles.audio_recorder_section} className="text_section">
                                                <div className={Styles.app}>
                                                {modalData?.recordingStatus == "recording" &&
                                                    <React.Fragment>
                                                        <div className="timer_sec fs-20 fw-600 mb-4 d-block">
                                                            <span className="">{modalData?.timer?.min || "00"} : {modalData?.timer?.sec || "00"}</span>
                                                        </div>
                                                    </React.Fragment>
                                                }
                                                    <div className={Styles.audio_controls}>
                                                        {modalData?.permission &&
                                                            <React.Fragment>
                                                                {/* {modalData?.recordingStatus == "recording" && <div className="w40 d-inline-block"><img src={recordingImg}  className="img-fluid" /></div>} */}
                                                                
                                                                {modalData?.recordingStatus == "recording" &&
                                                                    <React.Fragment>
                                                                        <div className="recorder-container">
                                                                            <div className="outer"></div>
                                                                            <div className="outer-2"></div>
                                                                            <div className="icon-microphone"><img src={recordImg}  className="img-fluid" /></div>
                                                                        </div>
                                                                    </React.Fragment>
                                                                }
                                                                {modalData?.recordingStatus == "inactive" && 
                                                                    <button id="record" onClick={() => modalData?.startRecording() } disabled={modalData?.recordingStatus == "recording" ? true : false}>
                                                                        <span className="w85 d-inline-block"><img src={recordImg}  className="img-fluid" /></span>
                                                                        <span className="d-block fs-20 fw-400 mt-2">Record your Audio Feedback</span>
                                                                    </button>
                                                                }
                                                                {modalData?.recordingStatus == "recording" && <button id="stop" className="ms-3" onClick={() => modalData?.stopRecording() } disabled={modalData?.recordingStatus == "inactive" ? true : false}><span className="w60 d-inline-block"><img src={stopImg}  className="img-fluid" /></span></button>}
                                                                {/* <audio id="audio" controls src={modalData?.audio}></audio> */}
                                                            </React.Fragment>
                                                        }
                                                    </div>
                                                    {/* {modalData?.recordingStatus == "recording" && <div className="w40"><img src={recordingImg}  className="img-fluid" /></div>} */}
                                                </div>
                                            </div>
                                            <div className="form">
                                                {modalData?.permission && modalData?.audio &&

                                                    <React.Fragment>
                                                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                                                            <div className="row align-items-start m-0 text-start">
                                                                <div className="col-sm-12 mb-3">
                                                                    <label htmlFor="customername-field" className="form-label">Audio</label>
                                                                    <audio className="d-block" id="audio" controls src={modalData?.audio}></audio>
                                                                </div>
                                                                <div className="col-sm-12">
                                                                    <div className="form-group">
                                                                        <label><i className="fa fa-attachment"></i><span>Image</span></label>
                                                                        <div className="container-fluid h-100 col-sm-12 ml-0 px-0">
                                                                            <div id="form_file_upload_modal" className="h-100 position-relative">
                                                                                {showLoader && showLoader.type == "feedback_file" && <Loader heightClass="h-100" showLoader={showLoader.status}></Loader>}
                                                                                {(() => {
                                                                                    if (feedbackFiles == null || feedbackFiles.length < 1) {
                                                                                        return (
                                                                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                                                <input
                                                                                                    className="fileUploadInp"
                                                                                                    type="file"
                                                                                                    name="file"
                                                                                                    accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp,.msg,.eml,.zip,.ppt"
                                                                                                    onChange={(e) => onFileChange(e, "feedback_file")}
                                                                                                    id="file"
                                                                                                    data-multiple-caption="{count} files selected"
                                                                                                    multiple={false}
                                                                                                />
                                                                                                <i className="fa fa-upload" aria-hidden="true"></i>
                                                                                                <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                                                                <label htmlFor="file"><strong>({C_MSG.supported_file_format})</strong></label>
                                                                                                {msgError && msgError.type == "feedback_file" && <p className="text-danger p-2">{msgError.message}</p>}
                                                                                            </div>
                                                                                        )

                                                                                    } else {
                                                                                        return (
                                                                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                                                <div className="uploadsList my-2 text-center">
                                                                                                    {feedbackFiles && feedbackFiles.length > 0 && feedbackFiles.map((file, fIndex) => {
                                                                                                        return (
                                                                                                            <div key={fIndex} className="file_card position-relative">
                                                                                                                {getFileName(file)}
                                                                                                                <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex, "feedback_file")}><i className="fa fa-times"></i></span>
                                                                                                            </div>
                                                                                                        )
                                                                                                    })}
                                                                                                </div>
                                                                                                <div className="taskDetails_btn_block px-3">
                                                                                                    <div className="card_button_block ">
                                                                                                        {/* <Button className="btn_2 btn_wide " variant="outline-dark" onClick={() => onUploadDocuments()}>Upload</Button> */}
                                                                                                        {fileUploadSuccess && fileUploadSuccess.status == true && fileUploadSuccess.type == "feedback_file" && <span className="text-success">{C_MSG.file_upload_success}</span>}
                                                                                                    </div>
                                                                                                </div>

                                                                                            </div>
                                                                                        )

                                                                                    }
                                                                                })()}
                                                                            </div>
                                                                            {errors.feedbackForm?.feedback_file && errors.feedbackForm?.file.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-12 mb-3">
                                                                    <label htmlFor="customername-field" className="form-label">Comment</label>
                                                                    <textarea rows={5} className="form-control" placeholder="Feedback" {...register("feedbackForm.feedback_text", { required: true })}></textarea>
                                                                    {errors && errors.categoryForm && errors.categoryForm?.feedback_text && errors.categoryForm.feedback_text?.type == "required" && <div className="field_err text-danger">{C_MSG.field_required}</div>}
                                                                </div>
                                                            </div>
                                                            <hr />
                                                            <div className="d-flex align-items-center justify-content-end px-3">
                                                                <div className="">
                                                                    <button className="btn btn-outline-secondary waves-effect waves-light" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                                                </div>
                                                                <div className="ms-3">
                                                                    <button className="btn btn-secondary waves-effect waves-light" type="submit" disabled={formSubmitted}>Submit</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </React.Fragment>

                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'admin_service_chat_modal') {

        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>
                    <Modal.Header closeButton className="py-2 bg_15 d-flex align-items-center text-white">
                        {/* <Modal.Title className="fs-12">{`Record Audio Feedback`}</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-0">
                        <div className="container-fluid">
                            {modalData?.view == 1 &&
                                <React.Fragment>
                                    <div id="users-chat" className={`${Styles.chat_block} min_h_420`}>
                                    <div className="chat-conversation p-3 min_h_225" id="chat-conversation" data-simplebar>
                                        <ul className="list-unstyled chat-conversation-list chat-sm min_h_420 overflow_y_auto" id="users-conversation" ref={chatScroller}>
                                            {modalData.replies && modalData.replies.length > 0 && React.Children.toArray(modalData.replies.map((reply, rIndex) => {
                                                return (
                                                    <React.Fragment>
                                                        <li className={`chat-list ${ reply.member_id == 99  ? "right" : "left"}`}>
                                                            <div className="conversation-list align-items-start">
                                                                <div className="chat-avatar mt-2">
                                                                    <img src={demoUser} alt="" />
                                                                </div>
                                                                <div className="user-chat-content">
                                                                    <div className="ctext-wrap">
                                                                        <div className="ctext-wrap-content">
                                                                            <div className="d-flex align-items-center justify-content-between">
                                                                            <p className="mb-0">{reply.audio_file_path && <audio id="audio" controls src={reply.audio_file_path}></audio>}</p>
                                                                            <p className="mb-0">{reply.file_path && <a className="link_url" target="_blank" href={reply.file_path}><i className="fa fa-2x fa-paperclip"></i></a>}</p>
                                                                            </div>
                                                                            <p className="mb-0 ctext-content">{reply.feedback_text}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="conversation-name"><small className="text-muted time">{moment(reply.created_on).format("MMM DD, YYYY")}</small> <span className="text-success check-message-icon"><i className="ri-check-double-line align-bottom"></i></span></div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </React.Fragment>
                                                )
                                            }))}
                                        </ul>
                                    </div>
                                </div>
                                <div class="border-top border-top-dashed">
                                    <div class="row g-2 mx-3 mt-2 mb-3">
                                        <div class="col">
                                            <button type="submit" class="btn btn-info w-100" onClick={() => modalData.changeView(2)}>Send Reply &nbsp;<i class="mdi mdi-send"></i></button>
                                        </div>
                                    </div>
                                </div>
                                </React.Fragment>
                            }
                            {modalData?.view == 2 &&
                                <React.Fragment>
                                    <section className="view_document_section my-sm-5 my-lg-0">
                                        <div className="container">
                                            <div className="row justify-content-center">
                                                <div className="col-12 col-md-12">
                                                    <div id={Styles.audio_recorder_section} className="text_section">
                                                        <div className={Styles.app}>
                                                        {modalData?.recordingStatus == "recording" &&
                                                            <React.Fragment>
                                                                <div className="timer_sec fs-20 fw-600 mb-4 d-block">
                                                                    <span className="">{modalData?.timer?.min || "00"} : {modalData?.timer?.sec || "00"}</span>
                                                                </div>
                                                            </React.Fragment>
                                                        }
                                                            <div className={`${Styles.audio_controls} pb-5`}>
                                                                {modalData?.permission &&
                                                                    <React.Fragment>
                                                                        {/* {modalData?.recordingStatus == "recording" && <div className="w40 d-inline-block"><img src={recordingImg}  className="img-fluid" /></div>} */}
                                                                        
                                                                        {modalData?.recordingStatus == "recording" &&
                                                                            <React.Fragment>
                                                                                <div className="recorder-container">
                                                                                    <div className="outer"></div>
                                                                                    <div className="outer-2"></div>
                                                                                    <div className="icon-microphone"><img src={recordImg}  className="img-fluid" /></div>
                                                                                </div>
                                                                            </React.Fragment>
                                                                        }
                                                                        {modalData?.recordingStatus == "inactive" && 
                                                                            <button id="record" onClick={() => modalData?.startRecording() } disabled={modalData?.recordingStatus == "recording" ? true : false}>
                                                                                <span className="w85 d-inline-block"><img src={recordImg}  className="img-fluid" /></span>
                                                                                <span className="d-block fs-20 fw-400 mt-2">Tap to Speak</span>
                                                                            </button>
                                                                        }
                                                                        {modalData?.recordingStatus == "recording" && <button id="stop" className="ms-3" onClick={() => modalData?.stopRecording() } disabled={modalData?.recordingStatus == "inactive" ? true : false}><span className="w60 d-inline-block"><img src={stopImg}  className="img-fluid" /></span></button>}
                                                                        {/* <audio id="audio" controls src={modalData?.audio}></audio> */}
                                                                    </React.Fragment>
                                                                }
                                                            </div>
                                                            {/* {modalData?.recordingStatus == "recording" && <div className="w40"><img src={recordingImg}  className="img-fluid" /></div>} */}
                                                        </div>
                                                    </div>
                                                    <div className="form">
                                                        {modalData?.permission && modalData?.audio &&

                                                            <React.Fragment>
                                                                <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                                                                    <div className="row align-items-start m-0 text-start">
                                                                        <div className="col-sm-12 mb-3">
                                                                            <label htmlFor="customername-field" className="form-label">Audio</label>
                                                                            <audio className="d-block" id="audio" controls src={modalData?.audio}></audio>
                                                                        </div>
                                                                        <div className="col-sm-12">
                                                                            <div className="form-group">
                                                                                <label><i className="fa fa-attachment"></i><span>Image</span></label>
                                                                                <div className="container-fluid h-100 col-sm-12 ml-0 px-0">
                                                                                    <div id="form_file_upload_modal" className="h-100 position-relative">
                                                                                        {showLoader && showLoader.type == "feedback_file" && <Loader heightClass="h-100" showLoader={showLoader.status}></Loader>}
                                                                                        {(() => {
                                                                                            if (feedbackFiles == null || feedbackFiles.length < 1) {
                                                                                                return (
                                                                                                    <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                                                        <input
                                                                                                            className="fileUploadInp"
                                                                                                            type="file"
                                                                                                            name="file"
                                                                                                            accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp,.msg,.eml,.zip,.ppt"
                                                                                                            onChange={(e) => onFileChange(e, "feedback_file")}
                                                                                                            id="file"
                                                                                                            data-multiple-caption="{count} files selected"
                                                                                                            multiple={false}
                                                                                                        />
                                                                                                        <i className="fa fa-upload" aria-hidden="true"></i>
                                                                                                        <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                                                                        <label htmlFor="file"><strong>({C_MSG.supported_file_format})</strong></label>
                                                                                                        {msgError && msgError.type == "feedback_file" && <p className="text-danger p-2">{msgError.message}</p>}
                                                                                                    </div>
                                                                                                )

                                                                                            } else {
                                                                                                return (
                                                                                                    <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                                                        <div className="uploadsList my-2 text-center">
                                                                                                            {feedbackFiles && feedbackFiles.length > 0 && feedbackFiles.map((file, fIndex) => {
                                                                                                                return (
                                                                                                                    <div key={fIndex} className="file_card position-relative">
                                                                                                                        {getFileName(file)}
                                                                                                                        <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex, "feedback_file")}><i className="fa fa-times"></i></span>
                                                                                                                    </div>
                                                                                                                )
                                                                                                            })}
                                                                                                        </div>
                                                                                                        <div className="taskDetails_btn_block px-3">
                                                                                                            <div className="card_button_block ">
                                                                                                                {/* <Button className="btn_2 btn_wide " variant="outline-dark" onClick={() => onUploadDocuments()}>Upload</Button> */}
                                                                                                                {fileUploadSuccess && fileUploadSuccess.status == true && fileUploadSuccess.type == "feedback_file" && <span className="text-success">{C_MSG.file_upload_success}</span>}
                                                                                                            </div>
                                                                                                        </div>

                                                                                                    </div>
                                                                                                )

                                                                                            }
                                                                                        })()}
                                                                                    </div>
                                                                                    {errors.feedbackForm?.feedback_file && errors.feedbackForm?.file.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-sm-12 mb-3">
                                                                            <label htmlFor="customername-field" className="form-label">Comment</label>
                                                                            <textarea rows={5} className="form-control" placeholder="Feedback" {...register("feedbackForm.feedback_text", { required: true })}></textarea>
                                                                            {errors && errors.categoryForm && errors.categoryForm?.feedback_text && errors.categoryForm.feedback_text?.type == "required" && <div className="field_err text-danger">{C_MSG.field_required}</div>}
                                                                        </div>
                                                                    </div>
                                                                    <hr />
                                                                    <div className="d-flex align-items-center justify-content-end px-3">
                                                                        <div className="">
                                                                            <button className="btn btn-outline-secondary waves-effect waves-light" type="button" disabled={formSubmitted} onClick={() => modalData.changeView(1)}>Back</button>
                                                                        </div>
                                                                        <div className="ms-3">
                                                                            <button className="btn btn-secondary waves-effect waves-light" type="submit" disabled={formSubmitted}>Submit</button>
                                                                        </div>
                                                                    </div>
                                                                </form>
                                                            </React.Fragment>

                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </React.Fragment>
                            }
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    if (modalType == 'update_bill_credit') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>

                    <Modal.Header closeButton className="bg-light p-3">
                        {/* <Modal.Title className="fs-12">{modalType == "update_account_modal" ? "Update Account Info" : "Add Account"}</Modal.Title> */}
                        <Modal.Title className="fs-12"></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label>Enter Bill Number</label>
                                        <input type="text" placeholder="Bill Number" className="form-control" {...register("accountForm.bill_number", { required: false })} autoComplete="off" />
                                        {errors.accountForm?.bill_number && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label>Enter Bill Amount</label>
                                        <input type="text" placeholder="Bill Amount" className="form-control" {...register("accountForm.bill_amount", { required: true })} autoComplete="off" />
                                        {errors.accountForm?.bill_amount && errors.accountForm?.bill_amount.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ms-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>Add Credits</button>
                                </div>
                            </div>

                            <div className="col-sm-12">
                                {(() => {
                                    if (formRes.err && formRes.data.err) {
                                        return (
                                            <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                        )
                                    }
                                })()}
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    if (modalType == 'show_visit_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={cSize}
                    className={`custom-modal ${customClass}`}>

                    <Modal.Header closeButton className="bg-light p-3">
                        {/* <Modal.Title className="fs-12">{modalType == "update_account_modal" ? "Update Account Info" : "Add Account"}</Modal.Title> */}
                        <Modal.Title className="fs-12">Visit Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
    {modalData && modalData.account && modalData.account.length > 0 ? (
        <>
         <center>
         <table className="table align-middle table-nowrap table-sm " style={{width:"80%"}} id="customerTable">
            <thead className="table-light">
                <tr>
                    <th className="link_url">Date</th>
                    <th className="link_url">Bill Number</th>
                    <th className="link_url">Bill Amount</th>
                    <th className="link_url">Total Credits</th>
                </tr>
            </thead>
            <tbody className="list form-check-all">
                {modalData.account.map((item, index) => (
                    <tr key={index}>
                        <td>{new Date(item.entry_date).toLocaleDateString()}</td> {/* Format date */}
                        <td>{item.bill_no}</td>
                        <td>{item.amount}</td>
                        <td>{item.credits}</td>
                    </tr>
                ))}
            </tbody>
        </table>

         </center>
        </>
       
       
    ) : (
        <p>No data available</p> // Fallback message if no data
    )}

    <hr />
    <div className="d-flex align-items-center justify-content-end px-3">
        <div className="">
            <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
        </div>
    </div>
</Modal.Body>
                </Modal>
            </>
        )
    }
    
    
}

export default StackModal