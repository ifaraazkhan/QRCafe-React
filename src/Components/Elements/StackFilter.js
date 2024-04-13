

import React, { useEffect, useRef, useState } from "react";
import { Accordion, OverlayTrigger, Tooltip } from "react-bootstrap";
import { compareObjs, DelCookie, isObjInclude } from "../../Helpers/Helper";
import Styles from "../../Styles/StackFilter.module.css"
import C_MSG from "../../Helpers/MsgsList";



const StackFilter = (props) => {
    const {
        id = "stack_multi_sel",
        theme = { style: "light", type: "theme4" },
        className = "",
        dropdownClassName = "",
        displayValue = "key",
        groupBy = "cat",
        onKeyPressFn = null,
        onRemove = null,
        onSearch = null,
        onSelect = null,
        options: filtersList = [],
        selectedValues = [],
        showTooltip = false,
        howCheckbox

    } = props

    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState(selectedValues)
    const [showFilterCheck, setShowFilterCheck] = useState(false)
    const editFilterInpRef = useRef({})
    const stackFilters = useRef();
    useEffect(() => {
        /**
             * Alert if clicked on outside of element
             */
        function handleClickOutside(event) {
            if (stackFilters.current && !stackFilters.current.contains(event.target)) {
                toggleFilterDropdown(true)
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [stackFilters])


    useEffect(() => {
        if (selectedValues != selectedFilter) {
            setSelectedFilter(oldVal => [...selectedValues])
            setShowFilterCheck(selectedValues.length > 0 ? true : false)
            let listArr = getListByCategory([...filtersList], groupBy)
            toggleFilterSelect(listArr, [...selectedValues])
        }
    }, [selectedValues])

    const getListByCategory = (list = null, cat = '') => {
        if (list == null || cat == '') {
            return []
        }

        let tmpData = list.reduce((group, item) => {
            let key = item[cat]
            group[key] = group[key] || [];

            group[key].push(item)
            return group
        }, {})
        let result = [];
        if (tmpData) {
            result = Object.entries(tmpData).map(([key, value]) => ({ group: key, list: value, group_info:C_MSG[key.replace(/\s+/g, '_').toLowerCase()] }))
        }
        return result
    }
    const toggleFilterDropdown = (hideDropdown = false) => {
        if (hideDropdown) {
            setShowFilterDropdown(false)
        } else {
            setShowFilterDropdown(showFilterDropdown ? false : true)
        }

    }
    const toggleFilterSelect = (listArr = null, selected = null) => {
        if (listArr == null) {
            listArr = getListByCategory([...filtersList], groupBy)
        }
        if (listArr == null || selected == null) {
            return false
        }
        for (let lKey in listArr) {
            let item = listArr[lKey]
            let filters = item.list
            for (let fKey in filters) {
                let filter = filters[fKey]
                isObjInclude(selected, filter) && (editFilterInpRef.current[`${lKey}_${fKey}`].checked = true);
            }
        }
    }
    const togglFilterList = (event = null) => {
        let element = event.target
        if (event == null || element == null) {
            return false
        }
        let parentEle = element.closest(".filter_box")
        let titlebox = parentEle.classList.toggle(Styles.open)
        let content = parentEle.querySelector(".filter_list");
        if (content) {
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        }

    }
    const onToggleFilter = (event, data = null) => {
        if (event == null || data == null) {
            return false
        }
        event.stopPropagation()
        let selected = [...selectedFilter]
        let ele = event.target || event.srcElement
        let checked = ele.checked
        
        if (checked) {
            if(data && data.cat.toLowerCase() == "domains"){ 
                if(data.domain_id == 0){
                    let domainsArr = getListByCategory(filtersList, groupBy).filter(item => item.group.toLowerCase() == "domains" )
                    if(domainsArr.length > 0 ){
                        for (const domain of domainsArr[0].list) {
                            !isObjInclude(selected, domain) && selected.push(domain)
                        }
                    }
                }else{
                    !isObjInclude(selected, data) && selected.push(data)
                    let selectedDomains = selected.filter(item => item.cat.toLowerCase() == "domains")
                    let domainsArr = getListByCategory(filtersList, groupBy).filter(item => item.group.toLowerCase() == "domains" )
                    if(domainsArr.length > 0 && selectedDomains.length > 0 && (selectedDomains.length + 1) == domainsArr[0].list.length && selectedDomains.findIndex(item => item.domain_id == 0) == -1){
                        selected.push(domainsArr[0].list.find(item => item.domain_id == 0))
                        let flKey = getListByCategory(filtersList, groupBy).findIndex(item => item.group.toLowerCase() == "domains")
                            let clKey = getListByCategory(filtersList, groupBy)[flKey].list.findIndex(item => item.domain_id == 0)
                            let ele = editFilterInpRef.current[`${flKey}_${clKey}`]
                            ele.checked = true
                    }
                    
                }
            }else{
                !isObjInclude(selected, data) && selected.push(data)
            }
        } else {
            if(data && data.cat.toLowerCase() == "domains"){ 
                if(data.domain_id == 0){
                    getListByCategory(filtersList, groupBy).map((item, flKey) => {
                        if(item.group.toLowerCase() == "domains" && item.list && item.list.length > 0){
                            item.list.map((catList, clKey) => {
                                console.log(catList,selected);
                                let ele = editFilterInpRef.current[`${flKey}_${clKey}`]
                                ele.checked = false
                                selected.splice(selected.findIndex((item) => compareObjs(item, catList)),1)
                            })
                        }
                    })
                }else{
                    isObjInclude(selected, data) && selected.splice(selected.findIndex((item) => compareObjs(item, data)), 1)
                    let selectedDomains = selected.filter(item => item.cat.toLowerCase() == "domains")
                    let domainsArr = getListByCategory(filtersList, groupBy).filter(item => item.group.toLowerCase() == "domains" )
                    if(domainsArr.length > 0 && selectedDomains.length > 0 && selectedDomains.length != domainsArr[0].list.length){
                        let allDomainIndex = selected.findIndex((item) => item.cat.toLowerCase() == "domains" && item.domain_id == 0)
                        if(allDomainIndex != -1){
                            let flKey = getListByCategory(filtersList, groupBy).findIndex(item => item.group.toLowerCase() == "domains")
                            let clKey = getListByCategory(filtersList, groupBy)[flKey].list.findIndex(item => item.domain_id == 0)
                            let ele = editFilterInpRef.current[`${flKey}_${clKey}`]
                            ele.checked = false
                            selected.splice(allDomainIndex,1)
                        }
                    }
                }
            }else{
                isObjInclude(selected, data) && selected.splice(selected.findIndex((item) => compareObjs(item, data)), 1) 
            }
            
        }
        selected = [...new Set(selected)]
        
        setSelectedFilter(oldVal => [...selected])
        setShowFilterCheck(selected.length > 0 ? true : false)
        checked ? onSelect(selected) : onRemove(selected)
    }

    const clearFilters = () => {
        let parentEl = stackFilters.current
        DelCookie("tmf")
        parentEl.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
        setSelectedFilter([])
        setShowFilterCheck(false)
        onRemove([])

    }

    return (
        <React.Fragment>
            <div id={id} ref={stackFilters} className={`stackFilter_sec ms-2 ${Styles[theme.style]} ${Styles[theme.type]} ${Styles.stackFilter_sec} ${className}`}>
                <button type="button" className="btn btn-primary w-100 h-100 p-0 fs-14 position-relative" onClick={() => toggleFilterDropdown()}>
                    {showFilterCheck && <span className={`text-success ${Styles.filter_check}`}><i className="fa fa-check-circle"></i></span>}
                    {showTooltip &&
                        <OverlayTrigger overlay={getListByCategory(selectedFilter, groupBy) && getListByCategory(selectedFilter, groupBy).length > 0
                            ? (
                                <Tooltip id={`tooltip-top`}>
                                    {/* Filters */}
                                    <span>
                                       
                                        {getListByCategory(selectedFilter, groupBy) && getListByCategory(selectedFilter, groupBy).length > 0 && React.Children.toArray(getListByCategory(selectedFilter, groupBy).map((item, sfkey) => {
                                            return (
                                                <>
                                                    <div className="text-left"><span>{item.group}: {item.list.map(itm => itm.key).join()}</span></div>
                                                </>
                                            )
                                        }))}
                                    </span>
                                </Tooltip>
                            ) : (
                                <></>
                            )
                        
                      }
                            placement={"bottom"}>

                            <span><i className="fa fa-filter"></i></span>
                        </OverlayTrigger>
                    }
                </button>
                <div className={`stackFilter_dropdown ${Styles.stackFilter_dropdown} ${dropdownClassName} ${showFilterDropdown ? Styles.show : Styles.hide}`}>
                    <div className={`filter_opts ${Styles.filter_opts} d-flex px-3 py-2`}>
                        <div></div>
                        <div><span className={`clr_btn  ${Styles.clr_btn}`} onClick={() => clearFilters()}> Clear all</span></div>
                    </div>
                    <div className={`filters_block ${Styles.filters_block}`}>
                        {filtersList && filtersList.length > 0 && React.Children.toArray(getListByCategory(filtersList, groupBy).map((item, flKey) => {
                            return (
                                <>
                                    <div className={`filter_box ${Styles.filter_box}`}>
                                        <div className={`filter_box_title ${Styles.filter_box_title} d-flex`}>
                                            <h4 onClick={(e) => togglFilterList(e)}>{item.group}&nbsp;
                                            <OverlayTrigger
                                                  key={"right"}
                                                  placement={"right"}
                                                  overlay={
                                                    <Tooltip id={`tooltip-right`}>
                                                      <div className="text-left fs-11">
                                                       {item.group_info}
                                                      </div>
                                                      {/* Tooltip for <strong>Admin Status</strong>. */}
                                                    </Tooltip>
                                                  }
                                                >
                                                  <span className="info_icon d-inline-block ms-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                                                </OverlayTrigger>
                                            </h4>
                                        </div>
                                        <ul className={`filter_list ${Styles.filter_list}`}>
                                            {item.list && item.list.length > 0 && React.Children.toArray(item.list.map((catList, clKey) => {
                                                return (
                                                    <li className={`filter_item ${Styles.filter_item}`} >
                                                        <label className="position-relative">
                                                            <input type="checkbox" ref={el => (editFilterInpRef.current[`${flKey}_${clKey}`] = el)} value={catList[displayValue]} className="w-0 h-0 position-absolute" onChange={(e) => onToggleFilter(e, catList)} />
                                                            <span className="d-block">{catList[displayValue]}</span>
                                                        </label>
                                                    </li>
                                                )
                                            }))}
                                        </ul>
                                    </div>
                                </>
                            )
                        }))}


                    </div>
                </div>
            </div>
        </React.Fragment>

    )
}





export default StackFilter