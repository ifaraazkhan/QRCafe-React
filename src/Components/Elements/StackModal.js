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
    const [msgError, setMsgErr] = useState('')
    const [uploadErr, setUploadErr] = useState('')
    const [fileUrls, setFileUrls] = useState([]);
    const [checkFileType, setCheckFileType] = useState(true);
    const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
    const [validFileTypes, setValidFileTypes] = useState(process.env.REACT_APP_SUPPORT_UPLOAD_FILE_TYPE.split(","));
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
    const onFileChange = (event = null) => {
        setMsgErr('')
        setUploadErr('')
        if (event == null) {
            return false
        }
        let files = event.target.files
        let filesArray = Array.from(files);
        if (checkFileType) {
            if (checkFileTypeValidation(filesArray)) {
                setUploadFiles(filesArray)
            }
        } else {
            setUploadFiles(filesArray)
        }
    }

    const checkFileTypeValidation = (filesArray = []) => {
        if (!filesArray.length) {
            return false;
        }
        if (!checkFileType) {
            return true;
        }
        let validExt = Object.assign([], validFileTypes)
        for (let i = 0; i < filesArray.length; i++) {
            let fileName = filesArray[i]["name"];
            let ext = fileName.split('.').pop();
            if (!validExt.includes(ext)) {
                setMsgErr(C_MSG.select_valid_file_format)
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

    const removeUploadFile = async (fileIndex = null) => {
        if (fileIndex == null) {
            return false
        }
        let files = uploadfiles;
        files.splice(fileIndex, 1)
        setUploadFiles(oldVal => {
            return [...files]
        })
    }

    const onUploadDocuments = async () => {
        let form = await trigger("expenseForm")
        setFileUploadSuccess(false)
        setMsgErr('')
        setUploadErr('')
        setShowLoader(true)
        if (uploadfiles == '' || uploadfiles == null || uploadfiles == undefined || uploadfiles.length == 0) {
            setMsgErr(C_MSG.file_required);
            setShowLoader(false)
            return false
        }
        if (uploadfiles.length > 0) {
            let obj = { uploadfiles }
            let res = await modalData.uploadExpenseDocs(obj)
            if(modalType == "add_expense_modal" || modalType == "upload_expense_modal"){
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setValue("expenseForm.image_ids",res.image_ids)
                    setFileUploadSuccess(true)
                    setTimeout(() => {
                        setFileUploadSuccess(false)
                    }, 3000);
                } else {
                    setMsgErr(C_MSG.technical_err)
                }
            }
            
            setShowLoader(false)
            return res.image_ids
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
        
        return false
    }

    const _ = (el) => {
        return document.getElementById(el);
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
                                <div className="ml-3">
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
                                <div className="ml-3">
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
                                <div className="ml-3">
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
    
    
}

export default StackModal