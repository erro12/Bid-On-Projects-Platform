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
import "./editChatEntity.css";
class EditChatEntity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      total: 1,
      index: 1,
      limit: 5,
      showPopup: false,
      showDelete: false,
      showAdd: false,
      chats: [],
      target: {}
    };
  }


  componentDidMount = () => {
    this.getchats();
  };

  componentDidUpdate() {
    if (this.state.loading) this.getchats();
  }

  togglePopup = target => {
    this.setState({
      showPopup: !this.state.showPopup,
      target
    });
    this.getchats();
  };
  toggleDelete = d_id => {
    this.setState({
      showDelete: !this.state.showDelete,
      d_id
    });
    this.getchats();
  };

  toggleAdd = () => {
    this.setState({
      showAdd: !this.state.showAdd
    });
    this.getchats();
  };

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

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getchats = async () => {
    const { index, limit } = this.state;
    console.log("about to get chats");
    const response = await adminInstance.post("/getchats", { index, limit });
    console.log("got chats, ", response.data);
    console.log("response,", response);
    if (response.data.code === 200) {
      const chats = response.data.chats;
      console.log("all chats, ", chats);
      this.setState({
        chats,
        loading: false,
        total: response.data.total
      });
      console.log(this.state);
    }
  };

  updatechats = async () => {
    console.log("state", this.state);
    const payload = {
      chats: this.state.chats
    };

    const isValid = validateData([payload.chats]);
    if (isValid) {
      const response = await adminInstance.post("/updatechats", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  deletechat = async d_id => {
    try {
      const response = await adminInstance.post("/deletechatById", {
        _id: d_id
      });
      console.log(response.data);
      if (response.data.code === 200) {
        //notifi for deletion
        NotificationManager.success(response.data.msg, "Message", 4000);
        console.log("burnt, ", d_id);
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
    this.toggleDelete({});
  };


  addchat = async chatData => {
    try {
      const response = await adminInstance.post("/addchat", chatData);
      if (response.data.code === 200) {
        //notifi for deletion
        NotificationManager.success(response.data.msg, "Message", 4000);
        console.log("created, ", chatData);
      } else {
        //notifi for error
        NotificationManager.error(response.data.msg, "Message", 4000);
        console.log("error in backend");
      }
    } catch (err) {
      //notifi for err in frontend
      console.log(err)
      NotificationManager.error("Error in request", "Message", 4000);
      console.log("error in frontend");
    }
    this.toggleAdd();
  };

  updatechat = async chat => {
    console.log("no i wont!");
    console.log("state", this.state);
    const payload = {
      _id: chat._id,
      employer: chat.employer,
      student: chat.student
    };

    const isValid = validateData([payload._id, payload.ques, payload.ans]);
    if (isValid) {
      const response = await adminInstance.post("/updatechat", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
        this.togglePopup();
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  tabRow() {
    // console.log("chats, ", this.state.chats);
    return this.state.chats.map(function(object, i) {
      return <TableRow obj={object} key={i} />;
    });
  }

  render() {
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <SidePanel />
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>Chats</h2>
                  <button onClick={this.toggleAdd}>Add New Chat</button>
                  <p>
                    {`Displaying Page ${this.state.index} of ${Math.ceil(this.state
                      .total / this.state.limit)}`}{" "}
                    <strong onClick={this.prevPage}>{" < "}</strong>{" "}
                    <strong onClick={this.nextPage}>{" > "}</strong>
                    {this.state.loading && <b>Loading...</b>}
                  </p>
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
                          <th>Employer</th>
                          <th>Student</th>
                          <th>Messages</th>
                          <th></th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.chats.map((object, i) => (
                          <TableRow
                            obj={object}
                            key={i}
                            delete={this.toggleDelete}
                            toggle={this.togglePopup}
                          />
                        ))}
                      </tbody>
                    </Table>

                    <Button
                      className="profile-btn"
                      onClick={this.updateProfile}
                    >
                      Save Changes
                    </Button>
                    {this.state.showPopup ? (
                      <Popup
                      target={this.state.target}
                        closePopup={this.togglePopup.bind(this)}
                        updatechat={this.updatechat}
                      />
                    ) : null}
                    {this.state.showDelete ? (
                      <DeleteUp
                        d_id={this.state.d_id}
                        deletechat={this.deletechat}
                        cancel={this.toggleDelete}
                      />
                    ) : null}
                    {this.state.showAdd ? (
                      <AddUp addchat={this.addchat} cancel={this.toggleAdd} />
                    ) : null}
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
export default EditChatEntity;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errmsg: ""
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
                      value=""
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
                      value=""
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
                  value=""
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder=""
                  name="password"
                  onChange={this.handleChange}
                  value=""
                />
              </Form.Group>

              <Form.Group controlId="exampleForm.ControlSelect1">
                <Form.Label>Country</Form.Label>
                <Form.Control as="select">
                  <option>Netherlands</option>
                </Form.Control>
              </Form.Group>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button className="signup-btn" onClick={this.props.closePopup}>
                  Create My Account
                </Button>
              </div>
            </Form>
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
      employer: "",
      student: "",
      errmsg: ""
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
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Employer</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="employer"
                      onChange={this.handleChange}
                      value={this.state.employer}
                    />
                  </Form.Group>
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Student</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="student"
                      onChange={this.handleChange}
                      value={this.state.student}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="signup-btn"
                  onClick={() => {
                    this.props.addchat({ student: this.state.student, employer: this.state.employer });
                  }}
                >
                  Create Chat
                </Button>
                <Button
                  className="signup-btn"
                  onClick={() => {
                    this.props.cancel();
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

class DeleteUp extends React.Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <div>
                    <h1>{`Sure to remove chat between: ${this.props.d_id.employer.fname} ${this.props.d_id.employer.lname} and ${this.props.d_id.student.fname} ${this.props.d_id.student.lname} ?`}</h1>
                  </div>
                </div>
              </div>
              <div className="row">
                <Button
                  className="signup-btn"
                  onClick={() => {
                    this.props.deletechat(this.props.d_id._id);
                  }}
                >
                  Confirm
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
          <td>{this.props.obj.employer.fname + " " + this.props.obj.employer.lname}</td>
          <td>{this.props.obj.student.fname + " " + this.props.obj.student.lname}</td>
          <td>{this.props.obj.messages[this.props.obj.messages.length-1].msg}</td>
          <td>
            <Button>Edit</Button>
          </td>
          <td>
            <Button onClick={() => {
                this.props.delete(this.props.obj);
              }}>Delete</Button>
          </td>
        </tr>
      </React.Fragment>
    );
  }
}
