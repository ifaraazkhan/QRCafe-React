import React from "react";
import { Col, Container, Row } from "../../Helpers/UiHelper";

const Footer = () => {
    return (
        <React.Fragment>
            <footer className="footer">
                <Container fluid>
                    <Row>
                        <Col sm={6}>
                            &copy; {new Date().getFullYear()}
                        </Col>
                        <Col sm={6}>
                            <div className="text-sm-end d-none d-sm-block">
                                {process.env.REACT_APP_SITE_NAME} - All Rights Reserved
                            </div>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </React.Fragment>
    )
}

export default Footer