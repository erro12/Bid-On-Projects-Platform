import React, { Component } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  FormControl
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "../header/header.css";
import logo from "../../assets/images/logo.png";
import employee from "../../assets/images/employe.jpg";
import { userInstance, adminInstance } from "../../axios/axiosconfig";
import {
  isauth,
  isemployer,
  isadminAuth,
  trackActivity,
  resetTracking
} from "../../functions/functions";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import history from "../../history";
import io from "socket.io-client";

class MainHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: null,
      nfCount: 0,
      blocked: false,
      auth: false,
      isAdmin: false,
      isOn: false
    };
  }

  componentDidMount() {
    const { socket, isOn } = this.state;
    if (socket != null && !isOn) {
      // console.log("opening listener after mount");

      socket.on("updates", this.checkUpdates);
      this.state.isOn = true;
      socket.on("readyForUpdates", () => {
        if (isauth()) {
          if (this.state.socket != null) {
            socket.emit("beginUpdates", {
              uid: this.props.profileData._id,
              employer: this.props.profileData.isemployer
            });
          }
        }
      });
    }
    this.setState({ auth: isauth(), isAdmin: isadminAuth() });
  }

  async componentDidUpdate() {
    const { socket, isOn } = this.state;
    if (socket != null) {
      // console.log("opening listener after update");
      socket.on("updates", this.checkUpdates);
    }
    if (this.state.blocked) {
      const response = await userInstance.post("/logout");
      // history.push('/')
      // console.log("response for logout request, ", response);
      if (response.data.code === 200 || response.status === 200) {
        const LOG_OUT_DATE = new Date().toISOString();
        trackActivity("block user from admin panel", { date: LOG_OUT_DATE });
        resetTracking();
        window.location.href = "/";
      }
    }
  }

  componentWillUnmount() {
    if (this.state.socket && this.state.isOn) {
      // console.log("closing socket listener");
      this.state.socket.off("updates");
    }
  }

  checkUpdates = updates => {
    // console.log('updates in header, ', updates)
    if (
      !(
        this.state.blocked === updates.blocked &&
        this.state.nfCount === updates.nfCount
      )
    ) {
      this.setState({
        blocked: updates.blocked,
        nfCount: updates.nfCount
      });
    }
  };

  changeState = newState => {
    // console.log("changing state, ", newState);
    this.setState(newState);
  };

  render() {
    return (
      <div className="main-header">
        {this.state.isAdmin ? (
          <AdminHeader />
        ) : this.state.auth === true ? (
          <LoggedInHeader
            socket={this.state.socket}
            profileData={this.props.profileData}
            nfCount={this.state.nfCount}
            changeState={this.changeState}
          />
        ) : (
          <Header />
        )}
      </div>
    );
  }
}

export default MainHeader;

class Header extends Component {
  render() {
    return (
      <div className="header">
        <div className="container">
          <Navbar expand="lg">
            <Navbar.Brand onClick={() => history.push("/")}>
              <img src={logo} />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link className="active" onClick={() => history.push("/")}>
                  Home
                </Nav.Link>
                <Nav.Link onClick={() => history.push("/tasks")}>
                  Find a Task
                </Nav.Link>
                {/* <Nav.Link onClick={() => history.push("/")}>
                  Find a Challange
                </Nav.Link> */}
                <Nav.Link onClick={() => history.push("/#howItWorks")}>
                  How it Works
                </Nav.Link>
              </Nav>
              <Form inline>
                <Link className="employe-button" to={"/login"}>
                  <i className="fa fa-user" aria-hidden="true"></i> Login
                </Link>
                <Link className="employe-button active-btn" to={"/register"}>
                  <i className="fa fa-user" aria-hidden="true"></i>Register
                </Link>
              </Form>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>
    );
  }
}

class AdminHeader extends Component {
  adminLogout = async () => {
    const response = await adminInstance.post("/logout");
    // history.push('/')
    window.location.href = "/";
  };

  render() {
    return (
      <div className="header">
        <div className="container">
          <Navbar expand="lg">
            <Navbar.Brand onClick={() => history.push("/")}>
              <img src={logo} />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              {/* <Nav className="mr-auto"> */}
              {/* <Nav.Link className="active" onClick={() => history.push("/")}>
                  Home
                </Nav.Link>
                <Nav.Link onClick={() => history.push("/tasks")}>Find a Task</Nav.Link>
                <Nav.Link onClick={() => history.push("/")}>Find a Challange</Nav.Link>
                <Nav.Link onClick={() => history.push("/")}>How it Works</Nav.Link>
              </Nav> */}
              <Form inline>
                {/* <Link className="employe-button" to={"/login"}>
                  <i className="fa fa-user" aria-hidden="true"></i> Login
                </Link>
                <Link className="employe-button active-btn" to={"/register"}>
                  <i className="fa fa-user" aria-hidden="true"></i>Register
                </Link> */}
                <Button
                  className="btn btn-secondary"
                  onClick={this.adminLogout}
                  style={{ alignSelf: "flex-end" }}
                >
                  Logout
                </Button>
              </Form>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>
    );
  }
}

class LoggedInHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      photo: ""
    };
  }

  componentWillReceiveProps() {
    // console.log("logged in header before receiving props, ", this.props);
    if (isauth()) {
      if (this.props.socket == null) {
        let socket = io("http://3.133.60.237:3001/");
        socket.emit("beginUpdates", {
          uid: this.props.profileData._id,
          employer: this.props.profileData.isemployer
        });
        this.props.changeState({
          socket
        });
      }
    }
  }

  componentDidUpdate() {
    // console.log("updated loggedin header, ", this.props.nfCount);
  }

  logout = async () => {
    const response = await userInstance.post("/logout");
    // history.push('/')
    // console.log("response for logout request, ", response);
    if (response.data.code === 200 || response.status === 200) {
      const LOG_OUT_DATE = new Date().toISOString();
      trackActivity("log out", { "log out date": LOG_OUT_DATE });
      resetTracking();
      window.location.href = "/";
    }
  };

  render() {
    let route_link = isemployer() ? "/employer" : "/student";
    let profile_link = isemployer() ? "/employer/profile" : "/student/profile";
    let dashboard_link = isemployer()
      ? "/employer/dashboard"
      : "/student/dashboard";
    return (
      <div className="header">
        <div className="container">
          <Navbar expand="lg">
            <Navbar.Brand onClick={() => history.push("/")}>
              <img src={logo} />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Nav.Link className="active" onClick={() => history.push("/")}>
                  Home
                </Nav.Link>
                <Nav.Link onClick={() => history.push(route_link + "/tasks")}>
                  Tasks
                </Nav.Link>
                <Nav.Link onClick={() => history.push(route_link + "/mytasks")}>
                  My Tasks
                </Nav.Link>
                <Nav.Link onClick={() => history.push("/#howItWorks")}>
                  How it Works
                </Nav.Link>
              </Nav>
              <Form inline>
                {isemployer() ? (
                  <React.Fragment>
                    <Link
                      className="employe-button active-btn"
                      to={"/employer/createtask"}
                    >
                      Post a Task
                    </Link>

                    <Link className="pagination" to={"/employer/notifications"}>
                      {" "}
                      <i class="fa fa-bell fa-2x" aria-hidden="true"></i>
                      <span className="badge">{this.props.nfCount}</span>
                    </Link>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Link className="pagination" to={"/student/notifications"}>
                      {" "}
                      <i class="fa fa-bell fa-2x" aria-hidden="true"></i>
                      <span className="badge">{this.props.nfCount}</span>
                    </Link>
                  </React.Fragment>
                )}

                <div className="my-profile-menu">
                  {/* <div className="p-pic" onClick={()=>history.push(profile_link)}> */}
                  <div
                    className="p-pic"
                    onClick={() => history.push(dashboard_link)}
                  >
                    <img
                      className="changeCursor"
                      src={
                        "http://3.133.60.237:3001/" +
                        this.props.profileData.photo
                      }
                      alt=""
                    />
                  </div>
                  <div className="p-name">
                    {/* <h5 onClick={()=>history.push(profile_link)}>{this.props.profileData.fname+' '+this.props.profileData.lname}</h5> */}
                    <h5
                      onClick={() => history.push(profile_link)}
                      className="changeCursor"
                    >
                      {this.props.profileData.fname +
                        " " +
                        this.props.profileData.lname}
                    </h5>
                    <span>
                      €
                      {this.props.profileData.balance
                        ? this.props.profileData.balance
                        : 0}
                      .00 EUR
                    </span>
                    <Dropdown>
                      <Dropdown.Toggle
                        variant="default"
                        id="dropdown-basic"
                      ></Dropdown.Toggle>
                      <Dropdown.Menu>
                        {/* <Dropdown.Item onClick={()=>history.push(profile_link)}>My Profile</Dropdown.Item> */}
                        <Dropdown.Item
                          onClick={() => history.push(profile_link)}
                        >
                          My Profile
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => history.push(dashboard_link)}
                        >
                          Dashboard
                        </Dropdown.Item>
                        {/* <Dropdown.Item onClick={()=>history.push('/profile')}>My Profile</Dropdown.Item> */}
                        {/* <Dropdown.Item onClick={() => history.push("/profile")}>
                          My Profile
                        </Dropdown.Item> */}
                        <Dropdown.Item onClick={this.logout}>
                          Logout
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </Form>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>
    );
  }
}
