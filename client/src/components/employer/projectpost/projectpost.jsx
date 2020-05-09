import React, { Component } from "react";
import { Form, Col, Button } from "react-bootstrap";
import "./projectpost.css";
import { userInstance } from "../../../axios/axiosconfig";
import ReactTags from "react-tag-autocomplete";
import { validateData, trackActivity } from "../../../functions/functions";
import { NotificationManager } from "react-notifications";
import mixpanel from "mixpanel-browser";

mixpanel.init("e5e1dee9084287277c80676f6b9ea106");

class projectpost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      tags: [],
      suggestions: [],
      taskDescription: "",
      taskDeadline: 0,
      numberOfHours: 1,
      // candidateProfile: "Computer Science",
      candidateProfile: [],
      jobBlock: "Work Block",
      jobTitle: "",
      jobLocation: "",
      locationType: "Office Work",
      jobValue: "",
      jobType: "Hourly"
    };
  }

  componentWillMount() {
    this.getTags();
  }

  getTags = async () => {
    const response = await userInstance.get("/getalltag");
    if (response.data.code === 200) {
      const data = response.data;
      this.setState({
        suggestions: data.resData.suggestions
      });
    }
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    console.log(this.state);
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
            taskDescription: this.state.taskDescription,
            taskDeadline: this.state.taskDeadline,
            numberOfHours: this.state.numberOfHours,
            // candidateProfile: this.state.candidateProfile,
            candidateProfile: cps,
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
          payload.data.jobType
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
            !(payload.data.numberOfHours <= 24)
          ) {
            console.log("greater than 24, ", payload.data.numberOfHours);
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
          console.log("candidate profile, ", payload.data.candidateProfile);
          console.log("Valid Job Post Payload --------", payload);
          const response = await userInstance.post("/jobpost", payload);
          console.log("Response from the server -----", response);
          if (response.data.code === 200) {
            const task = response.data.savedJobPost;

            trackActivity("create task", {
              "creation date": task.creationDate,
              "block type": task.jobBlock,
              "task type": task.jobType,
              "task value": task.jobValue,
              "task location": task.jobLocation
            });

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
              locationType: "Office Work",
              jobValue: "",
              jobType: "Fixed"
            });
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
      <div className="job-post">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="post-block">
                <div className="page-heading">
                  <h2>
                    Post a <span>task</span>
                  </h2>
                </div>
                <div className="job-form">
                  <Form onSubmit={this.submitData}>
                    <Form.Row>
                      <Form.Group as={Col} controlId="exampleForm.ControlTask">
                        <Form.Label>Task Title </Form.Label>
                        <Form.Control
                          value={this.state.jobTitle}
                          onChange={this.handleChange}
                          name="jobTitle"
                        />
                      </Form.Group>
                    </Form.Row>
                    <Form.Row>
                      <Form.Group as={Col} controlId="exampleForm.ControlTask">
                        <Form.Label>Task Description </Form.Label>
                        <Form.Control
                          value={this.state.taskDescription}
                          name="taskDescription"
                          onChange={this.handleChange}
                          as="textarea"
                          rows="10"
                        />
                      </Form.Group>
                    </Form.Row>
                    <Form.Row>
                      {this.state.jobType === "Hourly" && (
                        <Form.Group as={Col} controlId="formGridHours">
                          <Form.Label>No. Hours </Form.Label>
                          <Form.Control
                            value={this.state.numberOfHours}
                            name="numberOfHours"
                            onChange={this.handleChange}
                          />
                        </Form.Group>
                      )}

                      {this.state.jobType === "Fixed" && (
                        <Form.Group as={Col} controlId="formGridDedline">
                          <Form.Label>Task Deadline</Form.Label>
                          <Form.Control
                            value={this.state.taskDeadline}
                            name="taskDeadline"
                            onChange={this.handleChange}
                            type="date"
                          />
                        </Form.Group>
                      )}
                    </Form.Row>
                    <Form.Row>
                      <Form.Group as={Col} controlId="formGridState">
                        <Form.Label>Candidate Profiles </Form.Label>
                        {/* <Form.Control
                          as="select"
                          value={this.state.candidateProfile}
                          name="candidateProfile"
                          onChange={this.handleChange}
                        >
                          <option>Computer Science</option>
                          <option> Accountancy</option>
                          <option>Art</option>
                          <option>Management</option>
                          <option>Digital Marketing</option>
                          <option>Engineering</option>
                          <option>Writing</option>
                          <option>Translating</option>
                        </Form.Control> */}
                        <ReactTags
                          name="fname"
                          class="form-control"
                          tags={this.state.tags}
                          suggestions={this.state.suggestions}
                          handleDelete={this.handleDelete.bind(this)}
                          handleAddition={this.handleAddition.bind(this)}
                        />
                      </Form.Group>

                      <Form.Group as={Col} controlId="formGridPayment">
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
                    </Form.Row>

                    <Form.Row>
                      <Form.Group as={Col} controlId="formGridPayment">
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

                      <Form.Group as={Col} controlId="formGridPayment">
                        <Form.Label>Value</Form.Label>
                        <Form.Control
                          value={this.state.jobValue}
                          onChange={this.handleChange}
                          name="jobValue"
                        />
                      </Form.Group>
                    </Form.Row>

                    <Form.Row>
                      <Form.Group as={Col} controlId="formGridPayment">
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
                    </Form.Row>

                    {/* <Form.Row>
                      <Form.Group
                        as={Col}
                        controlId="formGridProduct"
                        className="upload-file"
                      >
                        <Form.Label>Product Description</Form.Label>
                        <Form.Control type="file" placeholder="" />
                      </Form.Group>
                    </Form.Row> */}
                    <Button variant="primary" type="submit">
                      Submit
                    </Button>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default projectpost;
