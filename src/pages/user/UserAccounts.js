import React, { useContext, useEffect, useRef, useState } from "react";
import {Input , Label, Card, Container, Row, Col, Nav, NavDropdown, Tab} from '../../Helpers/UiHelper'

import { AuthContext } from "../../ContextProvider/AuthContext";
import C_MSG from "../../Helpers/MsgsList";
import { getFileName, setDocumentTitle, sortArr } from "../../Helpers/Helper";
import SweetAlert from "react-bootstrap-sweetalert";
import { ApiService } from "../../Services/ApiService";
import StackModal from "../../Components/Elements/StackModal";
import StackPagination from "../../Components/Elements/StackPagination";
import { configs } from "../../config";

const UserAccounts = (props) => {
    const {user:authUser = null, isSuperAdmin = false, projectId = null} = useContext(AuthContext)
    const user = authUser?.user || {}
    const userId = user.user_id || null

    const [selectedAccs, setSelectedAccs] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [users, setUsers] = useState([]);
    const [cats, setCats] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [formSubmitted, setFormSbmt] = useState(false);
    const [modalType, setModalType] = useState(null)
    const [modalData, setModalData] = useState({});
    const [openModal, setShowModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [viewFile, setViewFile] = useState(false);
    const [fileType, setFileType] = useState(false);

    /* pagination states start */
    let paginateObj = {totalItems: 0, totalPages: 10, currentPage: 1, showAllPages: false, showPrevNextBtn: true, disablePages: [], itemsLimit: 10};
    const [paginate, setPaginate] = useState(paginateObj);
    const [prevRange, setPrevRange] = useState(null);
    const keywordRef = useRef();
    // sorting data
    const [activeCol, setActiveCol] = useState("");
    const [activeSortOrder, setActiveSortOrder] = useState("ASC");
    /* pagination states end */

    useEffect(() => {
        setDocumentTitle(C_MSG.admin_accounts_settings_document_title)
    }, [])


    useEffect(() => {
        // if(projectId != null && accounts && accounts.length == 0){
            getAccounts()
            getUsers()
            getCategories()
        // }
    }, [])

    /* pagination sorting, searching function start */
    const searchByKeyword = (pgObj = null, searchArr = []) => {
        let paginateObj = pgObj || paginate;
        let keyword = keywordRef?.current?.value;
        keyword = keyword && keyword.replace(/ /g, "").length > 0 ? keyword : null;
        let items = [];
        let tmpArr = searchArr
        if (!keyword || keyword.length == 0 || keyword == null) {
          items = [...tmpArr];
            //   if (checkFilters) {
            //     items = getFilteredGrps(items, checkFilters, {}) || [];
            //   }
          paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit);
          paginateObj.currentPage = (paginateObj.currentPage - 1) * paginateObj.itemsLimit < items.length ? paginateObj.currentPage : 1;
          getFilteredList(paginateObj, [...items]);
          return false;
        }
  
            // if (checkFilters) {
            //   tmpPnPArr = getFilteredGrps(tmpPnPArr, checkFilters, {}) || [];
            // }
        for (let item of tmpArr) {
          let title = item?.title ? item?.title.toLowerCase() : "";
          let username = item?.username ? item?.username.toLowerCase() : "";
          let uniqId = item?.qr_value ? item?.qr_value.toLowerCase() : "";
          if (
            title.indexOf(keyword.toLowerCase()) != -1 ||
            username.indexOf(keyword.toLowerCase()) != -1 ||
            uniqId.indexOf(keyword.toLowerCase()) != -1
          ) {
            items.push(item);
          }
        }
  
        paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit);
        paginateObj.currentPage = (paginateObj.currentPage - 1) * paginateObj.itemsLimit < items.length ? paginateObj.currentPage : 1;
  
        getFilteredList(paginateObj, [...items]);
    };

    

    const onPageChangeFunc = async (currentPage, prevRange) => {
        let paginateObj = { ...paginate };
        paginateObj.currentPage = currentPage
        setPrevRange(prevRange);
        searchByKeyword(paginateObj,[...accounts]);
    }

    const onChangeLimit = async (newLimit = "") => {
        if (newLimit == "") {
          return false;
        }
        let items = [...accounts];
        let paginateObj = { ...paginate };
        paginateObj.itemsLimit = newLimit;
        paginateObj.currentPage = 1;
        paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit);
        paginateObj.totalItems = items.length;
        setPaginate((oldVal) => {
          return { ...paginateObj };
        });
        searchByKeyword(paginateObj, items);
    };
  
    const onClickPaginationItem = async (event, page = "") => {
        if (page == "") {
          return false;
        }
  
        let paginateObj = { ...paginate };
        if (page == "first") {
          paginateObj.currentPage = 1;
        } else if (page == "last") {
          paginateObj.currentPage = paginateObj.totalPages;
        } else if (page == "next") {
          paginateObj.currentPage =
            paginateObj.currentPage + 1 <= paginateObj.totalPages
              ? paginateObj.currentPage + 1
              : paginateObj.totalPages;
        } else if (page == "prev") {
          paginateObj.currentPage =
            paginateObj.currentPage - 1 > 0 ? paginateObj.currentPage - 1 : 1;
        }
        setPaginate((oldVal) => {
          return { ...paginateObj };
        });
        searchByKeyword(paginateObj,[...accounts]);
    };

    const getFilteredList = (paginateObj = null, items = null, returnRes = false) => {
        if (paginateObj == null || items == null) {
          return false;
        }
        let currentPage = paginateObj.currentPage;
        let limit = paginateObj.itemsLimit || 10;
        let offset = (currentPage - 1) * limit;
        let fList = items.slice(offset, offset + limit);
        paginateObj.totalItems = items.length;
        setPaginate((oldVal) => {
          return { ...paginateObj };
        });
        if (!returnRes) {
          setFilteredList((oldVal) => {
            return [...fList];
          });
        }
        return fList
    };

    const sortData = async (column = "", type = "", items = []) => {
        if (column == "" || type == "" || items.length == 0) {
          return false;
        }
        let sortOpts = {
          sortBy: column,
          sortOrder: type,
          activeCol: activeCol,
          activeSortOrder: activeSortOrder,
          items: items,
        };
        let dataArr = sortArr(sortOpts);
        setAccounts(dataArr);
        setFilteredList((oldVal) => {
          return [...dataArr];
        });
        setActiveCol(column);
        setActiveSortOrder(type);
    };
    /* pagination sorting, searching function end */


    const getAccounts = async () => {
        setFormSbmt(true)
        let payloadUrl = `user/getAccountbyUserID/${user.user_id}`
        let method = "GET"
        
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let data = Object.values(res.results)
            setAccounts(oldVal => ([...data]))
            // setFilteredList(oldVal => ([...data]))
            getFilteredList(paginate,[...data])
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
        setFormSbmt(false)
    }

    const getUsers = async () => {
        setFormSbmt(true)
        let payloadUrl = `user/getUser`
        if(isSuperAdmin){
            payloadUrl = `admin/getUser`
        }
        let method = "GET"
        
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let data = Object.values(res.results)
            setUsers(oldVal => ([...data]))
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
        setFormSbmt(false)
    }

    const getCategories = async () => {
        setFormSbmt(true)
        let payloadUrl = `admin/listCategory`
        let method = "GET"
        
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let data = Object.values(res.results)
            setCats(oldVal => ([...data]))
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
        setFormSbmt(false)
    }

    const toggleAlert = (val) => {
        setShowAlert(val)
    }

    const showModal = async (modalName = null, data = null) => {
        if (modalName == null) {
          return false;
        }
        setModalData({})
        switch (modalName) {
          case "view_documents":
            if(data != null){
                const {qr_filepath = null} = data;
                if(qr_filepath){
                    let fullPath = `${configs.QRPath}/${qr_filepath}`
                    let filename = getFileName(qr_filepath)
                    let fileExt = filename.split(".")[1]
                    setViewFile(fullPath)
                    setFileType(fileExt)
                    setModalType(modalName);
                    setShowModal(true);
                }
            }
            break;
          case "create_account_modal":
            setModalType(modalName);
            setShowModal(true);
            break;
          case "update_account_modal":
            if(data != null){
              setModalData(data)
            }
            setModalType(modalName);
            setShowModal(true);
            break;
        }
    };

    const hideModal = () => {
        setModalType(null);
        setShowModal(false);
    };


    const addAccount = async (data = null) => {
        if(data == null){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = "admin/addAccountDetails"
        let method = "POST"
        let formData = data
        const res = await ApiService.fetchData(payloadUrl,method,formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            getAccounts()
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
        setFormSbmt(false)
        return res
    }
    const getAccountInfo = async (accountId = null) => {
        if(accountId == null){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `admin/getAccountbyId/${accountId}`
        let method = "GET"
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let account = res.results[0];
            console.log("account --",account);
            
            showModal("update_account_modal", { account: account })
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
        setFormSbmt(false)
        return res
    }

    const updateAccount = async (data = null) => {
        if(data == null){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `admin/updateAccountDetails`
        let method = "POST"
        let formData = data
        const res = await ApiService.fetchData(payloadUrl,method,formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            getAccounts()
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message || C_MSG.technical_err })
        }
        setFormSbmt(false)
        return res
    }

    const onDelaccounts = (data = null) => {
        if (data == null) {
            return false
        }
        toggleAlert({ show: true, type: "del_confirmation_user", message: "", data: data })
    }

    const deleteaccounts = async (usr_ids = null) => {
        if(usr_ids == null || usr_ids.length == 0){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `admin/deleteUser`
        let method = "POST"
        let formData = {user_id:usr_ids}
        formData.project_id = projectId
        const res = await ApiService.fetchData(payloadUrl,method, formData)
        // const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            getAccounts()
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message || C_MSG.technical_err })
        }
        setFormSbmt(false)
        return res
    }

    const handleChange = (event) => {
        event.stopPropagation();
        const { name, value: usrId, checked } = event.target;
        let tempSelected = [...selectedAccs];
        if (name === "allSelect") {
            tempSelected = checked ? accounts.map((item) => item.user_id) : [];
        } else {
            if (checked) {
                !tempSelected.includes(Number(usrId)) && tempSelected.push(Number(usrId));
            } else {
                tempSelected.includes(Number(usrId)) &&  tempSelected.splice(tempSelected.indexOf(Number(usrId)), 1);
            }
        }
        setSelectedAccs((oldVal) => [...tempSelected]);
    };

    const uploadAccDocs = async (data = null) => {
        if(data == null){
            return false
        }
        setFormSbmt(true)
        let result = false
        const {uploadfiles = [],type=""} = data
        if(uploadfiles.length > 0){
            let payloadUrl = `admin/uploadImages/${type}`
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

    return (
        <React.Fragment>
            <div className="page-content mt-4 pt-5">
                <div className="card">
                    <div className="row">
                        <div className="col-12">
                            <div className="listjs-table mt-3" id="customerList">
                                <div className="row m-0">
                                    <div className="col-sm">
                                        <div className="d-flex justify-content-sm-end">
                                            <div className="search-box ms-2">
                                                <input type="text" className="form-control search" placeholder="Search..." ref={keywordRef} onChangeCapture={() => searchByKeyword(null, [...accounts])} />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-responsive table-card m-0 mt-3">
                                    {filteredList && filteredList.length > 0 &&
                                        <table className="table align-middle table-nowrap" id="customerTable">
                                            <thead className="table-light">
                                                <tr>
                                                    {/* <th>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" id="checkAll" name={"allSelect"} checked={selectedAccs.length == accounts.length} onChange={(e) => handleChange(e)} />
                                                        </div>
                                                    </th> */}
                                                    {/* <th className="sort link_url" onClick={() => sortData('first_name', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', accounts)}>FullName</th> */}
                                                    <th className="sort link_url" onClick={() => sortData('title', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', accounts)}>Title</th>
                                                    <th className="sort link_url" onClick={() => sortData('Username', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', accounts)}>Username</th>
                                                    <th className="sort link_url" onClick={() => sortData('phone', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', accounts)}>Unique Id</th>
                                                    <th className="sort link_url" onClick={() => sortData('email', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', accounts)}>Qr Code</th>
                                                    <th className="">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="list form-check-all">
                                                {React.Children.toArray(filteredList.map((item, index) => {
                                                    return (
                                                        <React.Fragment>
                                                            <tr>

                                                                {/* <td className="">{item.first_name} {item.last_name}</td> */}
                                                                <td className="">{item.title}</td>
                                                                <td className="">{item.username}</td>
                                                                <td className="">{item.qr_value}</td>
                                                                <td className=""><span className="link_url" onClick={() => showModal("view_documents", item)}><i className="fa fa-file"></i></span></td>
                                                                <td>
                                                                    <div className="d-flex gap-2">
                                                                        <div className="edit">
                                                                            <button className="btn btn-sm btn-success edit-item-btn" onClick={() => getAccountInfo(item.account_id)}>Edit</button>
                                                                        </div>
                                                                        {/* <div className="remove">
                                                                            <button className="btn btn-sm btn-danger remove-item-btn" onClick={() => onDelaccounts([item.account_id])}>Remove</button>
                                                                        </div> */}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    )
                                                }))}
                                            </tbody>
                                        </table>
                                    }

                                    {filteredList && filteredList.length > 0 &&
                                        <div className="pagination_sec px-3 mt-3 Page navigation example btm_pagination d-flex justify-content-between align-items-center mt-20 pb-20">
                                            <StackPagination
                                                layout={2}
                                                totalItems={Number(paginate?.totalItems)}
                                                totalPages={Number(paginate?.totalPages)}
                                                currentPage={Number(paginate?.currentPage)}
                                                showAllPages={paginate?.showAllPages}
                                                showPrevNextBtn={paginate?.showPrevNextBtn}
                                                disablePages={paginate?.disablePages}
                                                limit={Number(paginate?.itemsLimit)}
                                                onChangeLimit={onChangeLimit}
                                                onClickFn={onClickPaginationItem}
                                                onPageChange={onPageChangeFunc}
                                                prevRange={prevRange}
                                            />
                                        </div>
                                    }

                                    {filteredList && filteredList.length == 0 &&
                                        <div className="noresult">
                                            <div className="text-center">
                                                <h5 className="mt-2">Sorry! No Result Found</h5>
                                            </div>
                                        </div>
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
                } else if (showAlert && showAlert.show && showAlert.type == "del_confirmation_user") {
                    return (
                        <SweetAlert
                            danger
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnCssClass="btn btn-outline-secondary text_color_2"
                            title={`Are you sure  you want to delete the ${showAlert?.data.length > 1 ? "accounts" : "user"} ?`}
                            onConfirm={() => deleteaccounts(showAlert?.data)}
                            confirmBtnCssClass={"btn_15"}
                            onCancel={() =>
                                toggleAlert({ show: false, type: "success", message: "" })
                            }
                            focusConfirmBtn
                            customClass={`i_alert fs-10`}
                        ></SweetAlert>
                    );
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
                    if (modalType == "update_account_modal") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData, uploadAccDocs, users, cats }}
                                formSubmit={updateAccount}
                                customClass="bottom"
                                cSize="md"
                            />
                        );
                    }
                }

            })()}
        </React.Fragment>
    )

}

export default UserAccounts