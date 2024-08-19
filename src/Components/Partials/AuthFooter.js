import { Col, Container, Row } from "../../Helpers/UiHelper";

const AuthFooter = () => {
    return (
        <footer className="footer">
            <Container>
                <Row>
                    <Col lg={12}>
                        <div className="text-center text-white">
                            <p className="mb-0">&copy; {new Date().getFullYear()} {process.env.REACT_APP_SITE_NAME} - All Rights Reserved </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    )
}

export default AuthFooter