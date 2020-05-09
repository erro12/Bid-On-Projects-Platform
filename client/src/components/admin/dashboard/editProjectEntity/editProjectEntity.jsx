import React, { Component } from "react";
import ReactTags from "react-tag-autocomplete";

import {
  Form,
  Button,
  Col,
  Table
} from "react-bootstrap";
import {
  userInstance,
  adminInstance
} from "../../../../axios/axiosconfig";
import { validateData } from "../../../../functions/functions";
import { NotificationManager } from "react-notifications";
import SidePanel from "../sidepanel/sidepanel";
// import "./editProjectEntity.css";
import "../../assets/editStyle.css";

class EditProjectEntity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      total: 1,
      index: 1,
      limit: 20,
      showPopup: false,
      showDelete: false,
      showAdd: false,
      showView: false,
      projects: [],
      target: {},
      employers: [],
      type: "None",
      sortBy: "None",
      desc: false
    };
  }

  componentDidMount = () => {
    this.getprojects();
  };

  componentDidUpdate() {
    if (this.state.loading) this.getprojects();
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
    this.getprojects();
  };

  toggleView = target => {
    this.setState({
      showView: !this.state.showView,
      target
    });
    this.getprojects();
  };

  toggleDelete = async d_id => {
    if(window.confirm("confirm delete project ?")){
      await this.deleteproject(d_id._id);
    }
    // this.setState({
    //   showDelete: !this.state.showDelete,
    //   d_id
    // });
    this.getprojects();
  };

  toggleAdd = () => {
    this.setState({
      showAdd: !this.state.showAdd
    });
    this.getprojects();
  };

  handleChange = e => {
    console.log("changing type, ", e.target.value);
    this.setState({ [e.target.name]: e.target.value, loading: true });
  };

  getprojects = async () => {
    const { index, limit, type, sortBy, desc } = this.state;
    console.log("about to get projects");
    const response = await adminInstance.post("/getprojects", {
      index,
      limit,
      type,
      sortBy,
      desc
    });
    console.log("got projects, ", response.data);
    console.log("response,", response);
    if (response.data.code === 200) {
      const projects = response.data.projects;
      console.log("all projects, ", projects);
      this.setState({
        projects,
        employers: response.data.employers,
        loading: false,
        total: response.data.total,
        sortBy: "None"
      });
      // console.log(this.state);
    }
  };

  updateprojects = async () => {
    console.log("state", this.state);
    const payload = {
      projects: this.state.projects
    };

    const isValid = validateData([payload.projects]);
    if (isValid) {
      const response = await adminInstance.post("/updateprojects", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  deleteproject = async d_id => {
    try {
      const response = await adminInstance.post("/deleteprojectById", {
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

  addproject = async projectData => {
    try {
      const isValid = validateData([projectData.employerId]);
      if (isValid) {
        const response = await adminInstance.post("/addproject", projectData);
        if (response.data.code === 200) {
          //notifi for deletion
          NotificationManager.success(response.data.msg, "Message", 4000);
          console.log("created, ", projectData);
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
    this.toggleAdd();
  };

  tabRow() {
    // console.log("projects, ", this.state.projects);
    return this.state.projects.map(function(object, i) {
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
          <SidePanel target="tasks" />
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-9">
                  <h2>Tasks</h2>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    onClick={this.toggleAdd}
                  >
                    Add Task
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
                      <option>Open Block</option>
                      <option>Work Block</option>
                      <option>Creative Block</option>
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
                            title{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "jobTitle",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>
                            amount{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "jobValue",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>created by</th>

                          <th>actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.projects.map((object, i) => (
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
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="pagination">
                  <span>
                    {" "}
                    {`Displaying Page ${this.state.index} of ${Math.ceil(
                      this.state.total / this.state.limit
                    )}`}{" "}
                  </span>
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
            addproject={this.addproject}
            cancel={this.toggleAdd}
            employers={this.state.employers}
          />
        ) : null}
      </div>
    );
  }
}
export default EditProjectEntity;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: "",
      tags: [],
      processing: false,
      suggestions: [],
      taskDescription: "",
      taskDeadline: 0,
      numberOfHours: 1,
      candidateProfile: [],
      // candidateProfile: "Computer Science",
      jobBlock: "Work Block",
      jobTitle: "",
      jobLocation: "",
      locationType: "Office Work",
      jobValue: "",
      jobType: "Hourly",
      errmsg: ""
      // createdBy: ""
    };
  }
  async componentWillMount() {
    const { target } = this.props;
    console.log("target object, ", target);

    const response = await userInstance.get("/getalltag");
    // if (response.data.code === 200) {
    const data = response.data;
    // }else{
    //   const data = [];
    // }

    let newTag = this.state.tags;
    if (target.candidateProfile.length > 0) {
      await target.candidateProfile.forEach(skill => {
        newTag.push({ _id: skill._id, name: skill.name });
      });

      console.log("after loop, new tagset", newTag);
      //newSuggestion = this.state.suggestions.push(newTag);
      console.log(".....check suggestions in data.resData........");
    }

    this.setState({
      _id: target._id,
      tags: newTag,
      suggestions: data.resData.suggestions,
      taskDescription: target.taskDescription,
      taskDeadline: target.taskDeadline,
      numberOfHours: target.numberOfHours,
      candidateProfile: [],
      // candidateProfile: "Computer Science",
      jobBlock: target.jobBlock,
      jobTitle: target.jobTitle,
      jobLocation: target.jobLocation,
      locationType:
        target.jobLocation === "Remote Work" ? "Remote Work" : "Office Work",
      jobValue: target.jobValue,
      jobType: target.jobType,
      errmsg: ""
      // createdBy: ""
    });
  }

  setProcessor = mode => {
    this.setState({
      processing: mode
    });
  };

  submitData = async event => {
    event.preventDefault();

    if (!this.state.processing) {
      this.setProcessor(true);
      console.log("about to update");

      let GivenDate = this.state.taskDeadline;
      let CurrentDate = new Date();
      GivenDate = new Date(GivenDate);
      console.log(CurrentDate);
      console.log(" and " + GivenDate);

      if (this.state.jobType == "Fixed" && GivenDate < CurrentDate) {
        NotificationManager.error(
          "Date can't be below today.",
          "Message",
          4000
        );
        this.setProcessor(false);
      } else {
        let cps = [];
        this.state.tags.forEach(cp => {
          cps.push(cp._id);
        });
        const payload = {
          data: {
            // createdBy: this.state.createdBy,
            _id: this.state._id,
            taskDescription: this.state.taskDescription,
            taskDeadline: this.state.taskDeadline,
            numberOfHours: this.state.numberOfHours,
            candidateProfile: cps,
            // candidateProfile: this.state.candidateProfile,
            jobBlock: this.state.jobBlock,
            jobTitle: this.state.jobTitle,
            jobLocation: this.state.jobLocation,
            jobValue: this.state.jobValue,
            jobType: this.state.jobType
          }
        };
        console.log("Job Post Payload --------", payload);

        let isValid0 = validateData([
          payload.data._id,
          payload.data.taskDescription,
          payload.data.candidateProfile,
          payload.data.jobBlock,
          payload.data.jobTitle,
          payload.data.jobValue,
          payload.data.jobType
          // payload.data.createdBy
        ]);

        let isValid1 =
          this.state.jobType === "Hourly"
            ? validateData([payload.data.numberOfHours])
            : validateData([payload.data.taskDeadline]);

        let isValid2 =
          this.state.locationType === "Office Work"
            ? validateData([payload.data.jobLocation])
            : true;

        if (payload.data.taskDescription.length < 10) {
          NotificationManager.error(
            "Description is too short",
            "Message",
            4000
          );
          isValid0 = false;
        }
        if (payload.data.jobBlock === "Work Block") {
          if (
            payload.data.jobType === "Hourly" &&
            payload.data.numberOfHours < 4
          ) {
            NotificationManager.error(
              "Work Block shall be of minimum 4 hours deadline",
              "Message",
              4000
            );
            isValid1 = false;
          } else if (
            payload.data.jobType === "Fixed" &&
            Math.abs(new Date(payload.data.taskDeadline) - new Date()) / 36e5 <
              4
          ) {
            NotificationManager.error(
              "Work Block shall be of minimum 4 hours deadline",
              "Message",
              4000
            );
            isValid1 = false;
          }
        } else if (payload.data.jobBlock === "Open Block") {
          if (
            payload.data.jobType === "Hourly" &&
            payload.data.numberOfHours > 24
          ) {
            NotificationManager.error(
              "Open Block shall be of maximum 24 hours deadline",
              "Message",
              4000
            );
            isValid1 = false;
          } else if (
            payload.data.jobType === "Fixed" &&
            Math.abs(new Date(payload.data.taskDeadline) - new Date()) / 36e5 >
              24
          ) {
            NotificationManager.error(
              "Open Block shall be of maximum 24 hours deadline",
              "Message",
              4000
            );
            isValid1 = false;
          }
        }

        if (isNaN(payload.data.jobValue)) {
          NotificationManager.error("Value shall be a number", "Message", 4000);
          isValid1 = false;
        } else if (payload.data.jobValue < 1) {
          NotificationManager.error(
            "Value shall be minimum 1",
            "Message",
            4000
          );
          isValid1 = false;
        }

        if (isValid0 && isValid1 && isValid2) {
          if (this.state.locationType !== "Office Work") {
            payload.data.jobLocation = "Remote Work";
          }
          console.log("Valid Job Post Payload --------", payload);
          const response = await adminInstance.post("/updateproject", payload);
          console.log("Response from the server -----", response);
          if (response.data.code === 200) {
            NotificationManager.success(response.data.msg, "Message", 4000);
            this.setState({
              tags: [],
              taskDescription: "",
              processing: false,
              taskDeadline: 0,
              numberOfHours: 4,
              // candidateProfile: "Computer Science",
              candidateProfile: [],
              jobBlock: "Work Block",
              jobTitle: "",
              jobLocation: "",
              locationType: "",
              jobValue: "",
              jobType: "Fixed"
              // createdBy: ""
            });
            this.props.closePopup();
          } else {
            this.setProcessor(false);
            NotificationManager.error(response.data.msg, "Message", 4000);
          }
        } else {
          this.setProcessor(false);
          NotificationManager.error(
            "Please Enter a valid data",
            "Message",
            4000
          );
        }
      }
    }
  };

  async handleDelete(i) {
    const tags = this.state.tags.slice(0);
    console.log("before delete, ", tags);
    // console.log('what i???, anywaYS i= ', i)
    tags.splice(i, 1);
    this.setState({ tags });
    console.log("after delete, ", this.state.tags);
  }

  handleAddition(tag) {
    const tags = [].concat(this.state.tags, tag);
    console.log("after addiditon, ", tags);
    this.setState({ tags });
  }

  handleDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
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
              <h2>Edit Task</h2>
            </div>
            <Form onSubmit={this.submitData}>
              {/* <Form.Row>
                <Form.Group as={Col} controlId="exampleForm.ControlTask">
                  <Form.Label>Employer ID </Form.Label>
                  <Form.Control
                    value={this.state.createdBy}
                    onChange={this.handleChange}
                    name="createdBy"
                  />
                  <Form.Label>Project Title </Form.Label>
                  <Form.Control
                    value={this.state.jobTitle}
                    onChange={this.handleChange}
                    name="jobTitle"
                  />
                </Form.Group>
              </Form.Row> */}
              <div className="row">
                <div className="col-md-12">
                  <Form.Group controlId="exampleForm.ControlTask">
                    <Form.Label>Task Description </Form.Label>
                    <textarea
                      className="form-control"
                      value={this.state.taskDescription}
                      name="taskDescription"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  {this.state.jobType === "Hourly" && (
                    <Form.Group controlId="formGridHours">
                      <Form.Label>No. Hours </Form.Label>
                      <Form.Control
                        value={this.state.numberOfHours}
                        name="numberOfHours"
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                  )}

                  {this.state.jobType === "Fixed" && (
                    <Form.Group controlId="formGridDedline">
                      <Form.Label>Task Deadline</Form.Label>
                      <Form.Control
                        value={this.state.taskDeadline}
                        name="taskDeadline"
                        onChange={this.handleChange}
                        type="date"
                      />
                    </Form.Group>
                  )}
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Block Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.jobBlock}
                      name="jobBlock"
                      onChange={this.handleChange}
                    >
                      <option>Work Block</option>
                      <option>Open Block</option>
                      <option>Creative Block</option>
                    </Form.Control>
                  </Form.Group>
                </div>
                <div className="col-md-12">
                  <Form.Group controlId="formGridState">
                    <Form.Label>Candidate Profiles </Form.Label>
                    <ReactTags
                      name="fname"
                      class="form-control"
                      tags={this.state.tags}
                      suggestions={this.state.suggestions}
                      handleDelete={this.handleDelete.bind(this)}
                      handleAddition={this.handleAddition.bind(this)}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Task Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.jobType}
                      name="jobType"
                      onChange={this.handleChange}
                    >
                      <option>Fixed</option>
                      <option>Hourly</option>
                    </Form.Control>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Value</Form.Label>
                    <Form.Control
                      value={this.state.jobValue}
                      onChange={this.handleChange}
                      name="jobValue"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Task Work Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.locationType}
                      name="locationType"
                      onChange={this.handleChange}
                    >
                      <option>Office Work</option>
                      <option>Remote Work</option>
                    </Form.Control>
                  </Form.Group>
                </div>
                {this.state.locationType === "Office Work" && (
                  <div className="col-md-6">
                    <Form.Group controlId="formGridState">
                      <Form.Label>Job Location </Form.Label>
                      <Form.Control
                        value={this.state.jobLocation}
                        onChange={this.handleChange}
                        name="jobLocation"
                      />
                    </Form.Group>
                  </div>
                )}
              </div>
              <Button className="bid-btn" variant="primary" type="submit">
                Update
              </Button>
              <Button className="cancle-btn" onClick={this.props.closePopup}>
                Cancel
              </Button>
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
                      <th>Title</th>
                      <td>{target.jobTitle}</td>
                    </tr>
                    <tr>
                      <th>Description</th>
                      <td>{target.taskDescription}</td>
                    </tr>
                    <tr>
                      <th>Block Type</th>
                      <td>{target.jobBlock}</td>
                    </tr>
                    <tr>
                      <th>Task Type</th>
                      <td>{target.jobType}</td>
                    </tr>
                    <tr>
                      <th>Value</th>
                      <td>€{target.jobValue}.00 EUR</td>
                    </tr>
                    <tr>
                      <th>Location</th>
                      <td>{target.jobLocation}</td>
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

class AddUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      tags: [],
      suggestions: [],
      taskDescription: "",
      taskDeadline: 0,
      numberOfHours: 1,
      candidateProfile: [],
      // candidateProfile: "Computer Science",
      jobBlock: "Work Block",
      jobTitle: "",
      jobLocation: "",
      locationType: "Office Work",
      jobValue: "",
      jobType: "Hourly",
      errmsg: "",
      createdBy: ""
    };
  }

  componentWillMount() {
    this.getTags();
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getTags = async () => {
    const response = await userInstance.get("/getalltag");
    if (response.data.code === 200) {
      const data = response.data;
      this.setState({
        suggestions: data.resData.suggestions
      });
    }
  };

  setProcessor = mode => {
    this.setState({
      processing: mode
    });
  };

  submitData = async event => {
    event.preventDefault();

    if (!this.state.processing) {
      this.setProcessor(true);
      console.log("about to submit");

      let GivenDate = this.state.taskDeadline;
      let CurrentDate = new Date();
      GivenDate = new Date(GivenDate);
      console.log(CurrentDate);
      console.log(" and " + GivenDate);

      if (this.state.jobType == "Fixed" && GivenDate < CurrentDate) {
        NotificationManager.error(
          "Date can't be below today.",
          "Message",
          4000
        );
        this.setProcessor(false);
      } else {
        let cps = [];
        this.state.tags.forEach(cp => {
          cps.push(cp._id);
        });
        const payload = {
          data: {
            createdBy: this.state.createdBy,
            taskDescription: this.state.taskDescription,
            taskDeadline: this.state.taskDeadline,
            numberOfHours: this.state.numberOfHours,
            candidateProfile: cps,
            // candidateProfile: this.state.candidateProfile,
            jobBlock: this.state.jobBlock,
            jobTitle: this.state.jobTitle,
            jobLocation: this.state.jobLocation,
            jobValue: this.state.jobValue,
            jobType: this.state.jobType
          }
        };
        console.log("Job Post Payload --------", payload);

        let isValid0 = validateData([
          payload.data.taskDescription,
          payload.data.candidateProfile,
          payload.data.jobBlock,
          payload.data.jobTitle,
          payload.data.jobValue,
          payload.data.jobType,
          payload.data.createdBy
        ]);

        let isValid1 =
          this.state.jobType === "Hourly"
            ? validateData([payload.data.numberOfHours])
            : validateData([payload.data.taskDeadline]);

        let isValid2 =
          this.state.locationType === "Office Work"
            ? validateData([payload.data.jobLocation])
            : true;

        if (payload.data.taskDescription.length < 10) {
          NotificationManager.error(
            "Description is too short",
            "Message",
            4000
          );
          isValid0 = false;
        }
        if (payload.data.jobBlock === "Work Block") {
          if (
            payload.data.jobType === "Hourly" &&
            payload.data.numberOfHours < 4
          ) {
            NotificationManager.error(
              "Work Block shall be of minimum 4 hours deadline",
              "Message",
              4000
            );
            isValid1 = false;
          } else if (
            payload.data.jobType === "Fixed" &&
            Math.abs(new Date(payload.data.taskDeadline) - new Date()) / 36e5 <
              4
          ) {
            NotificationManager.error(
              "Work Block shall be of minimum 4 hours deadline",
              "Message",
              4000
            );
            isValid1 = false;
          }
        } else if (payload.data.jobBlock === "Open Block") {
          if (
            payload.data.jobType === "Hourly" &&
            payload.data.numberOfHours > 24
          ) {
            NotificationManager.error(
              "Open Block shall be of maximum 24 hours deadline",
              "Message",
              4000
            );
            isValid1 = false;
          } else if (
            payload.data.jobType === "Fixed" &&
            Math.abs(new Date(payload.data.taskDeadline) - new Date()) / 36e5 >
              24
          ) {
            NotificationManager.error(
              "Open Block shall be of maximum 24 hours deadline",
              "Message",
              4000
            );
            isValid1 = false;
          }
        }

        if (isNaN(payload.data.jobValue)) {
          NotificationManager.error("Value shall be a number", "Message", 4000);
          isValid1 = false;
        } else if (payload.data.jobValue < 1) {
          NotificationManager.error(
            "Value shall be minimum 1",
            "Message",
            4000
          );
          isValid1 = false;
        }

        if (isValid0 && isValid1 && isValid2) {
          if (this.state.locationType !== "Office Work") {
            payload.data.jobLocation = "Remote Work";
          }
          console.log("Valid Job Post Payload --------", payload);
          const response = await adminInstance.post("/addproject", payload);
          console.log("Response from the server -----", response);
          if (response.data.code === 200) {
            NotificationManager.success(response.data.msg, "Message", 4000);
            this.setState({
              tags: [],
              processing: false,
              taskDescription: "",
              taskDeadline: 0,
              numberOfHours: 4,
              // candidateProfile: "Computer Science",
              candidateProfile: [],
              jobBlock: "Work Block",
              jobTitle: "",
              jobLocation: "",
              locationType: "",
              jobValue: "",
              jobType: "Fixed",
              createdBy: ""
            });
            this.props.cancel();
          } else {
            this.setProcessor(false);
            NotificationManager.error(response.data.msg, "Message", 4000);
          }
        } else {
          this.setProcessor(false);
          NotificationManager.error(
            "Please Enter a valid data",
            "Message",
            4000
          );
        }
      }
    }
  };

  async handleDelete(i) {
    const tags = this.state.tags.slice(0);
    console.log("before delete, ", tags);
    // console.log('what i???, anywaYS i= ', i)
    tags.splice(i, 1);
    this.setState({ tags });
    console.log("after delete, ", this.state.tags);
  }

  handleAddition(tag) {
    const tags = [].concat(this.state.tags, tag);
    console.log("after addiditon, ", tags);
    this.setState({ tags });
  }

  handleDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div className="form-title">
              <h2>Add Task</h2>
            </div>
            <Form onSubmit={this.submitData}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Task Posted By</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.createdBy}
                      name="createdBy"
                      onChange={this.handleChange}
                    >
                      <option value="">Select an employer</option>
                      {this.props.employers.map(employer => (
                        <option key={employer._id} value={employer._id}>
                          {employer.fname + " " + employer.lname}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="exampleForm.ControlTask">
                    <Form.Label>Task Title </Form.Label>
                    <Form.Control
                      value={this.state.jobTitle}
                      onChange={this.handleChange}
                      name="jobTitle"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-12">
                  <Form.Group controlId="exampleForm.ControlTask">
                    <Form.Label>Task Description </Form.Label>
                    <textarea
                      className="form-control"
                      value={this.state.taskDescription}
                      name="taskDescription"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  {this.state.jobType === "Hourly" && (
                    <Form.Group controlId="formGridHours">
                      <Form.Label>No. Hours </Form.Label>
                      <Form.Control
                        value={this.state.numberOfHours}
                        name="numberOfHours"
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                  )}

                  {this.state.jobType === "Fixed" && (
                    <Form.Group controlId="formGridDedline">
                      <Form.Label>Task Deadline</Form.Label>
                      <Form.Control
                        value={this.state.taskDeadline}
                        name="taskDeadline"
                        onChange={this.handleChange}
                        type="date"
                      />
                    </Form.Group>
                  )}
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Block Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.jobBlock}
                      name="jobBlock"
                      onChange={this.handleChange}
                    >
                      <option>Work Block</option>
                      <option>Open Block</option>
                      <option>Creative Block</option>
                    </Form.Control>
                  </Form.Group>
                </div>
                <div className="col-md-12">
                  <Form.Group controlId="formGridState">
                    <Form.Label>Candidate Profiles </Form.Label>
                    <ReactTags
                      name="fname"
                      class="form-control"
                      tags={this.state.tags}
                      suggestions={this.state.suggestions}
                      handleDelete={this.handleDelete.bind(this)}
                      handleAddition={this.handleAddition.bind(this)}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Task Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.jobType}
                      name="jobType"
                      onChange={this.handleChange}
                    >
                      <option>Fixed</option>
                      <option>Hourly</option>
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Value</Form.Label>
                    <Form.Control
                      value={this.state.jobValue}
                      onChange={this.handleChange}
                      name="jobValue"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <Form.Group controlId="formGridPayment">
                    <Form.Label>Task Work Type</Form.Label>
                    <Form.Control
                      as="select"
                      value={this.state.locationType}
                      name="locationType"
                      onChange={this.handleChange}
                    >
                      <option>Office Work</option>
                      <option>Remote Work</option>
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  {this.state.locationType === "Office Work" && (
                    <Form.Group as={Col} controlId="formGridState">
                      <Form.Label>Job Location </Form.Label>
                      <Form.Control
                        value={this.state.jobLocation}
                        onChange={this.handleChange}
                        name="jobLocation"
                      />
                    </Form.Group>
                  )}
                </div>
              </div>
              <Button className="bid-btn" variant="primary" type="submit">
                Submit
              </Button>
              <Button
                className="cancle-btn"
                onClick={() => {
                  this.props.cancel();
                }}
              >
                Cancel
              </Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

class TableRow extends Component {

  render() {
    return (
      <React.Fragment>
        <tr>
          <td>{this.props.obj.jobTitle}</td>
          <td>€{this.props.obj.jobValue}.00 EUR</td>
          <td>{`${this.props.obj.createdBy.fname} ${this.props.obj.createdBy.lname}`}</td>

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
