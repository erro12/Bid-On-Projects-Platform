import React, { Component } from "react";
import { Form, Button, Col, Table } from "react-bootstrap";
import { adminInstance } from "../../../../axios/axiosconfig";
import { validateData } from "../../../../functions/functions";
import { NotificationManager } from "react-notifications";
import SidePanel from "../sidepanel/sidepanel";
// import "./editBidEntity.css";
import "../../assets/editStyle.css";


class EditBidEntity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      projects: [],
      students: [],
      total: 1,
      index: 1,
      limit: 20,
      showDelete: false,
      showView: false,
      showAdd: false,
      showPopup: false,
      target: {},
      bids: [],
      targetObj: "",
      type: "None",
      sortBy: "None",
      desc: false
    };
  }

  componentDidMount = () => {
    this.getbids();
  };

  componentDidUpdate() {
    if (this.state.loading) this.getbids();
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

  toggleView = target => {
    this.setState({
      showView: !this.state.showView,
      target
    });
    // this.getblogs();
  };

  togglePopup = target => {
    this.setState({
      showPopup: !this.state.showPopup,
      target
    });
    this.getbids();
  };

  toggleDelete = async d_id => {
    if(window.confirm("confirm delete application ?")){
      await this.deletebid(d_id._id);
    }
    // this.setState({
    //   showDelete: !this.state.showDelete,
    //   d_id
    // });
    this.getbids();
  };

  toggleAdd = () => {
    this.setState({
      showAdd: !this.state.showAdd
    });
    this.getbids();
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value, loading: true });
  };

  getbids = async () => {
    const { index, limit, type, sortBy, desc } = this.state;
    console.log("about to get bids");
    const response = await adminInstance.post("/getbids", {
      index,
      limit,
      type,
      sortBy,
      desc
    });
    console.log("got bids, ", response.data);
    console.log("response,", response);
    if (response.data.code === 200) {
      const bids = response.data.bids;
      console.log("all bids, ", bids);
      this.setState({
        bids,
        projects: response.data.projects,
        students: response.data.students,
        loading: false,
        total: response.data.total,
        sortBy: "None"
      });
      // console.log(this.state);
    }
  };

  updatebids = async () => {
    console.log("state", this.state);
    const payload = {
      bids: this.state.bids
    };

    const isValid = validateData([payload.bids]);
    if (isValid) {
      const response = await adminInstance.post("/updatebids", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  deletebid = async d_id => {
    try {
      const response = await adminInstance.post("/deletebidById", {
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
  };

  addbid = async bidData => {
    try {
      const isValid = validateData([bidData.projectId, bidData.studentId]);
      if (isValid) {
        const response = await adminInstance.post("/addbid", bidData);
        if (response.data.code === 200) {
          //notifi for deletion
          NotificationManager.success(response.data.msg, "Message", 4000);
          console.log("created, ", bidData);
          this.toggleAdd();
        } else {
          //notifi for error
          NotificationManager.error(response.data.msg, "Message", 4000);
          console.log("error in backend");
        }
      } else {
        NotificationManager.error("Some fields are empty", "Message", 4000);
      }
    } catch (err) {
      //notifi for err in frontend
      NotificationManager.error("Error in request", "Message", 4000);
      console.log("error in frontend");
    }
  };

  updatebid = async bid => {
    console.log("no i wont!");
    console.log("state", this.state);
    const payload = {
      _id: bid._id,
      // projectId: bid.projectId,
      // studentId: bid.studentId,
      // employerId: bid.employerId,
      status: bid.status,
      detail: bid.detail
      // bidDate: bid.bidDate
    };
    console.log("editing bid, pay;oad to update, ", payload);
    const isValid = validateData([
      payload._id,
      // payload.projectId,
      // payload.studentId,
      // payload.employerId,
      payload.status
      // payload.bidDate
    ]);
    if (isValid) {
      const response = await adminInstance.post("/updatebid", payload);
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
    // console.log("bids, ", this.state.bids);
    return this.state.bids.map(function(object, i) {
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
    const { targetObj, showPopup } = this.state;
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <SidePanel target="applications"/>
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-9">
                  <h2>Applications</h2>
                  <button class="btn btn-secondary" onClick={this.toggleAdd}>
                    Add Application
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
                      <option>None</option>
                      <option>Pending</option>
                      <option>Approved</option>
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
                          <th>task</th>
                          <th>student</th>
                          <th>employer</th>
                          <th>
                            status{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "status",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.bids.map((object, i) => (
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

                    {/* <Button
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
                  
                    <span>{`Displaying Page ${this.state.index} of ${Math.ceil(
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
            closePopup={this.togglePopup.bind(this)}
            updatebid={this.updatebid}
          />
        ) : null}
        {this.state.showView ? (
          <ViewDetails
            target={this.state.target}
            closePopup={this.toggleView.bind(this)}
          />
        ) : null}
        {this.state.showAdd ? (
          <AddUp
            addbid={this.addbid}
            cancel={this.toggleAdd}
            projects={this.state.projects}
            students={this.state.students}
          />
        ) : null}


      </div>
    );
  }
}
export default EditBidEntity;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: "",
      // projectId: "",
      // studentId: "",
      // employerId: "",
      status: "",
      // bidDate: "",
      detail: "",
      errmsg: ""
    };
  }

  componentWillMount() {
    const { target } = this.props;
    this.setState({
      _id: target._id,
      // projectId: target.projectId._id,
      // studentId: target.studentId._id,
      // employerId: target.employerId._id,
      status: target.status,
      // bidDate: target.bidData,
      detail: target.detail
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
                <h2>Edit Application</h2>
            </div>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  {/* <Form.Group controlId="formBasicFirst">
                    <Form.Label>Project</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="projectId"
                      onChange={this.handleChange}
                      value={this.state.projectId}
                    />
                  </Form.Group> */}
                </div>
                <div className="col-md-6">
                  {/* <Form.Group controlId="formBasicLast">
                    <Form.Label>Employer</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="employerId"
                      onChange={this.handleChange}
                      value={this.state.employerId}
                    />
                  </Form.Group> */}
                </div>
              </div>
              {/* <Form.Group controlId="formBasicEmail">
                <Form.Label>Student</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  name="studentId"
                  onChange={this.handleChange}
                  value={this.state.studentId}
                />
              </Form.Group> */}

          <div className="col-md-12">
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Detail</Form.Label>
                <textarea className="form-control"                   
                  placeholder=""
                  name="detail"
                  onChange={this.handleChange}
                  value={this.state.detail}
                />
              </Form.Group>
              </div>

              {/* <Form.Group controlId="formBasicPassword">
                <Form.Label>Bid Date</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  name="bidDate"
                  onChange={this.handleChange}
                  value={this.state.bidDate}
                />
              </Form.Group> */}
            <div className="col-md-12">
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  name="status"
                  onChange={this.handleChange}
                  value={this.state.status}
                />
              </Form.Group>
              </div>

              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.updatebid({
                      _id: this.state._id,
                      // projectId: this.state.projectId,
                      // studentId: this.state.studentId,
                      // employerId: this.state.employerId,
                      status: this.state.status,
                      // bidDate: this.state.bidData,
                      detail: this.state.detail
                    });
                  }}
                >
                  Update Bid
                </Button>
                <Button className="cancle-btn"
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

class AddUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectId: "",
      studentId: "",
      // target: "",
      employerId: "",
      status: "",
      bidDate: "",
      detail: "",
      errmsg: ""
    };
  }
  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    console.log(e.target.name, ", is now, ", e.target.value);
  };
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div className="form-title">
                <h2>Add Application</h2>
            </div>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Project</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.projectId}
                      name="projectId"
                      onChange={this.handleChange}
                    >
                      <option value="">Select a project</option>
                      {this.props.projects.map(project => (
                        <option key={project._id} value={project._id}>
                          {project.jobTitle}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Student</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.studentId}
                      name="studentId"
                      onChange={this.handleChange}
                    >
                      <option value="">Select a Student</option>
                      {this.props.students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.fname + " " + student.lname}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="col-md-12">
                <Form.Group controlId="formBasicPassword">
                <Form.Label>Detail</Form.Label>
                <textarea className="form-control" 
                  placeholder=""
                  name="detail"
                  onChange={this.handleChange}
                  value={this.state.detail}
                />
              </Form.Group>

                </div>
              </div>

             

              {/* <Form.Group controlId="formBasicPassword">
                <Form.Label>Bid Date</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  name="bidDate"
                  onChange={this.handleChange}
                  value={this.state.bidDate}
                />
              </Form.Group> */}

              {/* <Form.Group controlId="formBasicPassword">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  name="status"
                  onChange={this.handleChange}
                  value={this.state.status}
                />
              </Form.Group> */}

              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.addbid({
                      projectId: this.state.projectId,
                      studentId: this.state.studentId,
                      // employerId: this.state.employerId,
                      // status: this.state.status,
                      // bidDate: this.state.bidData,
                      detail: this.state.detail
                    });
                  }}
                >
                  Create Bid
                </Button>
                <Button
                  className="cancle-btn"
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
                    <tr>
                      <td>task</td>
                      <td>{target.projectId.jobTitle}</td>
                    </tr>
                    <tr>
                      <td>Employer</td>
                      <td>{target.employerId.fname+" "+target.employerId.lname}</td>
                    </tr>
                    <tr>
                      <td>Student</td>
                      <td>{target.studentId.fname+" "+target.studentId.lname}</td>
                    </tr>
                    <tr>
                      <td>task</td>
                      <td>{target.projectId.jobTitle}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
            <Button
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

class TableRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <tr>
          <td>{this.props.obj.projectId.jobTitle}</td>
          <td>
            {this.props.obj.studentId.fname +
              " " +
              this.props.obj.studentId.lname}
          </td>
          <td>
            {this.props.obj.employerId.fname +
              " " +
              this.props.obj.employerId.lname}
          </td>
          <td>
            {this.props.obj.status === 0
              ? "Pending Approval"
              : this.props.obj.status >= 4
              ? "Finished"
              : "In Progress"}
          </td>
          <td>

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
