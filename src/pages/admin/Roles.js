import React, { useContext, useEffect, useRef, useState } from "react";
import { Input, Label, Card, Container, Row, Col, Nav, NavDropdown, Tab } from '../../Helpers/UiHelper'

import { AuthContext } from "../../ContextProvider/AuthContext";
import C_MSG from "../../Helpers/MsgsList";
import { setDocumentTitle, sortArr } from "../../Helpers/Helper";
import SweetAlert from "react-bootstrap-sweetalert";
import { ApiService } from "../../Services/ApiService";
import StackModal from "../../Components/Elements/StackModal";
import StackPagination from "../../Components/Elements/StackPagination";

const Roles = (props) => {
    const { user: authUser = null } = useContext(AuthContext)
    const user = authUser?.user || {}
    const userId = user.user_id || null

    const [selectedRoles, setSelectedRoles] = useState([]);
    const [roles, setRoles] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [formSubmitted, setFormSbmt] = useState(false);
    const [modalType, setModalType] = useState(null)
    const [modalData, setModalData] = useState({});
    const [openModal, setShowModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

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
        setDocumentTitle(C_MSG.admin_users_settings_document_title)
    }, [])

    useEffect(() => {
        if(roles && roles.length == 0){
            getRoles()
        }
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
          let role_name = item?.role_name ? item?.role_name.toLowerCase() : "";
          if (
            role_name.indexOf(keyword.toLowerCase()) != -1 
          ) {
            items.push(item);
          }
        }
  
        paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit);
        paginateObj.currentPage = (paginateObj.currentPage - 1) * paginateObj.itemsLimit < items.length ? paginateObj.currentPage : 1;
  
        getFilteredList(paginateObj, [...items]);
    };

    // const getFilteredGrps = (items = null, projectFilter = null, data = null) => {
    //     if (items == null) {
    //         return false;
    //     }
    //     let filteredArr = [];
    //     let {keyword = null} = data || {};
        
    //     keyword = keyword && keyword.replace(/ /g, "").length > 0 ? keyword : keywordRef?.current?.value;
    //     let usr = user?.currentUser;
    //     for (let item of items) {
    //         let skipItem = filterSkipItem(item, projectFilter || checkFilters);
    //         if (skipItem) {
    //         continue;
    //         }
    //         filteredArr.push(item)
    //     }
        
    //     return filteredArr
    // }
    
    // const filterSkipItem = (item = null, filterArr = []) => {
    //     let skipItem = false;
    //     if (item == null) {
    //       return skipItem;
    //     }
    //     let tOwnerssFilter = [],
    //         kemMemsFilter = [],
    //         taskNamesFilter = [],
    //         evNamesFilter = [];
    //     for (let filter of filterArr) {
    //       if (filter.cat.toLowerCase() == "task owner") {
    //         tOwnerssFilter.push(filter.key.toLowerCase());
    //       }
          
    //       if (filter.cat.toLowerCase() == "key member") {
    //         kemMemsFilter.push(filter.key.toLowerCase());
    //       }
    //       if (filter.cat.toLowerCase() == "task name") {
    //         taskNamesFilter.push(filter.key.toLowerCase());
    //       }
    //       if (filter.cat.toLowerCase() == "evidence name") {
    //         evNamesFilter.push(filter.key.toLowerCase());
    //       }
         
    //       //new filters end
    //     }

    //     if (tOwnerssFilter.length > 0 && !tOwnerssFilter.includes(item.task_owner.toLowerCase())) {
    //       skipItem = true;
    //     }
    //     if (kemMemsFilter.length > 0 && !kemMemsFilter.includes(item.key_member.toLowerCase())) {
    //       skipItem = true;
    //     }
    //     if (taskNamesFilter.length > 0 && !taskNamesFilter.includes(item.task_name.toLowerCase())) {
    //       skipItem = true;
    //     }
    //     if (evNamesFilter.length > 0 && !evNamesFilter.includes(item.evidence_value.toLowerCase())) {
    //       skipItem = true;
    //     }
    
        
        
    //     let keyword = keywordRef?.current?.value;
    //     let pnp_name = item?.pnp_name ? item?.pnp_name.toLowerCase() : "";
    //     let task_owner = item?.task_owner ? item?.task_owner.toLowerCase() : "";
    //     let task_name = item?.end_date ? item?.end_date.toLowerCase() : "";
    //     let evidence_name = item?.evidence_value ? item?.evidence_value.toLowerCase() : "";
    //     let version = item?.pnp_version ? item?.pnp_version.toLowerCase() : "";
    //     let edited_by = item?.role_name ? item?.role_name.toLowerCase() : "";
    //     let status = item?.verification_status ? item?.verification_status.toLowerCase() : "";
          
    //     if(keyword){
    //       if (
    //         pnp_name.indexOf(keyword.toLowerCase()) == -1 &&
    //         task_owner.indexOf(keyword.toLowerCase()) == -1 &&
    //         task_name.indexOf(keyword.toLowerCase()) == -1 &&
    //         evidence_name.indexOf(keyword.toLowerCase()) == -1 &&
    //         version.indexOf(keyword.toLowerCase()) == -1 &&
    //         edited_by.indexOf(keyword.toLowerCase()) == -1 &&
    //         status.indexOf(keyword.toLowerCase()) == -1
    //       ) {
    //         skipItem = true;
    //       }
    //     }
          
    //     return skipItem;
    // };

    const onPageChangeFunc = async (currentPage, prevRange) => {
        let paginateObj = { ...paginate };
        paginateObj.currentPage = currentPage
        setPrevRange(prevRange);
        searchByKeyword(paginateObj,[...roles]);
    }

    const onChangeLimit = async (newLimit = "") => {
        if (newLimit == "") {
          return false;
        }
        let items = [...roles];
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
        searchByKeyword(paginateObj,[...roles]);
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
        setRoles(dataArr);
        setFilteredList((oldVal) => {
          return [...dataArr];
        });
        setActiveCol(column);
        setActiveSortOrder(type);
    };
    /* pagination sorting, searching function end */


    const getRoles = async () => {
        setFormSbmt(true)
        // let payloadUrl = `user/listroles`
        let payloadUrl = `user/listRoles`
        let method = "GET"
        
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let data = Object.values(res.results)
            setRoles(oldVal => ([...data]))
            // setFilteredList(oldVal => ([...data]))
            getFilteredList(paginateObj, [...data]);
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
          case "create_role_modal":
            setModalType(modalName);
            setShowModal(true);
            break;
          case "update_role_modal":
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


    const addRole = async (data = null) => {
        if(data == null){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = "admin/createProject"
        let method = "POST"
        let formData = data
        const res = await ApiService.fetchData(payloadUrl,method,formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            getRoles()
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
        setFormSbmt(false)
        return res
    }

    const updateRole = async (data = null) => {
        if(data == null){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `admin/updateRole/${data.roleId}`
        let method = "POST"
        let formData = data
        delete formData.roleId
        const res = await ApiService.fetchData(payloadUrl,method,formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            getRoles()
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message || C_MSG.technical_err })
        }
        setFormSbmt(false)
        return res
    }

    const onDelRoles = (data = null) => {
        if (data == null) {
            return false
        }
        toggleAlert({ show: true, type: "del_confirmation_role", message: "", data: data })
    }

    const deleteRoles = async (role_ids = null) => {
        if(role_ids == null || role_ids.length == 0){
            return false
        }
        setFormSbmt(true)
        let payloadUrl = `admin/deleteRole`
        let method = "POST"
        let formData = {role_ids:role_ids[0]}
        const res = await ApiService.fetchData(payloadUrl,method, formData)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            toggleAlert({ show: true, type: 'success', message: res.message})
            getRoles()
            // updateData('user')
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message || C_MSG.technical_err })
        }
        setFormSbmt(false)
        return res
    }

    const handleChange = (event) => {
        event.stopPropagation();
        const { name, value: roleId, checked } = event.target;
        let tempSelected = [...selectedRoles];
        if (name === "allSelect") {
            tempSelected = checked ? roles.map((item) => item.role_id) : [];
        } else {
            if (checked) {
                !tempSelected.includes(Number(roleId)) && tempSelected.push(Number(roleId));
            } else {
                tempSelected.includes(Number(roleId)) &&  tempSelected.splice(tempSelected.indexOf(Number(roleId)), 1);
            }
        }
        setSelectedRoles((oldVal) => [...tempSelected]);
    };

    return (
        <React.Fragment>
            <div className="card">
                <div className="row">
                    <div className="col-12">
                        <div className="listjs-table mt-3" id="customerList">
                            <div className="row m-0">
                                <div className="col-sm">
                                    <div className="d-flex justify-content-sm-end">
                                        <div className="search-box ms-2">
                                            <input type="text" className="form-control search" placeholder="Search..." ref={keywordRef} onChangeCapture={() => searchByKeyword(null,[...roles])}  />
                                            <i className="ri-search-line search-icon"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-auto">
                                    <div>
                                        {/* <button type="button" className="btn btn-success add-btn" onClick={() => showModal("create_role_modal")}><i className="ri-add-line align-bottom me-1"></i> Add</button> */}
                                        {/* <button className="btn btn-soft-danger ms-3" onClick={() => onDelRoles(selectedRoles)} disabled={formSubmitted || selectedRoles.length == 0}><i className="ri-delete-bin-2-line"></i></button> */}
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
                                                        <input className="form-check-input" type="checkbox" id="checkAll" name={"allSelect"} checked={selectedRoles.length == roles.length} onChange={(e) => handleChange(e)} />
                                                    </div>
                                                </th> */}
                                                <th className="sort link_url" onClick={() => sortData('role_name', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', roles)}>Project Name</th>
                                                <th className="">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="list form-check-all">
                                            {React.Children.toArray(filteredList.map((item,index) => {
                                                return (
                                                    <React.Fragment>
                                                        <tr>
                                                            {/* <td scope="row">
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="checkbox" checked={(selectedRoles && selectedRoles.includes(Number(item.role_id)) || false)} name={item.role_id} value={item.role_id} onChange={(e) => handleChange(e)} />
                                                                </div>
                                                            </td> */}
                                                            <td className="">{item.role_name}</td>
                                                            <td>
                                                                {/* <div className="d-flex gap-2">
                                                                    <div className="edit">
                                                                        <button className="btn btn-sm btn-success edit-item-btn" onClick={() => showModal("update_role_modal",{role:item})}>Edit</button>
                                                                    </div>
                                                                    <div className="remove">
                                                                        <button className="btn btn-sm btn-danger remove-item-btn" onClick={() => onDelRoles([item.role_id])}>Remove</button>
                                                                    </div>
                                                                </div> */}
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                )
                                            }))}
                                        </tbody>
                                    </table>
                                }

                                { filteredList && filteredList.length > 0 && 
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
                } else if (showAlert && showAlert.show && showAlert.type == "del_confirmation_role") {
                    return (
                        <SweetAlert
                            danger
                            showCancel
                            confirmBtnText="Delete"
                            confirmBtnBsStyle="danger"
                            cancelBtnCssClass="btn btn-outline-secondary text_color_2"
                            title={`Are you sure  you want to delete the ${showAlert?.data.length > 1 ? "roles" : "role"} ?`}
                            onConfirm={() => deleteRoles(showAlert?.data)}
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
                    
                    if (modalType == "create_role_modal") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData }}
                                formSubmit={addRole}
                                customClass=""
                                cSize="sm"
                            />
                        );
                    }
                    if (modalType == "update_role_modal") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData}}
                                formSubmit={updateRole}
                                customClass=""
                                cSize="sm"
                            />
                        );
                    }
                }

            })()}
        </React.Fragment>
    )

}

export default Roles