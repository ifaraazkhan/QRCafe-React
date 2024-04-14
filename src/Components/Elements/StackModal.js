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
            register("userForm.roles", { required: true })
        }
        if (modalType == "update_user_modal") {
            setShowLoader(false)
            register("userForm.roles", { required: true })
            if(modalData && modalData.user && modalData.user.roles && modalData.user.roles.length > 0){
                let selRolesArr = modalData.user.roles.map((item,index) => ({value: item.user_id,label:`${item.first_name} ${item.last_name}`}))
                setGrpUsers(selRolesArr)
                setValue("userForm.roles",selRolesArr)
            }
            
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
        
    }, []);

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
        const setFileState = type == "acc_bg_img" ? setAccBgImg : (type == "acc_files" ? setAccFiles : setUploadFiles)
        const uploadFn = type == "acc_bg_img" ? onUploadDocuments : (type == "acc_files" ? onUploadDocuments : onUploadDocuments)
        const uploadtype = type == "acc_bg_img" ? "background" : (type == "acc_files" ? "menu" : "files")
        const formField = type == "acc_bg_img" ? "accountForm.bg_image_id" : (type == "acc_files" ? "accountForm.file_id" : "")
        if (checkFileType) {
            if (checkFileTypeValidation(filesArray, uploadtype)) {
                const uploadRes = await uploadFn(filesArray, uploadtype)
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
        let validExt = Object.assign([], type == "background" ? validImgFileTypes : (type == "menu" ? validPdfFileTypes : validFileTypes))
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
        const setFileState = type == "acc_bg_img" ? setAccBgImg : (type == "acc_files" ? setAccFiles : setUploadFiles)
        const fileState = type == "acc_bg_img" ? accBgImg : (type == "acc_files" ? accFiles : uploadfiles)
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
            let res = await modalData.uploadAccDocs(obj)
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
                    first_name: form.first_name,   
                    last_name: form.last_name,   
                    email: form.email,
                    password: form.password,     
                    phone: form.phone,     
                    address: form.address,     
                    roles: form.roles.map(item => item.value),
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
                    first_name: form.first_name,   
                    last_name: form.last_name,   
                    email: form.email,
                    password: form.password,     
                    phone: form.phone,     
                    address: form.address,     
                    roles: form.roles.map(item => item.value),
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
                        <Modal.Title className="fs-12">Image Viewer</Modal.Title>
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
                        <Modal.Title className="fs-12">{modalData?.title}</Modal.Title>
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
                        <Modal.Title className="fs-12">{modalType == "update_group_modal" ? "Update" : "New"} Group</Modal.Title>
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
                        <Modal.Title className="fs-12">{modalType == "update_category_modal" ? "Update" : "New"} Category</Modal.Title>
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
                        <Modal.Title className="fs-12">{modalType == "update_user_modal" ? "Update User Info" : "Add a User"}</Modal.Title>
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
                        <Modal.Title className="fs-12">{modalType == "update_account_modal" ? "Update Account Info" : "Add Account"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12">
                                    <div className="form-group">
                                        <select className="form-control fw-600" {...register("accountForm.user_id", { required: true })} defaultValue={modalData && modalData.account?.user_id ? modalData.account?.user_id : ""}>
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
                                        <input type="text" placeholder="Headline 2" className="form-control" {...register("accountForm.headline2_text", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.headline2_text ? modalData.account?.headline2_text : ""} />
                                        {errors.accountForm?.headline2_text && errors.accountForm?.headline2_text.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 2 Button" className="form-control" {...register("accountForm.headline2_button", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.headline2_button ? modalData.account?.headline2_button : ""} />
                                        {errors.accountForm?.headline2_button && errors.accountForm?.headline2_button.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 2" className="form-control" {...register("accountForm.headline3_text", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.headline3_text ? modalData.account?.headline3_text : ""} />
                                        {errors.accountForm?.headline3_text && errors.accountForm?.headline3_text.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Headline 3 Button" className="form-control" {...register("accountForm.headline3_button", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.headline3_button ? modalData.account?.headline3_button : ""} />
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
                                        <input type="text" placeholder="Offer" className="form-control" {...register("accountForm.offer", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.offer ? modalData.account?.offer : ""} />
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
                                        <input type="text" placeholder="Youtube Url" className="form-control" {...register("accountForm.youtube_url", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.youtube_url ? modalData.account?.youtube_url : ""} />
                                        {errors.accountForm?.youtube_url && errors.accountForm?.youtube_url.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="Instagram Url" className="form-control" {...register("accountForm.instagram_url", { required: true })} autoComplete="off" defaultValue={modalData && modalData.account?.instagram_url ? modalData.account?.instagram_url : ""} />
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
    
    
}

export default StackModal