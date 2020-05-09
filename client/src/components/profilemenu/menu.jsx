import React, { Component } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Tabs,
  Tab
} from "react-bootstrap";
import "../profilemenu/menu.css";
import { Link } from "react-router-dom";
import { userInstance } from "../../axios/axiosconfig";
import {
  isemployer,
  trackActivity,
  resetTracking
} from "../../functions/functions";

class ProfileMenu extends Component {
  constructor(props) {
    super(props);

    // this.isemployer = false;
  }

  componentDidMount() {
    console.log("clicked target, ", this.props.target);
    let e = document.getElementById(this.props.target);
    if (e) {
      console.log("target locked, ", e);
      e.classList.add("link-active");
    }
  }

  logout = async () => {
    const response = await userInstance.post("/logout");
    if (response.data.code === 200 || response.status === 200) {
      const LOG_OUT_DATE = new Date().toISOString();
      trackActivity("log out", { "log out date": LOG_OUT_DATE });
      resetTracking();
      window.location.href = "/";
    }
  };
  render() {
    const private_route = isemployer() ? "/employer" : "/student";
    const custom_editprofile = isemployer() ? "/editprofile" : "/editprofile";
    return (
      <div className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <ul>
            <li>
              <Link to={custom_editprofile} id="profile">
                Profile
              </Link>
            </li>
            {/* <li><Link to={'/academic'}>Academic Profile</Link></li>  */}
            {isemployer() ? (
              <li>
                <Link to={"/employer/changepassword"} id="changePassword">
                  Change Password
                </Link>
              </li>
            ) : (
              <li>
                <Link to={"/student/academic"} id="academic">
                  Academic Profile
                </Link>
              </li>
            )}
            {/* <li>
              <Link to={private_route + "/notifications"} id="email">
                Email/Notification
              </Link>
            </li> */}
            <li>
              {!isemployer() ? (
                <Link to={private_route + "/applications"} id="applications">
                  My Applications
                </Link>
              ) : (
                <Link to={private_route + "/edittasks"} id="applications">
                  My Tasks
                </Link>
              )}
            </li>
            <li>
              <Link to={private_route + "/uploads"} id="uploads">
                Uploads
              </Link>
            </li>
            {/* <li><Link to={'/'}>Password</Link></li> */}
            <li>
              <Link id="payment">Payment</Link>
            </li>
            {/* <li><Link to={'/'}>Security</Link></li> */}
            <li>
              <Link onClick={this.logout}>Logout</Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
export default ProfileMenu;
