import React, { useContext, useEffect, useState } from "react";
import {Input , Label, Card, Container, Row, Col, Nav, NavDropdown, Tab} from '../../Helpers/UiHelper'

import { AuthContext } from "../../ContextProvider/AuthContext";
import C_MSG from "../../Helpers/MsgsList";
import { setDocumentTitle } from "../../Helpers/Helper";

const Dashboard = (props) => {
    const {user:authUser = null} = useContext(AuthContext)
    const user = authUser?.user || {}
    const userId = user.user_id || null

    useEffect(() => {
        setDocumentTitle(C_MSG.admin_users_settings_document_title)
    }, [])

    return (
        <React.Fragment>

        </React.Fragment>
    )

}

export default Dashboard