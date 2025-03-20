import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { FaChartLine, FaUsers, FaMoneyBillWave, FaTasks } from 'react-icons/fa';
import { IoExitOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';


const Dashboard = () => {
  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Mimuco Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#analytics">Analytics</Nav.Link>
              <Nav.Link href="#settings">Settings</Nav.Link>
              <Link to="/" className="btn btn-outline-light">
                <IoExitOutline className="me-2" /> Logout
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h1 className="mb-4">Dashboard Overview</h1>
        
        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title><FaChartLine /> Revenue</Card.Title>
                <h3>€1,234,567</h3>
                <Card.Text className="text-success">+15% from last month</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title><FaUsers /> Active Users</Card.Title>
                <h3>45,678</h3>
                <Card.Text className="text-primary">+5% new users</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title><FaMoneyBillWave /> Profit Margin</Card.Title>
                <h3>23.4%</h3>
                <Card.Text className="text-warning">-2% from target</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title><FaTasks /> Tasks Completed</Card.Title>
                <h3>789</h3>
                <Card.Text className="text-info">98% completion rate</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Project Progress</Card.Title>
                <Card.Text>Data Integration Project</Card.Text>
                <ProgressBar now={60} label={`60%`} />
                <Card.Text className="mt-2">API Development</Card.Text>
                <ProgressBar now={85} label={`85%`} variant="success" />
                <Card.Text className="mt-2">User Interface Design</Card.Text>
                <ProgressBar now={30} label={`30%`} variant="info" />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Recent Activities</Card.Title>
                <ul className="list-unstyled">
                  <li>✅ New client onboarded: TechCorp Inc.</li>
                  <li>🔄 System update completed</li>
                  <li>📊 Monthly report generated</li>
                  <li>🚀 New feature deployed: Advanced Analytics</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Card.Title>Upcoming Tasks</Card.Title>
                <ul>
                  <li>Quarterly business review - Due in 5 days</li>
                  <li>Client presentation for DataSync Pro - Tomorrow</li>
                  <li>Team training on new security protocols - Next week</li>
                  <li>Software version update - Scheduled for 15th</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;
