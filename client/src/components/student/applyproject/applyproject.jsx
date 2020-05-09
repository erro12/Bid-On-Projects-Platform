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
// import "../jobdetail/jobdetail.css";
import employee from "../../../assets/images/employe.jpg";
import { Link } from "react-router-dom";
import job_icon from "../../../assets/images/job-icon.png";
import { studentInstance } from "../../../axios/axiosconfig";
import "../../register/register.css";
import { validateData, trackActivity } from "../../../functions/functions";
import { NotificationManager } from "react-notifications";



class ApplyProject extends Component{

    constructor(props){
        super(props)
        this.state={
            // price: "",
            // time: "",
            detail: "",
        }
    }

	componentWillMount () {
        // this.setState( { isChecked: this.props.isChecked } );
        console.log('owner from location, ', this.props.location.owner)
        const {projectId} = this.props.match.params
        const _id = projectId.split('+');
        console.log('id from params', _id);

    }

    handleChange=(e)=>{
        this.setState({[e.target.name]:e.target.value})
    }

    placeBid = async () => {
        console.log('making payload')
        const {projectId} = this.props.match.params
        const _id = projectId.split('+');
      const bidPayload = {
        // price: this.state.price,
        // time: this.state.time,
        detail: this.state.detail,
        // projectId: this.props.location.state.project,
        // employerId: this.props.location.state.owner
        projectId: _id[0],
        employerId: _id[1]
      };

      console.log("made bid payload, ", bidPayload);
      const isValid = validateData([
        // bidPayload.price,
        // bidPayload.time,
        // bidPayload.detail,
        // bidPayload.projectId,
        // bidPayload.employerId
      ]);
      if (true) {
        console.log("valid inputs");
        this.setState({ errmsg: "" });
        console.log("requesting to place bid");
        const response = await studentInstance.post(
          "/placeBid",
          bidPayload
        );
        console.log("response in completion", response);
        const project = response.data.project;
        const statusCode = response.data.code;
        const msg = response.data.msg;

        if (statusCode === 200) {
          const APPLICATION_DATE = project.bidDate;
          const TASK_BLOCK = project.projectId.jobBlock

          trackActivity("apply for task", {"application date": APPLICATION_DATE, "task block": TASK_BLOCK});

          this.props.history.push({
            pathname: `/student/contract/:${project._id}`,
            job: project
          });
          NotificationManager.success(msg, "Message", 4000);
        } else if (statusCode === 400) {
          console.log(response.data.code);
          console.log(msg);
          NotificationManager.error(msg, "Message", 4000);
        }
      } else {
        console.log("invalid inputs");
        NotificationManager.error("Some fields are empty", "Message", 4000);
      }
    };


    render(){
        return (
            <div className="register-section">
            <div className="container back-color">
              <div className="row">
                <div className="col-md-12">
                  <div className="register-form">
                    <h1>
                      Submit your <span>Application</span>
                    </h1>
                    <div className="rigister-tab">
                      <Form>
                        {/* <div className="row"> */}
                          {/* <div className="col-md-6">
                            <Form.Group controlId="formBasicFirst">
                              <Form.Label>Bid amount</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder=""
                                name="price"
                                onChange={this.handleChange}
                                value={this.state.price}
                              />
                            </Form.Group>
                          </div>
                          <div className="col-md-6">
                            <Form.Group controlId="formBasicLast">
                              <Form.Label>Time required to complete the project</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder=""
                                name="time"
                                onChange={this.handleChange}
                                value={this.state.time}
                              />
                            </Form.Group>
                          </div> */}
                        {/* </div> */}
                        <Form.Group controlId="formBasicLast">
                          <textarea class="form-control" rows="5"
                            placeholder="small description to support your application..."
                            name="detail"
                            onChange={this.handleChange}
                            value={this.state.detail}
                          />
                        </Form.Group>
                        <div className="err">{this.state.errmsg}</div>
                        <div className="text-center">
                          <Button className="signup-btn" onClick={this.placeBid}>
                            Submit
                          </Button>
                        </div>
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
export default ApplyProject;
