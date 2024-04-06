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
    const expenseForm = watch("expenseForm")
    const accountForm = watch("bankAccForm")
    const accountFormTypeId = watch("bankAccForm.expense_type_id")
    const accountFormCatId = watch("bankAccForm.category_id")
    

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
        if (modalType == "update_expense_modal") {
            setShowLoader(false)
            register("expenseForm.tax_amount", { required: false, valueAsNumber:true })
            if(modalData){
                let taxAmt = GetTaxAmt(modalData?.expense?.tax_slab_id, modalData?.expense?.amount);
            }
        }
    }, []);

    useEffect(() => {
        if(accountFormTypeId){
            let catsArr = modalData?.accountTypeCats[accountFormTypeId]?.acc_cats || []
            if(catsArr.length > 0){
                let cat= catsArr[0]
                if(cat){
                    setValue("bankAccForm.category_id",cat.category_id)
                }
            }
        }
    }, [accountFormTypeId])

    useEffect(() => {
        if(accountFormCatId){
            let catsArr = modalData?.accountTypeCats[accountFormTypeId]?.acc_cats || []
            if(catsArr.length > 0){
                let cat= catsArr.find(item => item.category_id == accountFormCatId)
                if(cat){
                    setValue("bankAccForm.name",cat.expense_category)
                }
            }
        }
    }, [accountFormCatId])
    

    


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
        
        if (modalType == 'create_group_modal') {
            if (data && data.groupForm && Object.keys(data.groupForm).length > 0) {
                let form = data.groupForm
                let formData = {
                    name: form.name,
                    user_ids: form.users.map(item => item.value) 
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
        if (modalType == 'update_group_modal') {
            if (data && data.groupForm && Object.keys(data.groupForm).length > 0) {
                let form = data.groupForm
                let formData = {
                    group_id: modalData && modalData?.group?.group_id ? modalData?.group?.group_id : "",
                    name: form.name,
                    user_ids: form.users.map(item => item.value) 
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
        if (modalType == 'create_project_modal') {
            if (data && data.projectForm && Object.keys(data.projectForm).length > 0) {
                let form = data.projectForm
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
        if (modalType == 'update_project_modal') {
            if (data && data.projectForm && Object.keys(data.projectForm).length > 0) {
                let form = data.projectForm
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
        if (modalType == 'create_paymethod_modal') {
            if (data && data.payMethodForm && Object.keys(data.payMethodForm).length > 0) {
                let form = data.payMethodForm
                let formData = {
                    payment_method: form.payment_method,
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
        if (modalType == 'update_paymethod_modal') {
            if (data && data.payMethodForm && Object.keys(data.payMethodForm).length > 0) {
                let form = data.payMethodForm
                let formData = {
                    payMethodId: modalData && modalData?.payMethod?.payment_method_id ? modalData?.payMethod?.payment_method_id : "",
                    payment_method: form.payment_method,
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
        if (modalType == 'create_rejReason_modal') {
            if (data && data.rejReasonForm && Object.keys(data.rejReasonForm).length > 0) {
                let form = data.rejReasonForm
                let formData = {
                    reason: form.reason,
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
        if (modalType == 'update_rejReason_modal') {
            if (data && data.rejReasonForm && Object.keys(data.rejReasonForm).length > 0) {
                let form = data.rejReasonForm
                let formData = {
                    reasonId: modalData && modalData?.rejReason?.reason_id ? modalData?.rejReason?.reason_id : "",
                    reason: form.reason,
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
        if (modalType == 'create_taxslab_modal') {
            if (data && data.taxSlabForm && Object.keys(data.taxSlabForm).length > 0) {
                let form = data.taxSlabForm
                let formData = {
                    tax_percent: Number(form.tax_percent),
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
        if (modalType == 'update_taxslab_modal') {
            if (data && data.taxSlabForm && Object.keys(data.taxSlabForm).length > 0) {
                let form = data.taxSlabForm
                let formData = {
                    tax_slab_id: modalData && modalData?.taxSlab?.tax_slab_id ? modalData?.taxSlab?.tax_slab_id : "",
                    tax_percent: Number(form.tax_percent),
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
        if (modalType == 'create_merchant_modal') {
            if (data && data.merchantForm && Object.keys(data.merchantForm).length > 0) {
                let form = data.merchantForm
                let formData = {
                    merchant_name: form.merchant_name,
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
        if (modalType == 'update_merchant_modal') {
            if (data && data.merchantForm && Object.keys(data.merchantForm).length > 0) {
                let form = data.merchantForm
                let formData = {
                    merchant_id: modalData && modalData?.merchant?.merchant_id ? modalData?.merchant?.merchant_id : "",
                    merchant_name: form.merchant_name,
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
        if (modalType == 'add_expense_modal') {
            let image_ids = []
            if(uploadfiles && uploadfiles.length > 0){
                image_ids = await onUploadDocuments()
            }
            if (data && data.expenseForm && Object.keys(data.expenseForm).length > 0) {
                let form = data.expenseForm
                let formData = {
                    amount: form.amount,
                    merchant_id: form.merchant_id,
                    category_id: form.category_id,
                    tax_slab_id: form.tax_slab_id,
                    tax_amount: form.tax_amount,
                    payment_method_id: form.payment_method_id,
                    description: form.description,
                    date_expensed: moment(form.date_expensed,"DD/MM/YYYY").format("YYYY-MM-DD"),
                    image_ids: form.image_ids || image_ids,
                    status_id: type == "save" ? 1 : 2 

                }
                setFormSbmt(true)
                let res = await formSubmit(formData,type)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_expense_modal') {
            let image_ids = []
            if(uploadfiles && uploadfiles.length > 0){
                image_ids = await onUploadDocuments()
            }
            if (data && data.expenseForm && Object.keys(data.expenseForm).length > 0) {
                let form = data.expenseForm
                let formData = {
                    expense_id: modalData && modalData?.expense?.expense_id ? modalData?.expense?.expense_id : "",
                    amount: form.amount,
                    merchant_id: form.merchant_id,
                    category_id: form.category_id,
                    tax_slab_id: form.tax_slab_id,
                    tax_amount: form.tax_amount,
                    payment_method_id: form.payment_method_id,
                    description: form.description,
                    date_expensed: moment(form.date_expensed,"DD/MM/YYYY").format("YYYY-MM-DD"),
                    image_ids: form.image_ids || image_ids,
                    status_id: 1 
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
        if (modalType == 'reject_expense_modal') {
            if (data && data.rejectExpenseForm && Object.keys(data.rejectExpenseForm).length > 0) {
                let form = data.rejectExpenseForm
                let formData = {
                    reject_reason_id: form.reject_reason_id,
                    comment: form.comment,
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
        if (modalType == 'approve_expense_modal') {
            if (data && data.approveExpenseForm && Object.keys(data.approveExpenseForm).length > 0) {
                let form = data.approveExpenseForm
                let formData = {
                    comment: form.comment,
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
        if (modalType == 'transfer_expense_modal') {
            if (data && data.transferExpenseForm && Object.keys(data.transferExpenseForm).length > 0) {
                let form = data.transferExpenseForm
                let formData = {
                    comment: form.comment,
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
        if (modalType == 'process_expense_modal') {
            if (data && data.processExpenseForm && Object.keys(data.processExpenseForm).length > 0) {
                let form = data.processExpenseForm
                console.log(form);
                let formData = {
                    expense_id:modalData?.expense_id,
                    payment_method_id: form.payment_method_id,
                    comment: form.comment,
                    clearance_date:moment(form.clearance_date, "DD/MM/YYYY").format("YYYY-MM-DD"),
                    user_account_id: form.user_account_id,
                    transaction_id: form.transaction_id,
                    project_bank_id: form.project_bank_id,
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
        if (modalType == 'add_invoice_modal') {
            if (data && data.invoiceForm && Object.keys(data.invoiceForm).length > 0) {
                let form = data.invoiceForm
                let formData = {
                    invoice_date: moment().format("YYYY-MM-DD"),
                    payee_name: form.payee_name,
                    payee_gst: form.payee_gst,
                    invoice_no: form.invoice_no,
                    amount: form.amount,
                    tax_amount: form.tax_amount,
                    total_amount: form.total_amount,
                    payment_method_id: form.payment_method_id,
                    description: form.description,
                    received_date: moment().format("YYYY-MM-DD")

                }
                setFormSbmt(true)
                let res = await formSubmit(formData,type)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_invoice_modal') {
            if (data && data.invoiceForm && Object.keys(data.invoiceForm).length > 0) {
                let form = data.invoiceForm
                let formData = {
                    input_id: modalData && modalData?.invoice?.input_id ? modalData?.invoice?.input_id : "",
                    payee_name: form.payee_name,
                    payee_gst: form.payee_gst,
                    amount: form.amount,
                    tax_amount: form.tax_amount,
                    total_amount: form.total_amount,
                    payment_method_id: form.payment_method_id,
                    description: form.description,
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
        if (modalType == 'create_bank_account_modal') {
            if (data && data.bankAccForm && Object.keys(data.bankAccForm).length > 0) {
                let formData = data.bankAccForm
                formData.project_id = modalData?.project_id
                setFormSbmt(true)
                const res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_bank_account_modal') {
            if (data && data.bankAccForm && Object.keys(data.bankAccForm).length > 0) {
                let formData = data.bankAccForm;
                formData.bank_id = modalData?.account.bank_id;
                formData.project_id = modalData?.project_id
                setFormSbmt(true)
                const res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'add_transaction_log') {
            
            if (data && data.logTransactionForm && Object.keys(data.logTransactionForm).length > 0) {
                let form = data.logTransactionForm
                let formData = {
                    user_id: form.user_id || 0,
                    user_account_id: form.user_account_id || 0,
                    vendor_id: form.vendor_id || 0,
                    amount: form.amount,
                    description: form.description,
                    payment_method_id: form.payment_method_id,
                    project_bank_id: form.project_bank_id,
                    transaction_id: form.transaction_id,
                }
                setFormSbmt(true)
                let res = await formSubmit(formData,type)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_transaction_log') {
            if (data && data.logTransactionForm && Object.keys(data.logTransactionForm).length > 0) {
                let form = data.logTransactionForm
                let formData = {
                    transaction_log_id: modalData && modalData?.expense?.expense_id ? modalData?.expense?.expense_id : "",
                    user_id: form.user_id || 0,
                    vendor_id: form.vendor_id || 0,
                    amount: form.amount,
                    description: form.description,
                    payment_method_id: form.payment_method_id,
                    project_bank_id: form.project_bank_id,
                    transaction_id: form.transaction_id,
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
        if (modalType == 'update_request_modal') {
            if (data && data.requestForm && Object.keys(data.requestForm).length > 0) {
                let form = data.requestForm
                let formData = {
                    user_id: modalData?.request && modalData?.request.user_id || 0,
                    status: modalData?.status || 0,
                    roles: form.roles.map(item => item.value),
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
        if (modalType == 'add_payee_modal') {
            if (data && data.payeeForm && Object.keys(data.payeeForm).length > 0) {
                let form = data.payeeForm
                let formData = {...form}
                formData.user_type= Number(form.user_type);   
                formData.opening_balance= Number(form.opening_balance);   
                // formData.title= form.title;   
                // formData.first_name= form.first_name;   
                // formData.last_name= form.last_name;   
                // formData.email= form.email;
                // formData.display_name= form.display_name;     
                // formData.mobile_number= form.mobile_number;  
                setFormSbmt(true)
                let res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_payee_modal') {
            if (data && data.userForm && Object.keys(data.userForm).length > 0) {
                let form = data.userForm
                let formData = {
                    user_id: modalData && modalData?.payee?.id ? modalData?.payee?.id : "",
                    title: form.title,   
                    first_name: form.first_name,   
                    last_name: form.last_name,   
                    email: form.email,
                    display_name: form.display_name,     
                    mobile_number: form.mobile_number,  
                     
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

        if (modalType == 'create_bank_acc_modal') {
            if (data && data.bankAccForm && Object.keys(data.bankAccForm).length > 0) {
                let formData = data.bankAccForm
                formData.type = modalData?.account?.type || "";
                formData.category_id = Number(formData.category_id);
                formData.expense_type_id = Number(formData.expense_type_id);
                setFormSbmt(true)
                const res = await formSubmit(formData)
                if (res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)) {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_bank_acc_modal') {
            if (data && data.bankAccForm && Object.keys(data.bankAccForm).length > 0) {
                let formData = data.bankAccForm;
                formData.type = modalData.type || "";
                formData.category_id = Number(formData.category_id);
                formData.expense_type_id = Number(formData.expense_type_id);

                setFormSbmt(true)
                const res = await formSubmit(formData)
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

    const GetTaxAmt = (taxId = null,amount = null) => {
        if(taxId == null){
            taxId = expenseForm?.tax_slab_id
        }
        taxId = Number(taxId)
        const amt = amount != null ? amount : (expenseForm?.amount || 0);
        if(taxId == 0){
            return 0
        }
        let taxPercent = modalData.taxSlabs.find(item => item.tax_slab_id == taxId);
        taxPercent = taxPercent ? taxPercent.tax_percent : 0;
        let taxAmt = (amt * taxPercent)/100
        setValue("expenseForm.tax_amount",taxAmt)
    }
    const GetTotalAmt = (taxAmount = null,amount = null) => {
        const invoiceForm = watch("invoiceForm")
        const taxAmt = taxAmount != null ? taxAmount : (invoiceForm?.tax_amount || 0);
        const amt = amount != null ? amount : (invoiceForm?.amount || 0);
        if(taxAmt == 0 || amt == 0){
            return 0
        }
        let totalAmt = Number(taxAmt) + Number(amt);
        setValue("invoiceForm.total_amount",totalAmt)
    }

    const onChangePayMethod = (payMethodId = null) => {
        if(!payMethodId || payMethodId == null){
            return false
        }

        const payMethods = modalData?.payMethods || [];
        let formField = "processExpenseForm.transaction_id"
        if(modalType == "add_transaction_log"){
            formField = "logTransactionForm.transaction_id"
        }
        if( payMethodId == 1){
            let timeStamp = moment().unix()
            setValue(formField,`cash_${timeStamp}`)
        }else{
            setValue(formField,``)
        }

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

    if (modalType == 'create_project_modal' || modalType == "update_project_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_project_modal" ? "Update" : "New"} Project</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectName-field" className="form-label">Project Name</label>
                                    <input type="text" className="form-control" placeholder="Enter Name" {...register("projectForm.name", { required: true })} defaultValue={modalData && modalData?.project?.name ? modalData?.project?.name : ""} />
                                    {errors && errors.projectForm && errors.projectForm?.name && errors.projectForm.name?.type == "required" && <div className="field_err text-danger">{C_MSG.project_name_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectDesc-field" className="form-label">Description</label>
                                    <input type="text" className="form-control" placeholder="Enter Description" {...register("projectForm.description", { required: true })} defaultValue={modalData && modalData?.project?.description ? modalData?.project?.description : ""} />
                                    {errors && errors.projectForm && errors.projectForm?.description && errors.projectForm.description?.type == "required" && <div className="field_err text-danger">{C_MSG.project_desc_required}</div>}
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_project_modal" ? "Update" : "Create"}</button>
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
    if (modalType == 'create_paymethod_modal' || modalType == "update_paymethod_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_paymethod_modal" ? "Update" : "New"} Payment Method</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectName-field" className="form-label">Payment Method</label>
                                    <input type="text" className="form-control" placeholder="Enter Name" {...register("payMethodForm.payment_method", { required: true })} defaultValue={modalData && modalData?.payMethod?.payment_method ? modalData?.payMethod?.payment_method : ""} />
                                    {errors && errors.payMethodForm && errors.payMethodForm?.payment_method && errors.payMethodForm.payment_method?.type == "required" && <div className="field_err text-danger">{C_MSG.pay_mthd_required}</div>}
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_paymethod_modal" ? "Update" : "Create"}</button>
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
    if (modalType == 'create_rejReason_modal' || modalType == "update_rejReason_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_rejReason_modal" ? "Update" : "New"} Reject Reason</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectName-field" className="form-label">Reject Reason</label>
                                    <input type="text" className="form-control" placeholder="Enter Name" {...register("rejReasonForm.reason", { required: true })} defaultValue={modalData && modalData?.rejReason?.reason ? modalData?.rejReason?.reason : ""} />
                                    {errors && errors.rejReasonForm && errors.rejReasonForm?.reason && errors.rejReasonForm.reason?.type == "required" && <div className="field_err text-danger">{C_MSG.rej_reason_required}</div>}
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_rejReason_modal" ? "Update" : "Create"}</button>
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

    if (modalType == 'create_taxslab_modal' || modalType == "update_taxslab_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_taxslab_modal" ? "Update" : "New"} Tax Slab</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectName-field" className="form-label">Tax Percent</label>
                                    <input type="text" className="form-control" placeholder="Enter Percent" {...register("taxSlabForm.tax_percent", { required: true,valueAsNumber:true })} defaultValue={modalData && modalData?.taxSlab?.tax_percent ? modalData?.taxSlab?.tax_percent : ""} />
                                    {errors && errors.taxSlabForm && errors.taxSlabForm?.tax_percent && errors.taxSlabForm.tax_percent?.type == "required" && <div className="field_err text-danger">{C_MSG.rej_reason_required}</div>}
                                    {errors && errors.taxSlabForm && errors.taxSlabForm?.tax_percent && errors.taxSlabForm.tax_percent?.type == "valueAsNumber" && <div className="field_err text-danger">{`Only numbers are allowed`}</div>}
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_taxslab_modal" ? "Update" : "Create"}</button>
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
    if (modalType == 'create_merchant_modal' || modalType == "update_merchant_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_taxslab_modal" ? "Update" : "New"} Merchant</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectName-field" className="form-label">Merchant Name</label>
                                    <input type="text" className="form-control" placeholder="Enter Name" {...register("merchantForm.merchant_name", { required: true })} defaultValue={modalData && modalData?.merchant?.merchant_name ? modalData?.merchant?.merchant_name : ""} />
                                    {errors && errors.merchantForm && errors.merchantForm?.merchant_name && errors.merchantForm.merchant_name?.type == "required" && <div className="field_err text-danger">{C_MSG.rej_reason_required}</div>}
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_taxslab_modal" ? "Update" : "Create"}</button>
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
                        <Modal.Title className="fs-12">{modalType == "update_user_modal" ? "Update Person Info" : "Add a Person"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
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

                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <input type="text" placeholder="address" className="form-control" {...register("userForm.address", { required: true })} autoComplete="off" defaultValue={modalData && modalData.user?.address ? modalData.user?.address : ""} />
                                        {errors.userForm?.address && errors.userForm?.address.type == "required" && <div className="field_err text-danger"><div>{C_MSG.addr_required}</div></div>}
                                    </div>
                                </div>

                                <div className="col-sm-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="customername-field" className="form-label">Roles</label>
                                        <StackSelect cClass={'roles_select_box'}
                                            cClassPrefix={'roles_select'}
                                            hideOptionOnSelect={false}
                                            closeOnSelect={true}
                                            selectType="custom2"
                                            changeFn={addUsrRole}
                                            createFn={null}
                                            creatablePosition="first"
                                            selectOptions={modalData && modalData.roles && modalData.roles.length > 0 && modalData.roles.map((item) => ({ value: item.role_id, label: item.role_name }))}
                                            selected={[]}
                                            selectedValue={usrRoles}
                                            selectPlaceholder='Select User'
                                            multi={true} />
                                        {errors.userForm?.roles && errors.userForm?.roles.type == "required" && <div className="field_err text-danger"><div>{C_MSG.user_select_required}</div></div>}
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
    if (modalType == 'add_expense_modal' || modalType == "update_expense_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_expense_modal" ? "Update Expense" : "Add Expense"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-stretch m-0">
                                <div className="col-sm-7">
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Amount</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <input type="text" placeholder="Amount" className="form-control" {...register("expenseForm.amount", { required: true,valueAsNumber:true })} autoComplete="off" defaultValue={modalData && modalData.expense?.amount ? modalData.expense?.amount : 0} onKeyUpCapture={() => GetTaxAmt()} />
                                                {errors.expenseForm?.amount && errors.expenseForm?.amount.type == "required" && <div className="field_err text-danger"><div>{C_MSG.amt_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Description</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <textarea type="text" placeholder="Description" className="form-control" {...register("expenseForm.description", { required: true})} autoComplete="off" defaultValue={modalData && modalData.expense?.description ? modalData.expense?.description : ""} ></textarea>
                                                {errors.expenseForm?.description && errors.expenseForm?.description.type == "required" && <div className="field_err text-danger"><div>{C_MSG.desc_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Vendor</label><div className="text-secondary fs-12">Optional</div></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <select className="form-control" placeholder="Select Vendor" {...register("expenseForm.merchant_id", { required: false,valueAsNumber:true  })} autoComplete="off" defaultValue={modalData && modalData.expense?.vendor_id ? modalData.expense?.vendor_id : 0}>
                                                    <option value={0}>Select Vendor</option>
                                                    {modalData && modalData?.merchants && React.Children.toArray(modalData.merchants.map((item,mIndes) => {
                                                        return <option value={item.vendor_id}>{item.vendor_name}</option>
                                                    }))}
                                                </select>
                                                {errors.expenseForm?.merchant_id && errors.expenseForm?.merchant_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.vendor_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center  mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Expense Date</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <StackCalender type="custom" className="form-control" dateFormat="DD/MM/YYYY" changeFn={(sDate, eDate) => onChangeDate(sDate, eDate)} defaultSettings={{ singleDatePicker: true, autoUpdateInput: true, autoApply: true }}>
                                                    <div className="date_box w-100">
                                                        <input type="text" className="form-control bg-white" {...register("expenseForm.date_expensed", { required: true})}  defaultValue={modalData && modalData.expense?.date_expensed ? modalData.expense?.date_expensed : ""} readOnly={true} placeholder="Expense Date" autoComplete="off" />
                                                    </div>
                                                </StackCalender>
                                                {errors.expenseForm?.date_expensed && errors.expenseForm?.date_expensed.type == "required" && <div className="field_err text-danger"><div>{C_MSG.date_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Category</label><div className="text-secondary fs-12">Optional</div></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <select className="form-control" placeholder="Select Category" {...register("expenseForm.category_id", { required: false,valueAsNumber:true })} autoComplete="off" defaultValue={modalData && modalData.expense?.category_id ? modalData.expense?.category_id : 0}>
                                                    <option value={0}>Select Category</option>
                                                    {modalData && modalData?.categories && React.Children.toArray(modalData.categories.map((item,mIndes) => {
                                                        return <option value={item.category_id}>{item.category_name}</option>
                                                    }))}
                                                </select>
                                                {errors.expenseForm?.category_id && errors.expenseForm?.category_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.category_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Tax Percent (%)</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <select className="form-control" placeholder="Select Category" {...register("expenseForm.tax_slab_id", { required: true,valueAsNumber:true })} autoComplete="off" defaultValue={modalData && modalData.expense?.tax_slab_id ? modalData.expense?.tax_slab_id : 0} onInputCapture={(e) => GetTaxAmt(e.target.value)}>
                                                    <option value={0}>Select Tax Percent</option>
                                                    {modalData && modalData?.taxSlabs && React.Children.toArray(modalData.taxSlabs.map((item,tsIndex) => {
                                                        return <option value={item.tax_slab_id}>{item.tax_percent}</option>
                                                    }))}
                                                </select>
                                                {errors.expenseForm?.tax_slab_id && errors.expenseForm?.tax_slab_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.tax_slab_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center  mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Tax Amount</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <input type="text" placeholder="Tax Amount" readOnly={true} className="form-control" {...register("expenseForm.tax_amount", { required: false,valueAsNumber:true  })} autoComplete="off" defaultValue={0} />
                                                {errors.expenseForm?.tax_amount && errors.expenseForm?.tax_amount.type == "required" && <div className="field_err text-danger"><div>{C_MSG.tax_amt_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payment Method</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <select className="form-control" placeholder="Select Category" {...register("expenseForm.payment_method_id", { required: false,valueAsNumber:true  })} autoComplete="off" defaultValue={modalData && modalData.expense?.payment_method_id ? modalData.expense?.payment_method_id : 0}>
                                                    <option value={0}>Select Payment Method</option>
                                                    {modalData && modalData?.payMethods && React.Children.toArray(modalData.payMethods.map((item,tsIndex) => {
                                                        return <option value={item.payment_method_id}>{item.payment_method}</option>
                                                    }))}
                                                </select>
                                                {errors.expenseForm?.payment_method_id && errors.expenseForm?.payment_method_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.pay_mthd_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-5">
                                    <div className="container-fluid h-100">
                                        <div id="form_file_upload_modal" className="h-100">
                                            {(() => {
                                                if (uploadfiles == null || uploadfiles.length < 1) {
                                                    return (
                                                        <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                            <input
                                                                className="fileUploadInp"
                                                                type="file"
                                                                name="file"
                                                                accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp,.msg,.eml,.zip,.ppt"
                                                                onChange={(e) => onFileChange(e)}
                                                                id="file"
                                                                data-multiple-caption="{count} files selected"
                                                                multiple={false}
                                                            />
                                                            <i className="fa fa-upload" aria-hidden="true"></i>
                                                            <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                            <label htmlFor="file"><strong>({C_MSG.supported_file_format})</strong></label>
                                                            {msgError && <p className="text-danger p-2">{msgError}</p>}
                                                        </div>
                                                    )

                                                } else {
                                                    return (
                                                        <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                            <div className="uploadsList my-2 text-center">
                                                                {uploadfiles && uploadfiles.length > 0 && uploadfiles.map((file, fIndex) => {
                                                                    return (
                                                                        <div key={fIndex} className="file_card position-relative">
                                                                            {/* {(() => {
                                                                                if (isImg(file)) {
                                                                                    return <span className=""><img src={getFileUrl(file)} className="img-fluid" /></span>
                                                                                } else {
                                                                                    return <span className=""><img src={`/assets/img/document.png`} className="img-fluid" /></span>
                                                                                }
                                                                            })()} */}
                                                                            {getFileName(file)}
                                                                            <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex)}><i className="fa fa-times"></i></span>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                            <div className="taskDetails_btn_block px-3">
                                                                <div className="card_button_block ">
                                                                    {/* <Button className="btn_2 btn_wide " variant="outline-dark" onClick={() => onUploadDocuments()}>Upload</Button> */}
                                                                    {fileUploadSuccess && <span className="text-success">{C_MSG.file_upload_success}</span>}
                                                                </div>
                                                            </div>
                                                            <Loader showLoader={showLoader}></Loader>
                                                        </div>
                                                    )

                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                
                                
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-start px-3">
                                <div className="">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_expense_modal" ? "Update" : "Submit"}</button>
                                </div>
                                {
                                    modalType != "update_expense_modal" && 
                                    <div className="ml-3">
                                        <span className="btn btn-success" onClick={handleSubmit((data) => onSubmit(data,"save"))} disabled={formSubmitted}>Save</span>
                                    </div>
                                }
                                
                                <div className="ml-3">
                                    <span className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</span>
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

    if (modalType == 'view_expense_modal') {
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
                        <Modal.Title >
                            <div className="fs-18 px-2">Expense of {modalData?.amount}</div>
                            <div className="fs-12 px-2"><span className={`badge badge-primary ${modalData?.status_id == 1 ? "bg_color_5" : (modalData?.status_id == 2 ? "bg_color_6" : (modalData?.status_id == 3 ? "bg_color_7" : (modalData?.status_id == 4 ? "bg_color_4" : "" ) ) ) }`}>{modalData?.status}</span></div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <div className="row align-items-stretch m-0">
                            <div className="col-sm-12">
                                <div className="expense_detail_block fs-14">
                                    <div className="row m-0 px-2">
                                        <p className="m-0 fw-800 fs-22">{modalData?.amount} INR</p>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="row m-0 px-2">
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Project</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.project?.name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Vendor</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.vendor_name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Expense date</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.date_expensed || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Category</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.category_name || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Tax percentage (%)</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.tax_percent || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Tax amount (INR)</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.tax_amount || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payment method</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.payment_method || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Comment</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.comment || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Attachment</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_receipt  == "Y" ? modalData?.file_paths != null && <a className="link_url" href={modalData?.file_paths} target="_blank"><i class="fa fa-sticky-note text_color_5 fs-18"></i></a> : "Not Set"}</span></div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
    if (modalType == 'view_activity_modal') {
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
                        <Modal.Title >
                            <div className="fs-18 px-2">Activity</div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <div className="row align-items-stretch m-0">
                            <div className="col-sm-12">
                                <div className="expense_detail_block fs-14">
                                    {/* <div className="row m-0">
                                        <p className="m-0 fw-800 fs-16 p-0">Expense Information</p>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="row m-0 px-2">
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Expensi Id</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_id || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">User</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.first_name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Approver</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.submitted_by || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Expense date</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.date_expensed || "Not Set"}</span></div>
                                    </div>
                                    <hr className="my-3" /> */}
                                    <div className="row m-0">
                                        <p className="m-0 fw-500 fs-16 p-0">Activity Information</p>
                                    </div>
                                    <hr className="my-3" />
                                    {modalData?.activity && modalData?.activity.length > 0 && React.Children.toArray(modalData?.activity.map((item,aKey) => {
                                        return (
                                            <React.Fragment>
                                                <div className="d-flex align-items-center py-2">
                                                    <div className="col-auto">
                                                        <span class="mdi mdi-chart-timeline-variant"></span>
                                                    </div>
                                                    <div className="col pl-0">
                                                        <div className="acitivity-info">
                                                            <p className="m-0 p-0 fw-600">{item.expense_state}</p>
                                                            <p className="m-0 p-0">
                                                                <span>{item.action_date}&nbsp;-&nbsp;{item.action_takenby}&nbsp;-&nbsp;{item.status}</span>
                                                            </p>
                                                            <p className="m-0 p-0">
                                                                <span className="d-block">{item.change_comment}</span>
                                                                <span className="d-block">{item.reject_reason}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                </div>
                                            </React.Fragment>
                                        )
                                    }))}
                                </div>
                                
                            </div>
                            <div className="col-sm-5">

                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    if (modalType == 'reject_expense_modal') {
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
                        <Modal.Title className="fs-12">Reject Expense</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <select className="form-control" placeholder="Select Reason" {...register("rejectExpenseForm.reject_reason_id", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={''}>
                                            <option value={0}>Select Reject Reason</option>
                                            {modalData && modalData?.rejectReasons && React.Children.toArray(modalData.rejectReasons.map((item, mIndes) => {
                                                return <option value={item.reason_id}>{item.reason}</option>
                                            }))}
                                        </select>
                                        {errors.rejectExpenseForm?.reject_reason_id && errors.rejectExpenseForm?.reject_reason_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <textarea className="form-control" {...register("rejectExpenseForm.comment", { required: true})}></textarea>
                                        {errors.rejectExpenseForm?.comment && errors.rejectExpenseForm?.comment.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>Submit</button>
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
    
    if (modalType == 'approve_expense_modal') {
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
                        <Modal.Title className="fs-12">Approve Expense</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <textarea className="form-control" {...register("approveExpenseForm.comment", { required: true})}></textarea>
                                        {errors.approveExpenseForm?.comment && errors.approveExpenseForm?.comment.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>Submit</button>
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
    if (modalType == 'transfer_expense_modal') {
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
                        <Modal.Title className="fs-12">Transfer Expense</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <textarea className="form-control" {...register("transferExpenseForm.comment", { required: true})}></textarea>
                                        {errors.transferExpenseForm?.comment && errors.transferExpenseForm?.comment.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>Submit</button>
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
    if (modalType == 'process_expense_modal') {
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
                        <Modal.Title className="fs-12">Process Expense</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <select className="form-control" placeholder="Select Payment Method" {...register("processExpenseForm.user_account_id", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={0}>
                                            <option value={0}>Select Payee Bank Account</option>
                                            {modalData && modalData?.payeeBankAccounts && React.Children.toArray(modalData.payeeBankAccounts.map((item, tsIndex) => {
                                                return <option value={item.account_id}>{item.bank_name} ({item.account_no})-{item.ifsc_code}</option>
                                            }))}
                                        </select>
                                        {errors.processExpenseForm?.user_account_id && errors.processExpenseForm?.user_account_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <select className="form-control" placeholder="Select Payment Method" {...register("processExpenseForm.payment_method_id", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={0} onChangeCapture={(e) => onChangePayMethod(e.target.value)}>
                                            <option value={0}>Select Payment Method</option>
                                            {modalData && modalData?.payMethods && React.Children.toArray(modalData.payMethods.map((item, tsIndex) => {
                                                return <option value={item.payment_method_id}>{item.payment_method}</option>
                                            }))}
                                        </select>
                                        {errors.processExpenseForm?.payment_method_id && errors.processExpenseForm?.payment_method_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.pay_mthd_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <input type="text" className="form-control" {...register("processExpenseForm.transaction_id", { required: true})} placeholder="Transaction Id" readOnly={form?.processExpenseForm?.payment_method_id == 1 ? true : false} />
                                        {errors.processExpenseForm?.transaction_id && errors.processExpenseForm?.transaction_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <StackCalender type="custom" className="form-control" dateFormat="DD/MM/YYYY" changeFn={(sDate, eDate) => onChangeDate(sDate, eDate, { type: "clearance_date" })} defaultSettings={{ singleDatePicker: true, autoUpdateInput: true, autoApply: true }}>
                                            <div className="date_box w-100">
                                                <input type="text" className="form-control bg-white" {...register("processExpenseForm.clearance_date", { required: true })} defaultValue={modalData && modalData.expense?.clearance_date ? modalData.expense?.clearance_date : ""} readOnly={true} placeholder="Clearance Date" autoComplete="off" />
                                            </div>
                                        </StackCalender>
                                        {errors.processExpenseForm?.clearance_date && errors.processExpenseForm?.clearance_date.type == "required" && <div className="field_err text-danger"><div>{C_MSG.date_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <select className="form-control" placeholder="Select Payment Method" {...register("processExpenseForm.project_bank_id", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={0}>
                                            <option value={0}>Select Payer Bank Account</option>
                                            {modalData && modalData?.payerBankAccounts && React.Children.toArray(modalData.payerBankAccounts.map((item, tsIndex) => {
                                                return <option value={item.bank_id}>{item.bank_name} ({item.account_holder_name}) ({item.account_number})-{item.ifsc_code}</option>
                                            }))}
                                        </select>
                                        {errors.processExpenseForm?.project_bank_id && errors.processExpenseForm?.project_bank_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group mb-0">
                                        <textarea className="form-control" {...register("processExpenseForm.comment", { required: true})}></textarea>
                                        {errors.processExpenseForm?.comment && errors.processExpenseForm?.comment.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>Submit</button>
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

    if (modalType == 'add_invoice_modal' || modalType == "update_invoice_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_invoice_modal" ? "Update Expense" : "Add Expense"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-stretch m-0">
                                <div className="col-sm-12">
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payee Name</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <input type="text" placeholder="Name" className="form-control" {...register("invoiceForm.payee_name", { required: true })} autoComplete="off" defaultValue={modalData && modalData.invoice?.payee_name ? modalData.invoice?.payee_name : ""} />
                                                {errors.invoiceForm?.payee_name && errors.invoiceForm?.payee_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.payee_name_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payee GST</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <input type="text" placeholder="GST" className="form-control" {...register("invoiceForm.payee_gst", { required: true })} autoComplete="off" defaultValue={modalData && modalData.invoice?.payee_gst ? modalData.invoice?.payee_gst : ""} />
                                                {errors.invoiceForm?.payee_gst && errors.invoiceForm?.payee_gst.type == "required" && <div className="field_err text-danger"><div>{C_MSG.payee_gst_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Invoice Number</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <input type="text" placeholder="Invoice Number" className="form-control" {...register("invoiceForm.invoice_no", { required: true })} autoComplete="off" defaultValue={modalData && modalData.invoice?.invoice_no ? modalData.invoice?.invoice_no : ""} />
                                                {errors.invoiceForm?.invoice_no && errors.invoiceForm?.invoice_no.type == "required" && <div className="field_err text-danger"><div>{C_MSG.payee_invoice_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Description</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <textarea type="text" placeholder="Description" className="form-control" {...register("invoiceForm.description", { required: true})} autoComplete="off" defaultValue={modalData && modalData.expense?.description ? modalData.expense?.description : ""} ></textarea>
                                                {errors.invoiceForm?.description && errors.invoiceForm?.description.type == "required" && <div className="field_err text-danger"><div>{C_MSG.desc_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Amount</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <input type="text" placeholder="Amount" className="form-control" {...register("invoiceForm.amount", { required: true,valueAsNumber:true  })} autoComplete="off" defaultValue={modalData && modalData.invoice?.amount ? modalData.invoice?.amount : 0} onKeyUpCapture={() => GetTotalAmt()} />
                                                {errors.invoiceForm?.amount && errors.invoiceForm?.amount.type == "required" && <div className="field_err text-danger"><div>{C_MSG.amt_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center  mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Tax Amount</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <input type="text" placeholder="Tax Amount" className="form-control" {...register("invoiceForm.tax_amount", { required: true ,valueAsNumber:true })} autoComplete="off" defaultValue={modalData && modalData.invoice?.tax_amount ? modalData.invoice?.tax_amount : 0} onKeyUpCapture={() => GetTotalAmt()} />
                                                {errors.invoiceForm?.tax_amount && errors.invoiceForm?.tax_amount.type == "required" && <div className="field_err text-danger"><div>{C_MSG.tax_amt_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center  mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Total Amount</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <input type="text" placeholder="Total Amount" readOnly={true} className="form-control" {...register("invoiceForm.total_amount", { required: true })} autoComplete="off" defaultValue={0} />
                                                {errors.invoiceForm?.total_amount && errors.invoiceForm?.total_amount.type == "required" && <div className="field_err text-danger"><div>{C_MSG.tax_amt_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="row m-0 align-items-center  mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Invoice Date</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <StackCalender type="custom" className="form-control" dateFormat="DD/MM/YYYY" changeFn={(sDate, eDate) => onChangeDate(sDate, eDate,{type:"invoice_date"})} defaultSettings={{ singleDatePicker: true, autoUpdateInput: true, autoApply: true }}>
                                                    <div className="date_box w-100">
                                                        <input type="text" className="form-control bg-white" {...register("invoiceForm.invoice_date", { required: true})}  defaultValue={modalData && modalData.expense?.invoice_date ? modalData.expense?.invoice_date : ""} readOnly={true} placeholder="Expense Date" autoComplete="off" />
                                                    </div>
                                                </StackCalender>
                                                {errors.invoiceForm?.invoice_date && errors.invoiceForm?.invoice_date.type == "required" && <div className="field_err text-danger"><div>{C_MSG.date_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row m-0 align-items-center  mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Received Date</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <StackCalender type="custom" className="form-control" dateFormat="DD/MM/YYYY" changeFn={(sDate, eDate) => onChangeDate(sDate, eDate, {type:"received_date"})} defaultSettings={{ singleDatePicker: true, autoUpdateInput: true, autoApply: true }}>
                                                    <div className="date_box w-100">
                                                        <input type="text" className="form-control bg-white" {...register("invoiceForm.received_date", { required: true})}  defaultValue={modalData && modalData.expense?.received_date ? modalData.expense?.received_date : ""} readOnly={true} placeholder="Expense Date" autoComplete="off" />
                                                    </div>
                                                </StackCalender>
                                                {errors.invoiceForm?.received_date && errors.invoiceForm?.received_date.type == "required" && <div className="field_err text-danger"><div>{C_MSG.date_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                   

                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payment Method</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <select className="form-control" placeholder="Select Category" {...register("invoiceForm.payment_method_id", { required: false,valueAsNumber:true  })} autoComplete="off" defaultValue={modalData && modalData.expense?.payment_method_id ? modalData.expense?.payment_method_id : 0}>
                                                    <option value={0}>Select Payment Method</option>
                                                    {modalData && modalData?.payMethods && React.Children.toArray(modalData.payMethods.map((item,tsIndex) => {
                                                        return <option value={item.payment_method_id}>{item.payment_method}</option>
                                                    }))}
                                                </select>
                                                {errors.invoiceForm?.payment_method_id && errors.invoiceForm?.payment_method_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.pay_mthd_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-start px-3">
                                <div className="">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_invoice_modal" ? "Update" : "Submit"}</button>
                                </div>
                                <div className="ml-3">
                                    <span className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</span>
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

    if (modalType == 'view_invoice_modal') {
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
                        <Modal.Title >
                            <div className="fs-18 px-2">Invoice of {modalData?.payee_name}</div>
                            {/* <div className="fs-12 px-2"><span className={`badge badge-primary ${modalData?.status_id == 1 ? "bg_color_5" : (modalData?.status_id == 2 ? "bg_color_6" : (modalData?.status_id == 3 ? "bg_color_7" : (modalData?.status_id == 4 ? "bg_color_4" : "" ) ) ) }`}>{modalData?.status}</span></div> */}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <div className="row align-items-stretch m-0">
                            <div className="col-sm-12">
                                <div className="expense_detail_block fs-14">
                                    <div className="row m-0 px-2">
                                        <p className="m-0 fw-800 fs-22">{modalData?.total_amount} INR</p>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="row m-0 px-2">
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payee</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.payee_name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">GST</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.payee_gst || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Invoice Number</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.invoice_no || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Invoice date</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.invoice_date || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Received date</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.received_date || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Amount</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.amount || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Tax Amount</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.tax_amount || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Total Amount</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.total_amount || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Project</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.project?.name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payment method</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.payment_method || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Submitted By</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.created_by || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Description</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.description || "Not Set"}</span></div>
                                        
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    if (modalType == 'create_bank_account_modal' || modalType == "update_bank_account_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_bank_account_modal" ? "Update" : "New"} Bank Account</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectName-field" className="form-label">Account Holder Name</label>
                                    <input type="text" className="form-control" placeholder="Enter Name" {...register("bankAccForm.account_holder_name", { required: true })} defaultValue={modalData && modalData?.account?.account_holder_name ? modalData?.account?.account_holder_name : ""} />
                                    {errors && errors.bankAccForm && errors.bankAccForm?.account_holder_name && errors.bankAccForm.account_holder_name?.type == "required" && <div className="field_err text-danger">{C_MSG.acc_holder_name_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectName-field" className="form-label">Account Number</label>
                                    <input type="text" className="form-control" placeholder="Enter Account Number" {...register("bankAccForm.account_number", { required: true })} defaultValue={modalData && modalData?.account?.account_number ? modalData?.account?.account_number : ""} />
                                    {errors && errors.bankAccForm && errors.bankAccForm?.account_number && errors.bankAccForm.account_number?.type == "required" && <div className="field_err text-danger">{C_MSG.acc_no_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectDesc-field" className="form-label">Bank Name</label>
                                    <input type="text" className="form-control" placeholder="Enter Bank Name" {...register("bankAccForm.bank_name", { required: true })} defaultValue={modalData && modalData?.account?.bank_name ? modalData?.account?.bank_name : ""} />
                                    {errors && errors.bankAccForm && errors.bankAccForm?.bank_name && errors.bankAccForm.bank_name?.type == "required" && <div className="field_err text-danger">{C_MSG.bank_name_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectDesc-field" className="form-label">Branch Name</label>
                                    <input type="text" className="form-control" placeholder="Enter Branch Name" {...register("bankAccForm.branch_name", { required: true })} defaultValue={modalData && modalData?.account?.branch_name ? modalData?.account?.branch_name : ""} />
                                    {errors && errors.bankAccForm && errors.bankAccForm?.branch_name && errors.bankAccForm.branch_name?.type == "required" && <div className="field_err text-danger">{C_MSG.branch_name_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectDesc-field" className="form-label">IFSC Code</label>
                                    <input type="text" className="form-control" placeholder="Enter IFSC Code" {...register("bankAccForm.ifsc_code", { required: true })} defaultValue={modalData && modalData?.account?.ifsc_code ? modalData?.account?.ifsc_code : ""} />
                                    {errors && errors.bankAccForm && errors.bankAccForm?.ifsc_code && errors.bankAccForm.ifsc_code?.type == "required" && <div className="field_err text-danger">{C_MSG.ifsc_code_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectDesc-field" className="form-label">Swift Code</label>
                                    <input type="text" className="form-control" placeholder="Enter Swift Code" {...register("bankAccForm.swift_code", { required: false })} defaultValue={modalData && modalData?.account?.swift_code ? modalData?.account?.swift_code : ""} />
                                    {errors && errors.bankAccForm && errors.bankAccForm?.swift_code && errors.bankAccForm.swift_code?.type == "required" && <div className="field_err text-danger">{C_MSG.swift_code_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectDesc-field" className="form-label">Account Type</label>
                                    <select className="form-control" placeholder="Select Vendor" {...register("bankAccForm.account_type", { required: true})} autoComplete="off" defaultValue={modalData && modalData.account?.account_type ? modalData.account?.account_type : 0}>
                                        <option value={""}>Select Account Type</option>
                                        <option value={"Savings"}>Savings Account</option>
                                        <option value={"Current"}>Current Account</option>
                                        
                                    </select>
                                    {errors && errors.bankAccForm && errors.bankAccForm?.account_type && errors.bankAccForm.account_type?.type == "required" && <div className="field_err text-danger">{C_MSG.account_type_required}</div>}
                                </div>
                                <div className="col-sm-12 mb-3">
                                    <label htmlFor="projectDesc-field" className="form-label">UPI Id</label>
                                    <input type="text" className="form-control" placeholder="Enter Swift Code" {...register("bankAccForm.upi_id", { required: false })} defaultValue={modalData && modalData?.account?.upi_id ? modalData?.account?.upi_id : ""} />
                                    {errors && errors.bankAccForm && errors.bankAccForm?.upi_id && errors.bankAccForm.upi_id?.type == "required" && <div className="field_err text-danger">{C_MSG.upi_id_required}</div>}
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_bank_account_modal" ? "Update" : "Create"}</button>
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

    if (modalType == 'add_transaction_log' || modalType == "update_transaction_log") {
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
                        <Modal.Title className="fs-12">{modalType == "update_transaction_log" ? "Update Transaction Log" : "Add Transaction Log"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-stretch m-0">
                                <div className="col-sm-12">
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payee Type</label></div>
                                        <div className="col-sm-8 p-0">
                                            <div className="form-group mb-0">
                                                <select className="form-control" placeholder="Select Payee Type" {...register("logTransactionForm.payee_type", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={0}>
                                                    <option value={0}>Select Payee Bank Account</option>
                                                    <option value={1}>Employee</option>
                                                    <option value={2}>Vendor</option>
                                                </select>
                                                {errors.logTransactionForm?.payee_type && errors.logTransactionForm?.payee_type.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                            </div>
                                        </div>
                                    </div>
                                    {form?.logTransactionForm && form?.logTransactionForm.payee_type == 1 && 
                                        <React.Fragment>
                                            <div className="row m-0 align-items-center mb-3">
                                                <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payee</label></div>
                                                <div className="col-sm-8 p-0">
                                                    <div className="form-group mb-0">
                                                        <select className="form-control" placeholder="Select Payment Method" {...register("logTransactionForm.user_id", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={""} onChangeCapture={(e) => modalData.listPayeeBankAccounts(e.target.value)}>
                                                            <option value={""}>Select Payee</option>
                                                            {modalData && modalData?.payees && React.Children.toArray(modalData.payees.map((item, tsIndex) => {
                                                                return <option value={item.user_id}>{item.fullname}</option>
                                                            }))}
                                                        </select>
                                                        {errors.logTransactionForm?.user_id && errors.logTransactionForm?.user_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row m-0 align-items-center mb-3">
                                                <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payee Account</label></div>
                                                <div className="col-sm-8 p-0">
                                                    <div className="form-group mb-0">
                                                        <select className="form-control" placeholder="Select Payment Method" {...register("logTransactionForm.user_account_id", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={""} onChangeCapture={() => modalData.listPayeeBankAccounts()}>
                                                            <option value={""}>Select Payee Account</option>
                                                            {modalData && modalData?.payeeAccounts && React.Children.toArray(modalData.payeeAccounts.map((item, tsIndex) => {
                                                                return <option value={item.account_id}>{item.bank_name} ({item.account_no})-{item.ifsc_code}</option>
                                                            }))}
                                                        </select>
                                                        {errors.logTransactionForm?.user_account_id && errors.logTransactionForm?.user_account_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    }
                                    {form?.logTransactionForm && form?.logTransactionForm.payee_type == 2 && 
                                        <React.Fragment>
                                            <div className="row m-0 align-items-center mb-3">
                                                <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Vendor</label></div>
                                                <div className="col-sm-8 p-0">
                                                    <div className="form-group mb-0">
                                                        <select className="form-control" placeholder="Select Vendor" {...register("logTransactionForm.merchant_id", { required: false, valueAsNumber: true })} autoComplete="off" defaultValue={modalData && modalData.expense?.vendor_id ? modalData.expense?.vendor_id : 0}>
                                                            <option value={0}>Select Vendor</option>
                                                            {modalData && modalData?.merchants && React.Children.toArray(modalData.merchants.map((item, mIndes) => {
                                                                return <option value={item.vendor_id}>{item.vendor_name}</option>
                                                            }))}
                                                        </select>
                                                        {errors.logTransactionForm?.merchant_id && errors.logTransactionForm?.merchant_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.vendor_required}</div></div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    }
                                    {form?.logTransactionForm && (form?.logTransactionForm.payee_type == 1 || form?.logTransactionForm.payee_type == 2) && 
                                        <React.Fragment>
                                            <div className="row m-0 align-items-center mb-3">
                                                <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Amount</label></div>
                                                <div className="col-sm-8 p-0">
                                                    <div className="form-group mb-0">
                                                        <input type="text" placeholder="Amount" className="form-control" {...register("logTransactionForm.amount", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={modalData && modalData.expense?.amount ? modalData.expense?.amount : 0} />
                                                        {errors.logTransactionForm?.amount && errors.logTransactionForm?.amount.type == "required" && <div className="field_err text-danger"><div>{C_MSG.amt_required}</div></div>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row m-0 align-items-center mb-3">
                                                <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Description</label></div>
                                                <div className="col-sm-8 p-0">
                                                    <div className="form-group mb-0">
                                                        <textarea type="text" placeholder="Description" className="form-control" {...register("logTransactionForm.description", { required: true })} autoComplete="off" defaultValue={modalData && modalData.expense?.description ? modalData.expense?.description : ""} ></textarea>
                                                        {errors.logTransactionForm?.description && errors.logTransactionForm?.description.type == "required" && <div className="field_err text-danger"><div>{C_MSG.desc_required}</div></div>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row m-0 align-items-center mb-3">
                                                <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payment Method</label></div>
                                                <div className="col-sm-8 p-0">
                                                    <div className="form-group mb-0">
                                                        <select className="form-control" placeholder="Select Category" {...register("logTransactionForm.payment_method_id", { required: false, valueAsNumber: true })} autoComplete="off" defaultValue={modalData && modalData.expense?.payment_method_id ? modalData.expense?.payment_method_id : ""} onChangeCapture={(e) => onChangePayMethod(e.target.value)}>
                                                            <option value={""}>Select Payment Method</option>
                                                            {modalData && modalData?.payMethods && React.Children.toArray(modalData.payMethods.map((item, tsIndex) => {
                                                                return <option value={item.payment_method_id}>{item.payment_method}</option>
                                                            }))}
                                                        </select>
                                                        {errors.logTransactionForm?.payment_method_id && errors.logTransactionForm?.payment_method_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.pay_mthd_required}</div></div>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row m-0 align-items-center mb-3">
                                                <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Payer Bank</label></div>
                                                <div className="col-sm-8 p-0">
                                                    <div className="form-group mb-0">
                                                        <select className="form-control" placeholder="Select Payment Method" {...register("logTransactionForm.project_bank_id", { required: true, valueAsNumber: true })} autoComplete="off" defaultValue={""}>
                                                            <option value={""}>Select Payer Bank Account</option>
                                                            {modalData && modalData?.payerBankAccounts && React.Children.toArray(modalData.payerBankAccounts.map((item, tsIndex) => {
                                                                return <option value={item.bank_id}>{item.bank_name} ({item.account_holder_name}) ({item.account_number})-{item.ifsc_code}</option>
                                                            }))}
                                                        </select>
                                                        {errors.logTransactionForm?.project_bank_id && errors.logTransactionForm?.project_bank_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row m-0 align-items-center  mb-3">
                                                <div className="col-sm-4 p-0"> <label className="m-0 fs-14">Transaction ID</label></div>
                                                <div className="col-sm-8 p-0">
                                                    <div className="form-group mb-0">
                                                        <input type="text" placeholder="Transaction ID" className="form-control" {...register("logTransactionForm.transaction_id", { required: true })} autoComplete="off" defaultValue={""} />
                                                        {errors.logTransactionForm?.transaction_id && errors.logTransactionForm?.transaction_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    }
                                    
                                </div>
                                
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-start px-3">
                                <div className="">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_expense_modal" ? "Update" : "Submit"}</button>
                                </div>
                                <div className="ml-3">
                                    <span className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</span>
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

    if (modalType == "update_request_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_request_modal" && modalData?.status == 1 ? "Aceept Request" : "Reject Request"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-12 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="customername-field" className="form-label">Roles</label>
                                        <StackSelect cClass={'roles_select_box'}
                                            cClassPrefix={'roles_select'}
                                            hideOptionOnSelect={false}
                                            closeOnSelect={true}
                                            selectType="custom2"
                                            changeFn={addUsrRole}
                                            createFn={null}
                                            creatablePosition="first"
                                            selectOptions={modalData && modalData.roles && modalData.roles.length > 0 && modalData.roles.map((item) => ({ value: item.role_id, label: item.role_name }))}
                                            selected={[]}
                                            selectedValue={usrRoles}
                                            selectPlaceholder='Select User'
                                            multi={true} />
                                        {errors.requestForm?.roles && errors.requestForm?.roles.type == "required" && <div className="field_err text-danger"><div>{C_MSG.user_select_required}</div></div>}
                                    </div>
                                </div>
                                
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_request_modal" ? "Update" : "Create"}</button>
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

    if (modalType == 'view_log_transaction_modal') {
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
                        <Modal.Title >
                            <div className="fs-18 px-2">Transaction Log Details</div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <div className="row align-items-stretch m-0">
                            <div className="col-sm-12">
                                <div className="row m-0 px-2">
                                    <p className="m-0 fw-800 fs-20">Transaction Id - {modalData?.transaction_id}</p>
                                </div>
                                <hr className="my-3" />
                                <div className="expense_detail_block fs-14">
                                    <div className="row m-0 px-2">
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payee</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.transferred_touser || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payee Bank</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.receiver_bank_name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payee Bank Account Number</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.receiver_bank_account || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payee Branch Name</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.receiver_branch_name || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">payer</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.transferred_by || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payer Bank</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.sender_bank_name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payer Bank Account Number</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.sender_bank_account || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payment Method</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.payment_method || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Clearance Date</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.clearance_date || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Description</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.description || "Not Set"}</span></div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
    if (modalType == 'view_expense_ledger_modal') {
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
                        <Modal.Title >
                            <div className="fs-18 px-2">Expense of {modalData?.amount}</div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <div className="row align-items-stretch m-0">
                            <div className="col-sm-12">
                                <div className="row m-0 px-2">
                                    <p className="m-0 fw-800 fs-22">{modalData?.amount} INR</p>
                                </div>
                                <hr className="my-3" />
                                <div className="expense_detail_block fs-14">
                                    <div className="row m-0 px-2">

                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Project</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.project?.name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Expense date</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.date_expensed || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payment method</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.payment_method || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payee Bank</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.receiver_bank_name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payee Bank Account Number</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.receiver_bank_account || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payee Branch Name</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.receiver_branch_name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Clearance Date</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.clearance_date || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">payer</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.transferred_by || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payer Bank</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.sender_bank_name || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Payer Bank Account Number</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.sender_bank_account || "Not Set"}</span></div>
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Transaction Id</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.transaction_id || "Not Set"}</span></div>
                                        
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Description</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.description || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Comment</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_details?.comment || "Not Set"}</span></div>
                                        <hr className="my-3" />
                                        <div className="col-sm-4 pl-0 py-2"><label className="m-0">Attachment</label></div>
                                        <div className="col-sm-8 pr-0 py-2"><span>{modalData?.expense_receipt  == "Y" && modalData?.file_paths != null ? (<a className="link_url" href={modalData?.file_paths} target="_blank"><i class="fa fa-sticky-note text_color_5 fs-18"></i></a>) : "No Attachment"}</span></div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    if (modalType == 'add_payee_modal' || modalType == "update_payee_modal") {
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
                        <Modal.Title className="fs-12">{modalType == "update_payee_modal" ? "Update Payee" : "Add Payee"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-stretch m-0">
                                <div className="col-sm-12">
                                    <div className="row m-0 align-items-center mb-3">
                                        <div className="col-sm-12 px-0"> 
                                            <label className="fs-14">Type</label>
                                            <div className="form-group">
                                                <select className="form-control" placeholder="Select Title" {...register("payeeForm.user_type", { required: true,})} autoComplete="off" defaultValue={modalData && (modalData.payee?.user_type || modalData.payee?.type_id) ? (modalData.payee?.user_type || modalData.payee?.type_id)  : ""}>
                                                    <option value={""}>Select User Type</option>
                                                    {modalData && modalData?.userTypes && React.Children.toArray(modalData.userTypes.map((item,uIndex) => {
                                                        return <option value={item.type_id}>{item.user_type}</option>
                                                    }))}
                                                </select>
                                                {errors.payeeForm?.user_type && errors.payeeForm?.user_type.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <Accordion defaultActiveKey="0">
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>Name and contact</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="row m-0 align-items-center mb-3">
                                                    {form?.payeeForm?.user_type != 3  && 
                                                        <React.Fragment>
                                                            <div className="col-sm-6">
                                                                <label className="fs-14">Company Name</label>
                                                                <div className="form-group mb-0">
                                                                    <input type="text" placeholder="Company Name" className="form-control" {...register("payeeForm.company_name", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.company_name ? modalData.payee?.company_name : ""} />
                                                                    {errors.payeeForm?.company_name && errors.payeeForm?.company_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                                </div>
                                                            </div>
                                                        </React.Fragment>
                                                    }
                                                    
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">{form?.payeeForm?.user_type == 1 ? "Customer" : (form?.payeeForm?.user_type == 3 ? "Employee" : "")} Display Name</label>
                                                        <div className="form-group mb-0">
                                                            <input type="text" placeholder="Display Name" className="form-control" {...register("payeeForm.display_name", { required: true })} autoComplete="off" defaultValue={modalData && modalData.payee?.display_name ? modalData.payee?.display_name : ""} />
                                                            {errors.payeeForm?.display_name && errors.payeeForm?.display_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row m-0 align-items-center mb-3">
                                                    <div className="col-sm-3">
                                                        <label className="fs-14">Title</label>
                                                        <div className="form-group mb-0">
                                                            {/* <input type="text" placeholder="Title" className="form-control" {...register("payeeForm.title", { required: true })} autoComplete="off" defaultValue={modalData && modalData.payee?.title ? modalData.payee?.title : ""} /> */}
                                                            <select className="form-control" placeholder="Select Title" {...register("payeeForm.title", { required: true, })} autoComplete="off" defaultValue={modalData && modalData.payee?.title ? modalData.payee?.title : ""}>
                                                                <option value={""}>Select Title</option>
                                                                <option value={"mr."}>Mr.</option>
                                                                <option value={"mrs."}>Mrs.</option>
                                                                <option value={"miss"}>Miss</option>
                                                            </select>
                                                            {errors.payeeForm?.title && errors.payeeForm?.title.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-3">
                                                        <label className="fs-14">First Name</label>
                                                        <div className="form-group mb-0">
                                                            <input type="text" placeholder="First Name" className="form-control" {...register("payeeForm.first_name", { required: true })} autoComplete="off" defaultValue={modalData && modalData.payee?.first_name ? modalData.payee?.first_name : ""} />
                                                            {errors.payeeForm?.first_name && errors.payeeForm?.first_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    {form?.payeeForm?.user_type != 3  && 
                                                        <React.Fragment>
                                                            <div className="col-sm-3">
                                                                <label className="fs-14">Middle Name</label>
                                                                <div className="form-group mb-0">
                                                                    <input type="text" placeholder="Middle Name" className="form-control" {...register("payeeForm.middle_name", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.middle_name ? modalData.payee?.middle_name : ""} />
                                                                    {errors.payeeForm?.middle_name && errors.payeeForm?.middle_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                                </div>
                                                            </div>
                                                        </React.Fragment>
                                                    }
                                                    
                                                    <div className="col-sm-3">
                                                        <label className="fs-14">Last Name</label>
                                                        <div className="form-group mb-0">
                                                            <input type="text" placeholder="Last Name" className="form-control" {...register("payeeForm.last_name", { required: true })} autoComplete="off" defaultValue={modalData && modalData.payee?.last_name ? modalData.payee?.last_name : ""} />
                                                            {errors.payeeForm?.last_name && errors.payeeForm?.last_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row m-0 align-items-center mb-3">
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Email</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Email" className="form-control" {...register("payeeForm.email", { required: true })} autoComplete="off" defaultValue={modalData && modalData.payee?.email ? modalData.payee?.email : ""} />
                                                            {errors.payeeForm?.email && errors.payeeForm?.email.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="m-0 fs-14">Phone Number</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Phone Number" className="form-control" {...register("payeeForm.phone_number", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.phone_number ? modalData.payee?.phone_number : ""} />
                                                            {errors.payeeForm?.phone_number && errors.payeeForm?.phone_number.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="m-0 fs-14">Mobile Number</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Mobile Number" className="form-control" {...register("payeeForm.mobile_number", { required: true })} autoComplete="off" defaultValue={modalData && modalData.payee?.mobile_number ? modalData.payee?.mobile_number : ""} />
                                                            {errors.payeeForm?.mobile_number && errors.payeeForm?.mobile_number.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>

                                                    {form?.payeeForm?.user_type != 3  && 
                                                        <React.Fragment>
                                                            <div className="col-sm-6">
                                                                <label className="fs-14">Fax</label>
                                                                <div className="form-group">
                                                                    <input type="text" placeholder="Fax" className="form-control" {...register("payeeForm.fax", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.fax ? modalData.payee?.fax : ""} />
                                                                    {errors.payeeForm?.fax && errors.payeeForm?.fax.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <label className="m-0 fs-14">Other</label>
                                                                <div className="form-group">
                                                                    <input type="text" placeholder="Other" className="form-control" {...register("payeeForm.other", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.other ? modalData.payee?.other : ""} />
                                                                    {errors.payeeForm?.other && errors.payeeForm?.other.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                                </div>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                <label className="m-0 fs-14">Website</label>
                                                                <div className="form-group">
                                                                    <input type="text" placeholder="Website" className="form-control" {...register("payeeForm.website", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.website ? modalData.payee?.website : ""} />
                                                                    {errors.payeeForm?.website && errors.payeeForm?.website.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                                </div>
                                                            </div>
                                                        </React.Fragment>
                                                    }
                                                    
                                                    <div className="col-sm-12">
                                                        <label className="m-0 fs-14">Name to print on checks</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="" className="form-control" {...register("payeeForm.print_name", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.display_name ? modalData.payee?.display_name : ""} />
                                                            {errors.payeeForm?.print_name && errors.payeeForm?.print_name.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="1" className="mt-4">
                                            <Accordion.Header>Address</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="row m-0 align-items-center mb-3">
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Street address 1</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Street address 1" className="form-control" {...register("payeeForm.street_address1", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.street_address1 ? modalData.payee?.street_address1 : ""} />
                                                            {errors.payeeForm?.street_address1 && errors.payeeForm?.street_address1.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Street address 2</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Street address 2" className="form-control" {...register("payeeForm.street_address2", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.street_address2 ? modalData.payee?.street_address2 : ""} />
                                                            {errors.payeeForm?.street_address2 && errors.payeeForm?.street_address2.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">City</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="City" className="form-control" {...register("payeeForm.city", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.city ? modalData.payee?.city : ""} />
                                                            {errors.payeeForm?.city && errors.payeeForm?.city.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">State</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="State" className="form-control" {...register("payeeForm.state", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.state ? modalData.payee?.state : ""} />
                                                            {errors.payeeForm?.state && errors.payeeForm?.state.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Zip code</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Zip code" className="form-control" {...register("payeeForm.pincode", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.pincode ? modalData.payee?.pincode : ""} />
                                                            {errors.payeeForm?.pincode && errors.payeeForm?.pincode.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Country</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Country" className="form-control" {...register("payeeForm.country", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.country ? modalData.payee?.country : ""} />
                                                            {errors.payeeForm?.country && errors.payeeForm?.country.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="2" className="mt-4">
                                            <Accordion.Header>Notes and attachments</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="row m-0 align-items-center mb-3">
                                                    <div className="col-sm-12">
                                                        <label className="fs-14">Notes</label>
                                                        <div className="form-group">
                                                            <textarea rows={6} placeholder="Notes" className="form-control" {...register("payeeForm.notes", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.notes ? modalData.payee?.notes : ""} />
                                                            {errors.payeeForm?.notes && errors.payeeForm?.notes.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-12">
                                                        <div className="form-group">
                                                            <label><i className="fa fa-attachment"></i><span>Attachment</span></label>
                                                            <div className="container-fluid h-100 col-sm-12 ml-0 px-0">
                                                                <div id="form_file_upload_modal" className="h-100">
                                                                    {(() => {
                                                                        if (uploadfiles == null || uploadfiles.length < 1) {
                                                                            return (
                                                                                <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                                    <input
                                                                                        className="fileUploadInp"
                                                                                        type="file"
                                                                                        name="file"
                                                                                        accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp,.msg,.eml,.zip,.ppt"
                                                                                        onChange={(e) => onFileChange(e)}
                                                                                        id="file"
                                                                                        data-multiple-caption="{count} files selected"
                                                                                        multiple={false}
                                                                                    />
                                                                                    <i className="fa fa-upload" aria-hidden="true"></i>
                                                                                    <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                                                    <label htmlFor="file"><strong>({C_MSG.supported_file_format})</strong></label>
                                                                                    {msgError && <p className="text-danger p-2">{msgError}</p>}
                                                                                </div>
                                                                            )

                                                                        } else {
                                                                            return (
                                                                                <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column h-100">
                                                                                    <div className="uploadsList my-2 text-center">
                                                                                        {uploadfiles && uploadfiles.length > 0 && uploadfiles.map((file, fIndex) => {
                                                                                            return (
                                                                                                <div key={fIndex} className="file_card position-relative">
                                                                                                    {getFileName(file)}
                                                                                                    <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex)}><i className="fa fa-times"></i></span>
                                                                                                </div>
                                                                                            )
                                                                                        })}
                                                                                    </div>
                                                                                    <div className="taskDetails_btn_block px-3">
                                                                                        <div className="card_button_block ">
                                                                                            {/* <Button className="btn_2 btn_wide " variant="outline-dark" onClick={() => onUploadDocuments()}>Upload</Button> */}
                                                                                            {fileUploadSuccess && <span className="text-success">{C_MSG.file_upload_success}</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                    <Loader showLoader={showLoader}></Loader>
                                                                                </div>
                                                                            )

                                                                        }
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="3" className="mt-4">
                                            <Accordion.Header>Additional info</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="row m-0 align-items-center mb-3">
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Taxes</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Taxes" className="form-control" {...register("payeeForm.taxes", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.taxes ? modalData.payee?.taxes : ""} />
                                                            {errors.payeeForm?.taxes && errors.payeeForm?.taxes.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Exemption details</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Exemption details" className="form-control" {...register("payeeForm.exemption_details", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.exemption_details ? modalData.payee?.exemption_details : ""} />
                                                            {errors.payeeForm?.exemption_details && errors.payeeForm?.exemption_details.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Terms</label>
                                                        <div className="form-group">
                                                            <select className="form-control" {...register("payeeForm.terms", { required: false, })} autoComplete="off" defaultValue={modalData && modalData.payee?.terms ? modalData.payee?.terms : ""}>
                                                                <option value={""}>Select Term</option>
                                                                <option value={"due_on_receipt"}>Due on receipt</option>
                                                                <option value={"net15"}>Net 15</option>
                                                                <option value={"net30"}>Net 30</option>
                                                                <option value={"net60"}>Net 60</option>
                                                            </select>
                                                            {errors.payeeForm?.terms && errors.payeeForm?.terms.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Account no.</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Account No." className="form-control" {...register("payeeForm.account_no", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.account_no ? modalData.payee?.account_no : ""} />
                                                            {errors.payeeForm?.account_no && errors.payeeForm?.account_no.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Expense category</label>
                                                        <div className="form-group">
                                                            <select className="form-control" {...register("payeeForm.expense_category_id", { required: false,valueAsNumber:true })} autoComplete="off" defaultValue={modalData && modalData.payee?.expense_category_id ? modalData.payee?.expense_category_id : ""}>
                                                                <option value={""}>Select Term</option>
                                                                <option value={0}>Due on receipt</option>
                                                                <option value={1}>Net 15</option>
                                                                <option value={2}>Net 30</option>
                                                                <option value={3}>Net 60</option>
                                                            </select>
                                                            {errors.payeeForm?.expense_category_id && errors.payeeForm?.expense_category_id.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="fs-14">Opening Balance</label>
                                                        <div className="form-group">
                                                            <input type="text" placeholder="Opening Balance" className="form-control" {...register("payeeForm.opening_balance", { required: false })} autoComplete="off" defaultValue={modalData && modalData.payee?.opening_balance ? modalData.payee?.opening_balance : ""} />
                                                            {errors.payeeForm?.opening_balance && errors.payeeForm?.opening_balance.type == "required" && <div className="field_err text-danger"><div>{C_MSG.field_required}</div></div>}
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                    
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-start px-3">
                                <div className="">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_invoice_modal" ? "Update" : "Submit"}</button>
                                </div>
                                <div className="ml-3">
                                    <span className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</span>
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

    if (modalType == 'create_bank_acc_modal' || modalType == "update_bank_acc_modal") {
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
                        <Modal.Title className="fs-12">Account</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-0 text_color_2 fs-12">
                        <form id="" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row align-items-start m-0">
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label htmlFor="projectDesc-field" className="form-label">Account Type</label>
                                        <select className="form-control" {...register("bankAccForm.expense_type_id", { required: true})} autoComplete="off" defaultValue={modalData && modalData.account?.type_id ? modalData.account?.type_id : 0}>
                                            {modalData && modalData.accountTypes && modalData.accountTypes.length > 0 && React.Children.toArray(modalData.accountTypes.map((item, atKey) => {
                                                return <option value={item.id}>{item.name}</option>
                                            }))}
                                        </select>
                                        {errors && errors.bankAccForm && errors.bankAccForm?.expense_type_id && errors.bankAccForm.expense_type_id?.type == "required" && <div className="field_err text-danger">{C_MSG.account_type_required}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="projectDesc-field" className="form-label">Detail Type</label>
                                        <select className="form-control" {...register("bankAccForm.category_id", { required: true})} autoComplete="off" defaultValue={modalData && modalData.account?.category_id ? modalData.account?.category_id : 0}>
                                            {modalData && modalData.accountTypeCats && modalData.accountTypeCats[accountForm?.expense_type_id] &&modalData.accountTypeCats[accountForm.expense_type_id]?.acc_cats.length > 0 && React.Children.toArray(modalData.accountTypeCats[accountForm.expense_type_id].acc_cats.map((item, atKey) => {
                                                return <option value={item.category_id}>{item.expense_category}</option>
                                            }))}
                                        </select>
                                        {errors && errors.bankAccForm && errors.bankAccForm?.category_id && errors.bankAccForm.category_id?.type == "required" && <div className="field_err text-danger">{C_MSG.category_required}</div>}
                                    </div>

                                    {/* <div className="border bg_color_10 p-4">
                                        <p className="mb-0">Use a Cash on hand account to track cash your company keeps for occasional expenses, also called petty cash.
                                            To track cash from sales that have not been deposited yet, use a pre-created account called Undeposited funds, instead.</p>
                                    </div> */}
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label htmlFor="projectName-field" className="form-label">Name</label>
                                        <input type="text" className="form-control" placeholder="Enter Name" {...register("bankAccForm.name", { required: true })} defaultValue={modalData && modalData?.account?.display_name ? modalData?.account?.display_name : ""} />
                                        {errors && errors.bankAccForm && errors.bankAccForm?.name && errors.bankAccForm.name?.type == "required" && <div className="field_err text-danger">{C_MSG.field_required}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="projectName-field" className="form-label">Description</label>
                                        <input type="text" className="form-control" placeholder="Enter Description" {...register("bankAccForm.description", { required: false })} defaultValue={modalData && modalData?.account?.description ? modalData?.account?.description : ""} />
                                        {errors && errors.bankAccForm && errors.bankAccForm?.description && errors.bankAccForm.description?.type == "required" && <div className="field_err text-danger">{C_MSG.desc_required}</div>}
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="d-flex align-items-center justify-content-end px-3">
                                <div className="">
                                    <button className="btn btn-outline-dark btn_2" type="button" disabled={formSubmitted} onClick={() => handleModalClose()}>Close</button>
                                </div>
                                <div className="ml-3">
                                    <button className="btn btn-success" type="submit" disabled={formSubmitted}>{modalType == "update_bank_acc_modal" ? "Update" : "Create"}</button>
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