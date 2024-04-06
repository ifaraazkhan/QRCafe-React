import { React, useContext, useEffect, useRef, useState } from "react";
import Select, { components, DropdownIndicatorProps } from 'react-select'
import CreatableSelect from 'react-select/creatable';

const StackSelect = (props) => {
    const {
        closeOnSelect = true,
        hideOptionOnSelect = false,
        selected = [],
        multi = false,
        selectOptions = [],
        changeFn = null,
        createFn = null,
        styles = '',
        cClass = '',
        cClassPrefix = '',
        selectPlaceholder = 'Select From Here',
        selectType = "select",
        creatablePosition = "first",
        selectedValue = [],
    } = props

    // const [markDate, setMarkDate] = useState(null)
    const DropdownIndicator = props => {
        return (
            <components.DropdownIndicator {...props}>
                <span style={{ color: "black", width: "30px", fontSize: "20px", marginLeft: "8px", cursor: "pointer" }}><i className="fa fa-filter"></i></span>
            </components.DropdownIndicator>
        )
    }

    const myRef = useRef();
    useEffect(() => {
    }, [])

    if (selectType === "creatable") {
        return (
            <CreatableSelect
                closeMenuOnSelect={closeOnSelect}
                hideSelectedOptions={hideOptionOnSelect}
                defaultValue={selected}
                isMulti={multi ? true : false}
                options={selectOptions || []}
                onChange={changeFn}
                onCreateOption={createFn}
                createOptionPosition={creatablePosition}
                className={cClass}
                classNamePrefix={cClassPrefix}
                placeholder={selectPlaceholder}
                value={selectedValue}
            />
        )
    } else if (selectType === "custom") {
        return (
            <Select
                closeMenuOnSelect={closeOnSelect}
                hideSelectedOptions={hideOptionOnSelect}
                defaultValue={selected}
                isMulti={multi ? true : false}
                options={selectOptions}
                onChange={changeFn}
                className={cClass}
                classNamePrefix={cClassPrefix}
                placeholder={selectPlaceholder}
                components={{ DropdownIndicator }}
                isSearchable={false}
            />
        )
    } else if (selectType === "custom2") {
        return (
            <Select
                closeMenuOnSelect={closeOnSelect}
                hideSelectedOptions={hideOptionOnSelect}
                defaultValue={selected}
                isMulti={multi ? true : false}
                options={selectOptions}
                onChange={changeFn}
                className={cClass}
                classNamePrefix={cClassPrefix}
                placeholder={selectPlaceholder}
                isSearchable={true}
                value={selectedValue}
            />
        )
    } else {
        return (
            <Select
                closeMenuOnSelect={closeOnSelect}
                hideSelectedOptions={hideOptionOnSelect}
                defaultValue={selected}
                isMulti={multi ? true : false}
                options={selectOptions}
                onChange={changeFn}
                className={cClass}
                classNamePrefix={cClassPrefix}
                placeholder={selectPlaceholder}
            />
        )
    }


}





export default StackSelect