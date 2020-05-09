import React, { Component } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Tabs,
  Tab,
  Table
} from "react-bootstrap";
import upload from "../../../../assets/images/upload.jpg";
import { Link } from "react-router-dom";
import {
  userInstance,
  employerInstance,
  studentInstance,
  adminInstance
} from "../../../../axios/axiosconfig";
import { validateData } from "../../../../functions/functions";
import { NotificationManager } from "react-notifications";
import SidePanel from "../sidepanel/sidepanel";
// import "./editUserEntity.css";
import "../../assets/editStyle.css"


class EditUserEntity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      total: 1,
      index: 1,
      limit: 20,
      showPopup: false,
      showAdd: false,
      showDelete: false,
      showView: false,
      d_id: {},
      target: {},
      users: [],
      type: "None",
      sortBy: "None",
      desc: false
    };
  }

  componentDidMount = () => {
    this.getusers();
  };

  componentDidUpdate() {
    if (this.state.loading) this.getusers();
  }

  nextPage = () => {
    console.log(this.state.total);
    console.log(this.state.limit);
    console.log(this.state.total / this.state.limit);
    if (
      !this.state.loading &&
      this.state.index < this.state.total / this.state.limit
    ) {
      this.setState({
        index: this.state.index + 1,
        loading: true
      });
    }
  };

  prevPage = () => {
    if (!this.state.loading && this.state.index > 1) {
      this.setState({
        index: this.state.index - 1,
        loading: true
      });
    }
  };

  togglePopup = target => {
    this.setState({
      showPopup: !this.state.showPopup,
      target
    });
    this.getusers();
  };

  toggleView = target => {
    this.setState({
      showView: !this.state.showView,
      target
    });
    this.getusers();
  };

  toggleDelete = async d_id => {
    if(await window.confirm("confirm delete user: "+d_id.fname+" "+d_id.lname+" ?")){
      this.deleteuser(d_id._id)
    }
    // this.setState({
    //   showDelete: !this.state.showDelete,
    //   d_id
    // });
    this.getusers();
  };

  toggleAdd = () => {
    this.setState({
      showAdd: !this.state.showAdd
    });
    this.getusers();
  };

  handleChange = e => {
    console.log("changing type, ", e.target.value);
    this.setState({ [e.target.name]: e.target.value, loading: true });
  };

  getusers = async () => {
    const { index, limit, type, sortBy, desc } = this.state;
    const response = await adminInstance.post("/getusers", {
      index,
      limit,
      type,
      sortBy,
      desc
    });
    console.log("got limited users, ", response.data);
    console.log("response,", response);
    if (response.data.code === 200) {
      const users = response.data.users;
      console.log("all users, ", users);
      console.log("total count, ", response.data.total);
      this.setState({
        users,
        loading: false,
        total: response.data.total,
        sortBy: "None",
      });
    }
  };

  updateusers = async () => {
    console.log("state", this.state);
    const payload = {
      users: this.state.users
    };

    const isValid = validateData([payload.users]);
    if (isValid) {
      const response = await adminInstance.post("/updateusers", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  deleteuser = async d_id => {
    try {
      const response = await adminInstance.post("/deleteuserById", {
        _id: d_id
      });
      console.log(response.data);
      if (response.data.code === 200) {
        //notifi for deletion
        NotificationManager.success(response.data.msg, "Message", 4000);
        console.log("killed, ", d_id);
      } else {
        //notifi for error
        NotificationManager.error(response.data.msg, "Message", 4000);
        console.log("error in backend");
      }
    } catch (err) {
      //notifi for err in frontend
      NotificationManager.error("Error in request", "Message", 4000);
      console.log("error in frontend");
    }
    // this.toggleDelete({});
  };

  adduser = async payload => {
    try {
      payload.isemployer
        ? this.employerSignUp(payload)
        : this.studentSignUp(payload);
      // const response = await adminInstance.post("/adduser", userData);
      // if (response.data.code === 200) {
      //   //notifi for deletion
      //   NotificationManager.success(response.data.msg, "Message", 4000);
      //   console.log("created, ", userData);
      // } else {
      //   //notifi for error
      //   NotificationManager.error(response.data.msg, "Message", 4000);
      //   console.log("error in backend");
      // }
    } catch (err) {
      //notifi for err in frontend
      NotificationManager.error("Error in request", "Message", 4000);
      console.log("error in frontend");
    }
    // this.toggleAdd();
  };

  studentSignUp = async payload => {
    const signUpPayload = {
      fname: payload.fname,
      lname: payload.lname,
      email: payload.email,
      password: payload.password,
      isemployer: false,
      isvalid: payload.tnc
    };

    console.log("s", signUpPayload);
    const isValid = validateData([
      signUpPayload.fname,
      signUpPayload.lname,
      signUpPayload.password,
      signUpPayload.email
      // signUpPayload.isvalid
    ]);
    if (isValid) {
      if (this.checkEmail(signUpPayload.email)) {
        this.setState({ errmsg: "" });
        const response = await adminInstance.post("/adduser", signUpPayload);
        console.log("response", response);
        const statusCode = response.data.code;
        const msg = response.data.msg;

        if (statusCode === 200) {
          // this.props.closePopup()
          NotificationManager.success(msg, "Message", 4000);
          this.toggleAdd();
        } else if (statusCode === 400) {
          console.log(response.data.code);
          console.log(msg);
          NotificationManager.error(msg, "Message", 4000);
        }
      } else {
        NotificationManager.error("Email format invalid", "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  employerSignUp = async payload => {
    const signUpPayload = {
      fname: payload.employerFname,
      lname: payload.employerLname,
      email: payload.employerEmail,
      password: payload.employerPassword,
      isemployer: true,
      isvalid: payload.employerTnc
    };

    console.log("e", signUpPayload);
    const isValid = validateData([
      signUpPayload.fname,
      signUpPayload.lname,
      signUpPayload.password,
      signUpPayload.email
      // signUpPayload.isvalid
    ]);

    if (isValid) {
      console.log("valid");
      if (this.checkEmail(signUpPayload.email)) {
        this.setState({ errmsg: "" });
        const response = await adminInstance.post("/adduser", signUpPayload);
        console.log("response", response);
        const statusCode = response.data.code;
        const msg = response.data.msg;

        if (statusCode === 200) {
          // this.props.closePopup()
          NotificationManager.success(msg, "Message", 4000);
          this.toggleAdd();
        } else if (statusCode === 400) {
          console.log(response.data.code);
          console.log(msg);
          NotificationManager.error(msg, "Message", 4000);
        }
      } else {
        NotificationManager.error("Email format invalid", "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  checkEmail = email => {
    if (
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      return true;
    }
    return false;
  };

  updateuser = async user => {
    console.log("no i wont!");
    console.log("state", this.state);
    const payload = {
      _id: user._id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      isvalid: user.isvalid,
      blocked: user.blocked
    };

    const isValid = validateData([payload.fname, payload.lname, payload.email]);
    if (isValid) {
      //CHECK EMAIL REGEX
      if (this.checkEmail(payload.email)) {
        const response = await adminInstance.post("/updateuser", payload);
        if (response.data.code === 200) {
          NotificationManager.success(response.data.msg, "Message", 4000);
          this.togglePopup();
        } else {
          NotificationManager.error(response.data.msg, "Message", 4000);
        }
      } else {
        NotificationManager.error("Invalid email format", "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  tabRow() {
    // console.log("users, ", this.state.projects);
    return this.state.users.map(function(object, i) {
      return <TableRow obj={object} key={i} />;
    });
  }

  changeState = newState => {
    if (!this.state.loading) {
      console.log("changing, ", newState);
      this.setState({
        sortBy: newState.sortBy,
        desc: !this.state.desc,
        loading: true
      });
    }
  };

  render() {
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <SidePanel target="users"/>
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-9">
                  <h2>Users</h2>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    onClick={this.toggleAdd}
                  >
                    Add New User
                  </button>
      
                </div>
                <div className="col-md-3">
                  <div className="widget">
                    <h4>Type</h4>

                    <select
                      data-placeholder="Choose Category"
                      className="chosen-select-no-single"
                      name="type"
                      value={this.state.type}
                      onChange={this.handleChange}
                    >
                      <option>Employer </option>
                      <option>Student</option>
                      <option> None</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="dashboard-list-box margin-top-0">
                  <div className="dashboard-list-box-static">
                    <Table>
                      <thead>
                        <tr>
                          <th>
                            name{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "fname",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>
                            email{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "email",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>
                            type{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "isemployer",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.users.map((object, i) => (
                          <TableRow
                            obj={object}
                            key={i}
                            toggle={this.togglePopup}
                            delete={this.toggleDelete}
                            view={this.toggleView}
                          />
                        ))}
                      </tbody>
                    </Table>
                    {/*
                    <Button
                      className="profile-btn"
                      onClick={this.updateProfile}
                    >
                      Save Changes
                    </Button> */}
                    
                    
                  </div>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-md-12">
                  <div className="pagination">
                   <span> {`Displaying Page ${this.state.index} of ${Math.ceil(
                      this.state.total / this.state.limit
                    )}`}{" "}</span>
                    <i
                      class="fa fa-chevron-left"
                      aria-hidden="true"
                      onClick={this.prevPage}
                    ></i>{" "}
                    <i
                      class="fa fa-chevron-right"
                      aria-hidden="true"
                      onClick={this.nextPage}
                    ></i>{" "}
                    {this.state.loading && <b>Loading...</b>}
                  </div>
              </div>
            </div>

          </div>
        </div>


        {this.state.showPopup ? (
          <Popup
            target={this.state.target}
            updateuser={this.updateuser}
            closePopup={this.togglePopup.bind(this)}
          />
        ) : null}

          {this.state.showView ? (
            <ViewDetails
              target={this.state.target}
              closePopup={this.toggleView.bind(this)}
            />
          ) : null}
          {this.state.showAdd ? (
            <AddUp adduser={this.adduser} cancel={this.toggleAdd} />
          ) : null}

      </div>
    );
  }
}
export default EditUserEntity;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fname: "",
      lname: "",
      email: "",
      isvalid: false,
      _id: "",
      errmsg: "",
      blocked: false
    };
  }

  componentWillMount() {
    const { target } = this.props;
    this.setState({
      fname: target.fname,
      lname: target.lname,
      email: target.email,
      isvalid: target.isvalid,
      _id: target._id,
      blocked: target.blocked
    });
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
          <div className="form-title">
              <h2>Edit User</h2>
            </div>
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
              </div><div className="col-md-12">
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
              </div>
                <div className="col-md-6">
              <Form.Group controlId="formBasicCheckbox" className="dis-show">
                <Form.Check
                  type="checkbox"
                  checked={this.state.isvalid}
                  onChange={e => this.setState({ isvalid: e.target.checked })}
                />
                <Form.Label>User verified</Form.Label>
              </Form.Group>
              </div>
                <div className="col-md-6">
              <Form.Group controlId="formBasicCheckbox" className="dis-show">
                <Form.Check
                  type="checkbox"
                  checked={this.state.blocked}
                  onChange={e => this.setState({ blocked: e.target.checked })}
                />
                <Form.Label>Account Blocked</Form.Label>
              </Form.Group>
              </div>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.updateuser({
                      fname: this.state.fname,
                      lname: this.state.lname,
                      email: this.state.email,
                      isvalid: this.state.isvalid,
                      blocked: this.state.blocked,
                      _id: this.state._id
                    });
                  }}
                >
                  Update user
                </Button>
                <Button
                className="cancle-btn"
                  onClick={() => {
                    this.props.closePopup();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

class ViewDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      target: {}
    };
  }

  componentWillMount() {
    const { target } = this.props;
    this.setState({
      target
    });
  }
  render() {
    const { target } = this.state;
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div className="row">
              <div className="col-md-12">
                <Table>
                  <tbody>
                    {/* {Object.keys(this.state.target).map((key)=>(
                    <tr>
                      <td>
                        {key}
                      </td>
                      <td>
                        {this.state.target[key]}
                      </td>
                    </tr>
                  ))} */}
                    <tr>
                      <td>Full Name</td>
                      <td>{target.fname + " " + target.lname}</td>
                    </tr>
                    <tr>
                      <td>E-mail Address</td>
                      <td>{target.email}</td>
                    </tr>
                    <tr>
                      <td>Employer / Student</td>
                      <td>{target.isemployer ? "Employer" : "Student"}</td>
                    </tr>
                    <tr>
                      <td>Account Verification</td>
                      <td>{target.isvalid ? "Verified" : "Not Verified"}</td>
                    </tr>
                    <tr>
                      <td>Account Status</td>
                      <td>{target.blocked ? "Blocked" : "Active"}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
            <Button
            className="cancle-btn"
              onClick={() => {
                this.props.closePopup();
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

class AddUp extends React.Component {
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

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div className="row">
              <div className="col-md-12">
                <div className="register-form">
                  <div className="rigister-tab">
                    <p>Register user as:</p>
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
                            <Form.Label>Register as verified</Form.Label>
                          </Form.Group>
                          <div className="err">{this.state.errmsg}</div>
                          <div className="text-center">
                            <Button
                              className="signup-btn"
                              onClick={() => {
                                this.props.adduser({
                                  fname: this.state.fname,
                                  lname: this.state.lname,
                                  email: this.state.email,
                                  password: this.state.password,
                                  isemployer: false,
                                  tnc: this.state.tnc
                                });
                              }}
                            >
                              Create Account
                            </Button>
                            <Button
                              className="signup-btn"
                              onClick={() => {
                                this.props.cancel("");
                              }}
                            >
                              Cancel
                            </Button>
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
                            <Form.Label>Register as verified</Form.Label>
                          </Form.Group>
                          <div className="err">{this.state.errmsg}</div>
                          <div className="text-center">
                            <Button
                              className="signup-btn"
                              onClick={() => {
                                this.props.adduser({
                                  fname: this.state.employerFname,
                                  lname: this.state.employerLname,
                                  email: this.state.employerEmail,
                                  password: this.state.employerPassword,
                                  isemployer: true,
                                  employerTnc: this.state.employerTnc
                                });
                              }}
                            >
                              Create Account
                            </Button>
                            <Button
                              className="signup-btn"
                              onClick={() => {
                                this.props.cancel("");
                              }}
                            >
                              Cancel
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
      </div>
    );
  }
}

class TableRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <tr>
          <td>{this.props.obj.fname + " " + this.props.obj.lname}</td>
          <td>{this.props.obj.email}</td>
          <td>{this.props.obj.isemployer ? "Employer" : "Student"}</td>
          <td>
            <i
              class="fa fa-eye"
              aria-hidden="true"
              onClick={() => {
                this.props.view(this.props.obj);
              }}
            ></i>
            {"     "}
            <i
              class="fa fa-pencil fa-fw"
              aria-hidden="true"
              onClick={() => {
                this.props.toggle(this.props.obj);
              }}
            ></i>
            {"     "}
            <i
              class="fa fa-trash"
              aria-hidden="true"
              onClick={() => {
                this.props.delete(this.props.obj);
              }}
            ></i>
          </td>
        </tr>
      </React.Fragment>
    );
  }
}
