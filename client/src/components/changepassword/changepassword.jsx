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
import "./changepassword.css";
import { userInstance, employerInstance } from "../../axios/axiosconfig";
import { validateData } from "../../functions/functions";
import { NotificationManager } from "react-notifications";
import ProfileMenu from "../../components/profilemenu/menu";
import linkedin from "../../assets/images/linkedin.png";

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isChecked: null,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    };
  }

  componentWillMount() {
    this.setState({ isChecked: this.props.isChecked });
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  changePassword = async () => {
    const payload = {
      currentPassword: this.state.currentPassword,
      newPassword: this.state.newPassword
    };
    const isValid = validateData([
      payload.currentPassword,
      payload.newPassword,
      this.state.confirmPassword
    ]);
    console.log("is it valid?, ", isValid);
    if (isValid) {
      if (payload.newPassword === this.state.confirmPassword) {
        const response = await employerInstance.post(
          "/changepassword",
          payload
        );
        if (response.data.code === 200) {
          this.setState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          NotificationManager.success(response.data.msg, "Message", 4000);
        } else {
          NotificationManager.error(response.data.msg, "Message", 4000);
        }
      } else {
        NotificationManager.error("Passwords do not match!", "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  render() {
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <ProfileMenu target="changePassword" />

          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>Change password</h2>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="dashboard-list-box margin-top-0">
                  <div className="dashboard-list-box-static">
                    <div className="my-profile">
                      <div className="form-group">
                        <label className="margin-top-0">Current Password</label>
                        <input
                          class="form-control"
                          name="currentPassword"
                          value={this.state.currentPassword}
                          onChange={this.handleChange}
                          type="password"
                        />
                      </div>

                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          class="form-control"
                          name="newPassword"
                          value={this.state.newPassword}
                          onChange={this.handleChange}
                          type="password"
                        />
                      </div>

                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          class="form-control"
                          name="confirmPassword"
                          value={this.state.confirmPassword}
                          onChange={this.handleChange}
                          type="password"
                        />
                      </div>

                      <Button
                        className="profile-btn"
                        onClick={this.changePassword}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ChangePassword;
