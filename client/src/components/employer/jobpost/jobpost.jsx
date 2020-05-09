import React, { Component } from "react";
import { Form, Col, Button } from "react-bootstrap";
import "../jobpost/jobpost.css";
import { userInstance } from "../../../axios/axiosconfig";
import { validateData } from "../../../functions/functions";
import { NotificationManager } from "react-notifications";
class Jobpost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskDescription: "",
      taskDeadline: 0,
      numberOfHours: 4,
      candidateProfile: "Computer Science",
      jobBlock: "Work Block",
      jobTitle: "",
      jobLocation: "",
      jobValue: ""      
    };
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  submitData = async event => {
    event.preventDefault();

    console.log('about to submit')

    let GivenDate = this.state.taskDeadline;
    let CurrentDate = new Date();
    GivenDate = new Date(GivenDate);
    console.log(CurrentDate)
    console.log(" and "+ GivenDate)

    if(GivenDate < CurrentDate){
      NotificationManager.error("Date can't be below today.", "Message", 4000);
    }else{

    const payload = {
      data: {
        taskDescription: this.state.taskDescription,
        taskDeadline: this.state.taskDeadline,
        numberOfHours: this.state.numberOfHours,
        candidateProfile: this.state.candidateProfile,
        jobBlock: this.state.jobBlock,
        jobTitle: this.state.jobTitle,
        jobLocation: this.state.jobLocation,
        jobValue: this.state.jobValue
      }
    };
    console.log("Job Post Payload --------", payload);

    const isValid = validateData([
      payload.data.taskDescription,
      payload.data.taskDeadline,
      payload.data.numberOfHours,
      payload.data.candidateProfile,
      payload.data.jobBlock,
      payload.data.jobTitle,
      payload.data.jobLocation,
      payload.data.jobValue
    ]);
    if (isValid) {
      console.log("Valid Job Post Payload --------", payload);
      const response = await userInstance.post("/jobpost", payload);
      console.log("Response from the server -----", response);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
        this.setState({
          taskDescription: "",
          taskDeadline: 0,
          numberOfHours: 4,
          candidateProfile: "Computer Science",
          jobBlock: "Work Block",
          jobTitle: "",
          jobLocation: "",
          jobValue: ""
        });
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Please Enter a valid data", "Message", 4000);
    }
  }
  };

  render() {
    return (
      <div className="job-post">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="post-block">
                <div className="page-heading">
                  <h2>
                    Post a <span>job</span>
                  </h2>
                </div>
                <div className="job-form">
                  <Form onSubmit={this.submitData}>
                    <Form.Row>
                      <Form.Group as={Col} controlId="exampleForm.ControlTask">
                        <Form.Label>Job Title </Form.Label>
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
                      <Form.Group as={Col} controlId="formGridHours">
                        <Form.Label>No. Hours </Form.Label>
                        <Form.Control
                          value={this.state.numberOfHours}
                          name="numberOfHours"
                          onChange={this.handleChange}
                        />
                      </Form.Group>

                      <Form.Group as={Col} controlId="formGridDedline">
                        <Form.Label>Task Deadline</Form.Label>
                        <Form.Control
                          value={this.state.taskDeadline}
                          name="taskDeadline"
                          onChange={this.handleChange}
                           type="date"
                        />
                      </Form.Group>
                    </Form.Row>
                    <Form.Row>
                      <Form.Group as={Col} controlId="formGridState">
                        <Form.Label>Candidate Profiles </Form.Label>
                        <Form.Control
                          as="select"
                          value={this.state.candidateProfile}
                          name="candidateProfile"
                          onChange={this.handleChange}
                        >
                          <option>Computer Science</option>
                          <option> Accountancy</option>
                          <option>Art</option>
                          <option>Management</option>
                        </Form.Control>
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
                        <Form.Label>Project Type</Form.Label>
                        <Form.Control
                          as="select"
                          value={this.state.jobBlock}
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
                        <Form.Label>Project Work Type</Form.Label>
                        <Form.Control
                          as="select"
                          value={this.state.jobBlock}
                          name="locationType"
                          onChange={this.handleChange}
                        >
                          <option>Office Work</option>
                          <option>Remote Work</option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group as={Col} controlId="formGridState">
                        <Form.Label>Job Location </Form.Label>
                        <Form.Control
                          value={this.state.jobLocation}
                          onChange={this.handleChange}
                          name="jobLocation"
                        />
                      </Form.Group>
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
export default Jobpost;
