import React, { Component } from "react";
import { Form, Button, FormControl, Tabs, Tab } from "react-bootstrap";
import "../register/register.css";
import { userInstance } from "../../axios/axiosconfig";
import { validateData, trackActivity, aliasTracking, setPeopleToTrack, isauth, isadminAuth } from "../../functions/functions";
import { NotificationManager } from "react-notifications";

import { Link } from "react-router-dom";


class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fname: "",
      lname: "",
      email: "",
      password: "",
      tnc: false,
      errmsg: "",
      employerFname: "",
      employerLname: "",
      employerEmail: "",
      employerPassword: "",
      employerTnc: false
    };
  }

  componentDidMount(){
    if(isadminAuth()){
        this.props.history.push("/admin/dashboard")
    }else{
        if(isauth()){
            this.props.history.push("/")
        }
    }
}

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  studentSignUp = async () => {
    const signUpPayload = {
      fname: this.state.fname,
      lname: this.state.lname,
      email: this.state.email,
      password: this.state.password,
      isemployer: false
    };

    console.log("s", signUpPayload);
    const isValid = validateData([
      signUpPayload.fname,
      signUpPayload.lname,
      signUpPayload.password,
      signUpPayload.email,
      this.state.tnc
    ]);
    // if(isValid){
    //     isValid = signUpPayload.email.indexOf(".nl", email.length - ".nl".length) !== -1
    // }
    if (isValid) {
      this.setState({ errmsg: "" });
      const response = await userInstance.post("/signup", signUpPayload);
      console.log("response", response);
      const statusCode = response.data.code;
      const msg = response.data.msg;

      if (statusCode === 200) {
        const userData = response.data.savedUser;
        const SIGN_UP_DATE = new Date().toISOString();
        //setting mix-panel alias and user properties
        aliasTracking(userData._id);
        setPeopleToTrack({
          $email: userData.email, // only special properties need the $

          "Sign up date": SIGN_UP_DATE, // Send dates in ISO timestamp format (e.g. "2020-01-02T21:07:03Z")

          USER_ID: userData._id, // use human-readable names

          "is employer": false // ...or numbers
        });
        trackActivity("sign up", { "sign up date": SIGN_UP_DATE });

        // this.props.closePopup()
        this.setState({
          fname: "",
          lname: "",
          email: "",
          password: "",
          tnc: false,
          errmsg: ""
        });
        NotificationManager.success(msg, "Message", 4000);
      } else if (statusCode === 400) {
        console.log(response.data.code);
        console.log(msg);
        NotificationManager.error(msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  employerSignUp = async () => {
    const signUpPayload = {
      fname: this.state.employerFname,
      lname: this.state.employerLname,
      email: this.state.employerEmail,
      password: this.state.employerPassword,
      isemployer: true
    };

    console.log("s", signUpPayload);
    const isValid = validateData([
      signUpPayload.fname,
      signUpPayload.lname,
      signUpPayload.password,
      signUpPayload.email,
      this.state.employerTnc
    ]);
    // if(isValid){
    //     isValid = signUpPayload.email.indexOf(".nl", email.length - ".nl".length) !== -1
    // }
    if (isValid) {
      this.setState({ errmsg: "" });
      const response = await userInstance.post("/signup", signUpPayload);
      console.log("response", response);
      const statusCode = response.data.code;
      const msg = response.data.msg;

      if (statusCode === 200) {
        // this.props.closePopup()
        const userData = response.data.savedUser;
        const SIGN_UP_DATE = new Date().toISOString();

        aliasTracking(userData._id);
        setPeopleToTrack({
          $email: userData.email, // only special properties need the $

          "Sign up date": SIGN_UP_DATE, // Send dates in ISO timestamp format (e.g. "2020-01-02T21:07:03Z")

          USER_ID: userData._id, // use human-readable names

          "is employer": true // ...or numbers
        });
        trackActivity("sign up", { "sign up date": SIGN_UP_DATE });

        this.setState({
          employerFname: "",
          employerLname: "",
          employerEmail: "",
          employerPassword: "",
          employerTnc: false,
          errmsg: ""
        });
        NotificationManager.success(msg, "Message", 4000);
      } else if (statusCode === 400) {
        console.log(response.data.code);
        console.log(msg);
        NotificationManager.error(msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  render() {
    return (
      <div className="register-section">
        <div className="container back-color">
          <div className="row">
            <div className="col-md-12">
              <div className="register-form">
                <h1>
                  Get your account on <span>Bowsy</span>
                </h1>
                <div className="rigister-tab">
                  <p>I want to register as:</p>
                  <Tabs
                    defaultActiveKey="home"
                    transition={false}
                    id="noanim-tab-example"
                  >
                    <Tab eventKey="home" title="Student">
                      <Form>
                        <div className="row">
                          <div className="col-md-6">
                            <Form.Group controlId="formBasicFirst">
                              <Form.Label>First Name</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder=""
                                name="fname"
                                onChange={this.handleChange}
                                value={this.state.fname}
                              />
                            </Form.Group>
                          </div>
                          <div className="col-md-6">
                            <Form.Group controlId="formBasicLast">
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder=""
                                name="lname"
                                onChange={this.handleChange}
                                value={this.state.lname}
                              />
                            </Form.Group>
                          </div>
                        </div>
                        <Form.Group controlId="formBasicEmail">
                          <Form.Label>Email address</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder=""
                            name="email"
                            onChange={this.handleChange}
                            value={this.state.email}
                          />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder=""
                            name="password"
                            onChange={this.handleChange}
                            value={this.state.password}
                          />
                        </Form.Group>

                        <Form.Group controlId="exampleForm.ControlSelect1">
                          <Form.Label>Country</Form.Label>
                          <Form.Control as="select">
                            <option>Netherlands</option>
                          </Form.Control>
                        </Form.Group>
                        <Form.Group
                          controlId="formBasicCheckbox"
                          className="dis-show"
                        >
                          <Form.Check
                            type="checkbox"
                            checked={this.state.tnc}
                            onChange={e =>
                              this.setState({ tnc: e.target.checked })
                            }
                          />
                          <Form.Label>
                            Yes, I agree to the{" "}
                            <Link className="terms-link" to={"/"}>
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link className="terms-link" to={"/"}>
                              Privacy Policy
                            </Link>
                            .
                          </Form.Label>
                        </Form.Group>
                        <div className="err">{this.state.errmsg}</div>
                        <div className="text-center">
                          <Button
                            className="signup-btn"
                            onClick={this.studentSignUp}
                          >
                            Create My Account
                          </Button>
                          {/* <Button className="signup-btn" onClick={''}>
                                                Create My Account
                                            </Button> */}
                        </div>
                      </Form>
                    </Tab>
                    <Tab eventKey="profile" title="Employer">
                      <Form>
                        <div className="row">
                          <div className="col-md-6">
                            <Form.Group controlId="formBasicFirst">
                              <Form.Label>First Name</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder=""
                                name="employerFname"
                                onChange={this.handleChange}
                                value={this.state.employerFname}
                              />
                            </Form.Group>
                          </div>
                          <div className="col-md-6">
                            <Form.Group controlId="formBasicLast">
                              <Form.Label>Last Name</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder=""
                                name="employerLname"
                                onChange={this.handleChange}
                                value={this.state.employerLname}
                              />
                            </Form.Group>
                          </div>
                        </div>
                        <Form.Group controlId="formBasicEmail">
                          <Form.Label>Email address</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder=""
                            name="employerEmail"
                            onChange={this.handleChange}
                            value={this.state.employerEmail}
                          />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder=""
                            name="employerPassword"
                            onChange={this.handleChange}
                            value={this.state.employerPassword}
                          />
                        </Form.Group>
                        <Form.Group controlId="exampleForm.ControlSelect1">
                          <Form.Label>Country</Form.Label>
                          <Form.Control as="select">
                            <option>Netherlands</option>
                          </Form.Control>
                        </Form.Group>
                        <Form.Group
                          controlId="formBasicCheckbox"
                          className="dis-show"
                        >
                          <Form.Check
                            type="checkbox"
                            checked={this.state.employerTnc}
                            onChange={e =>
                              this.setState({ employerTnc: e.target.checked })
                            }
                          />
                          <Form.Label>
                            Yes, I agree to the{" "}
                            <Link className="terms-link" to={"/"}>
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link className="terms-link" to={"/"}>
                              Privacy Policy
                            </Link>
                            .
                          </Form.Label>
                        </Form.Group>
                        <div className="err">{this.state.errmsg}</div>
                        <div className="text-center">
                          <Button
                            className="signup-btn"
                            onClick={this.employerSignUp}
                          >
                            Create My Account
                          </Button>
                        </div>
                      </Form>
                    </Tab>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Register;
