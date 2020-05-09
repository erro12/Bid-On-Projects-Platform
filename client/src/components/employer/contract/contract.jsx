import React, { Component } from "react";
import { Button, Col, ProgressBar } from "react-bootstrap";
import "../contract/contract.css";
import { isemployer, trackActivity } from "../../../functions/functions";
import { Form } from "react-bootstrap";
import { validateData } from "../../../functions/functions";
import { NotificationManager } from "react-notifications";
import RPopup from "reactjs-popup";

import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";
import StepZilla from "react-stepzilla";
import "react-stepzilla/src/css/main.css";

import step1 from "../../../assets/images/step-1.jpg";
import step2 from "../../../assets/images/step-2.jpg";
import step3 from "../../../assets/images/step-2.jpg";
import step4 from "../../../assets/images/step-4.jpg";
import { userInstance, employerInstance } from "../../../axios/axiosconfig";
import io from "socket.io-client";
import ReactStars from "react-stars";

class Contract extends Component {
  constructor(props) {
    super(props);
    this.state = {
      psData: {},
      reviewed: false,
      receivedRating: false,
      review: {},
      employer: [],
      student: [],
      project: {},
      status: 0,
      showConfirmSubmission: false,
      proposalId: "",
      showPopup: false,
      target: {},
      code: "",
      data: [],
      nextStep: "Next",
      prevStep: "Prev",
      triggered: false
    };
  }

  componentDidMount() {
    this.getDetails();
  }

  componentDidUpdate() {
    if (
      this.state.status >= 4 &&
      !this.state.reviewed &&
      !this.state.triggered
    ) {
      document.getElementById("review").click();
      this.state.triggered = true;
    }
  }

  refreshState = () => {
    console.log("refreshing");
    this.getDetails();
  };

  togglePopup = target => {
    console.log("toggling");
    this.setState({
      showPopup: !this.state.showPopup,
      target
    });
  };

  toggleConfirmSubmission = () => {
    document.getElementById("confirmSubmission").click();
    console.log("toggling");
    this.setState({
      // showConfirmSubmission: !this.state.showConfirmSubmission
    });
  };

  makePayment = async () => {
    const paymentTo = this.state.student;
    const projectId = this.state.project._id;
    const amount = this.state.project.jobValue;
    const data = this.state.data;

    console.log("confirmed payment");
    //change psModel status to 4
    const PAYMENT_DATE = new Date().toISOString();
    const PAYMENT_AMOUNT = `€${amount}.00 EUR`;

    const response = await employerInstance.post("/makePayment", {
      to: paymentTo._id,
      amount: amount,
      _jid: projectId
    });
    if (response.data.code === 200) {
      trackActivity("make payment", {
        amount: PAYMENT_AMOUNT,
        "payment date": PAYMENT_DATE
      });
      NotificationManager.success("Payment successful", "Message", 4000);
      this.changeStatusTo(4);
    } else {
      NotificationManager.error(response.data.msg, "Message", 4000);
    }
  };

  toggleConfirmPayment = async () => {
    if (await window.confirm("confirm payment ?")) {
      this.makePayment();
    }
  };

  loadChat = async data => {
    console.log("loading messages in state, ", data);
    this.setState({
      data
    });
  };

  changeStatusTo = async status => {
    //change status to 2 in psModel
    const res = await employerInstance.post("/submitTaskReview", {
      proposalId: this.state.proposalId,
      status
    });
    if (res.data.code === 200) {
      //if successful, toggleConfirmSubmission, else, release error notification
      //if successful, also getDetails
      //no use since status coming from location not server, change later
      this.getDetails();
    } else {
      NotificationManager.error(res.data.msg, "Message", 4000);
    }
  };

  getDetails = async () => {
    console.log("getting");
    console.log("loccc, ", this.props.location);
    const { state } = this.props.location;
    if (state) {
      const { job, _sid, status } = this.props.location.state;
      // const res = await userInstance.post("/getProfileById", {
      //   uid: job.createdBy
      // });
      // const employerData = res.data.profile_data;
      // const res2 = await userInstance.post("/getProfileById", { uid: _sid });
      // const studentData = res2.data.profile_data;
      console.log("_eid, ", job.createdBy);
      const res = await employerInstance.post("/getProposalWithoutId", {
        _sid,
        _pid: job._id,
        _eid: job.createdBy
      });
      if (res.data.code === 200) {
        const psData = res.data.psData[0];
        const employerData = psData.employerId;
        const studentData = psData.studentId;

        console.log("reviewData, ", res.data.reviewData);

        // console.log("emp, ", employerData);
        // console.log("std, ", studentData);
        // console.log("proj, ", psData.projectId);
        // console.log("proposal, ", psData);

        if (psData.status == 0) {
          this.state.nextStep = "Waiting for approval";
          this.state.prevStep = "Waiting for approval";
        } else if (psData.status == 1) {
          this.state.nextStep = "waiting for submission";
          this.state.prevStep = "waiting for submission";
        } else if (psData.status == 2) {
          this.state.nextStep = "Accept / Reject";
          this.state.prevStep = "Review Task";
        } else if (psData.status == 3) {
          this.state.nextStep = "Make Payment";
          this.state.prevStep = "Waiting for payment";
        } else {
          this.state.prevStep = "Payment Complete";
        }
        const rData = res.data.reviewData;
        console.log("review from res data before check, ", rData);
        const review =
          rData.empReviewed && rData.stdReviewed ? rData.stdReview : {};
        console.log("review from res data after check, ", review);
        // console.log('review in get details, ', review)
        console.log("student data, ", studentData);
        this.setState({
          psData: psData,
          employer: employerData,
          student: studentData,
          project: psData.projectId,
          status: psData.status,
          proposalId: psData._id,
          reviewed: rData.empReviewed,
          receivedRating: rData.stdReviewed,
          review
        });
      } else {
        console.log("2");
        if (!this.isloggedin()) this.props.history.push("/Login");
        else {
          console.log("3");
          const route = isemployer() ? "/employer/mytasks" : "/student/mytasks";
          this.props.history.push(route);
          console.log("4, ", route);
        }
      }
    } else {
      console.log("2");
      if (!this.isloggedin()) this.props.history.push("/Login");
      else {
        console.log("3");
        const route = isemployer() ? "/employer/mytasks" : "/student/mytasks";
        this.props.history.push(route);
        console.log("4, ", route);
      }
    }
  };

  isloggedin = async () => {
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf("token") === 0) {
        return true;
      }
    }
    return false;
  };

  taskStatus = () => {
    const { status } = this.state;
    return status >= 4
      ? "Finished"
      : status == 3
      ? "Pending Payment"
      : status == 2
      ? "In Review"
      : status == 1
      ? "Approved"
      : "Pending Approval";
  };

  render() {
    return this.props.location.state ? (
      <div className="contract-section">
        <div className="page-title">
          <div className="container">
            <h2>Task Name - {this.state.project.jobTitle}</h2>
            <span>{this.taskStatus()}</span>
          </div>
        </div>

        <div className="contract-container">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <ContractDetail
                  reviewed={this.state.reviewed}
                  review={this.state.review}
                  toggleConfirmSubmission={this.toggleConfirmSubmission}
                  toggleConfirmPayment={this.toggleConfirmPayment}
                  nextStep={this.state.nextStep}
                  prevStep={this.state.prevStep}
                  getDetails={this.getDetails}
                  status={this.state.status}
                  project={this.state.project}
                  student={this.state.student}
                  employer={this.state.employer}
                  toggle={this.togglePopup}
                  changeStatusTo={this.changeStatusTo}
                />
              </div>

              <div className="col-md-4">
                <ContractRate
                  refreshState={this.refreshState}
                  student={this.state.student}
                  employer={this.state.employer}
                  reviewed={this.state.reviewed}
                  receivedRating={this.state.receivedRating}
                  review={this.state.review}
                  toggleConfirmPayment={this.toggleConfirmPayment}
                  project={this.state.project}
                  status={this.state.status}
                />
              </div>
              {this.state.showPopup ? (
                <Popup
                  student={this.state.student}
                  project={this.state.project}
                  employer={this.state.employer}
                  psData={this.state.psData}
                  target={this.state.target}
                  data={this.state.data}
                  closePopup={this.togglePopup}
                  loadChat={this.loadChat}
                />
              ) : null}

              {this.state.showConfirmSubmission ? (
                <ConfirmSubmission
                  data={this.state.data}
                  closePopup={this.toggleConfirmSubmission}
                  changeStatusTo={this.changeStatusTo}
                />
              ) : null}

              <RPopup
                modal
                contentStyle={{ height: "30%", width: "50%" }}
                trigger={<div id="confirmSubmission"></div>}
              >
                {close => (
                  <ConfirmSubmission
                    data={this.state.data}
                    closePopup={close}
                    changeStatusTo={this.changeStatusTo}
                  />
                )}
              </RPopup>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}
export default Contract;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      socket: null,
      progress: 0,
      showProgress: false
    };
  }

  componentWillMount() {
    this.setState({
      socket: io("http://3.133.60.237:3001/")
    });
    this.ref = React.createRef();
  }

  componentDidMount() {
    const { socket } = this.state;
    const { project, student, employer, psData } = this.props;
    // const {_ids} = this.props.location;
    // socket.on('connect', ()=>{
    socket.emit("createRoomForTwo", {
      code: this.props.target,
      employer: true,
      _jid: project._id,
      _pid: psData._id
    });

    console.log("chat mounted");
    socket.emit("load_messages", { code: this.props.target });
    socket.on("get_chat", this.loadChat);
    socket.on("new_message", this.addMessage);
    // })

    this.updateScroll();
  }

  componentDidUpdate() {
    this.updateScroll();
  }

  updateScroll = () => {
    let element = document.getElementById("chats");
    console.log("element to scroll, ", element);
    if (element) element.scrollTop = element.scrollHeight;
  };

  componentWillUnmount() {
    const { target } = this.props;
    this.setState({
      name: target.name,
      _id: target._id
    });

    this.state.socket.off("get_chat");
    this.state.socket.off("new_message");
  }

  setProgress = bool => {
    this.setState({
      showProgress: bool
    });
  };

  loadChat = data => {
    console.log("about to load stuff, ", data);
    // this.setState({
    //     messages
    // });
    this.props.loadChat(data);
  };

  newMessage = (target, project, psData) => {
    if (project && psData && this.state.message) {
      console.log("emitting new message");
      console.log("old, ", this.state.message);
      let msg = this.state.message;
      // msg.replace(/\r\n|\r|\n/g,"<br />");
      // let msgs = this.state.messages;
      // msgs.push(msg);
      this.setState({
        // messages: msgs,
        message: ""
      });
      // const {_ids} = this.props.location;
      this.state.socket.emit("new_message", {
        msg,
        code: target,
        employer: true,
        pdf: false,
        _jid: project._id,
        _pid: psData._id
      });
      // this.state.message=''
    }
  };

  addMessage = data => {
    console.log("got new messages, ", data);
    // msg.replace(/<br\s?\/?>/g,"\n");
    // console.log('received new msg, ', msg)
    // let msgs = this.state.messages;
    // msgs.push(msg);
    // this.setState({
    //     messages: msg,
    // })
    this.props.loadChat(data);
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  close = code => {
    console.log("ok inside close in subcomponent");
    this.state.socket.emit("exit_room", { code });
    this.props.closePopup();
  };

  uploadPDF = async (img, target, project, psData) => {
    console.log("img", img);

    console.log("0 index", img.current.files[0].size);
    const isValid = validateData([img.current.files[0]]);
    if (isValid) {
      console.log("valid");
      const data = new FormData();
      data.append("file", img.current.files[0]);
      const size = img.current.files[0].size;
      this.setProgress(true);
      const config = {
        onUploadProgress: async progressEvent => {
          this.setState({
            progress: await Math.floor((progressEvent.loaded * 100) / size)
          });
        }, // TO SHOW UPLOAD STATUS
        headers: {
          "content-type": "multipart/form-data"
        }
      };
      console.log("data, ", data);
      console.log("knocking backend");
      console.log("here");
      const imageData = await employerInstance.post(
        "/uploadProjectPDF",
        data,
        config
      );
      // this.state.socket.emit("pdf", { data, code: this.props.target });
      this.setProgress(false);
      console.log("image after response", imageData);
      //   this.getProfileData();
      if (imageData.data.code === 200) {
        console.log(imageData.data.filePath);
        this.state.socket.emit("new_message", {
          msg: imageData.data.filePath,
          code: target,
          employer: true,
          pdf: true,
          _jid: project._id,
          _pid: psData._id
        });
        NotificationManager.success(imageData.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(imageData.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Please upload project pdf", "Message", 4000);
    }
  };

  minimize = target => {
    console.log(target)
    // console.log('minimize, ', e.target, "and ", e.target.classList);
    let element = document.getElementById(target);
    console.log(element);
    element.classList.toggle("chatbox-min");
  };

  render() {
    const { data, student, target, project, psData } = this.props;

    // <div className="popup">
    {
      return student ? (
        <div className="chatbox-holder">
          <div className="chatbox" id={target}>
            <div class="chatbox-top">
              <div class="chatbox-avatar">
                <Link to={`/profile/${student._id}`} target="_blank">
                  <img src={"http://3.133.60.237:3001/" + student.photo} />
                </Link>
              </div>
              <div class="chat-partner-name">
                {/*<span class="status donot-disturb"></span>*/}
                <Link to={`/profile/${student._id}`} target="_blank">
                  {student.fname + " " + student.lname}
                </Link>
              </div>
              <div class="chatbox-icons">
                <a href="javascript:void(0);">
                  <i
                    class="fa fa-minus"
                    onClick={() => this.minimize(target)}
                  ></i>
                </a>
                <a href="javascript:void(0);">
                  <i
                    class="fa fa-close"
                    onClick={() => {
                      this.close(target);
                    }}
                  ></i>
                </a>
              </div>
            </div>

            <div class="chat-content">
              <div class="col-md-12 chats border" id="chats">
                <ul class="p-0">
                  {data.map((message, key) => (
                    <MessageBox
                      key={key}
                      message={message}
                      photo={student.photo[0]}
                    />
                  ))}
                </ul>
              </div>
              <div class="col-md-12 message-box border pl-2 pr-2 border-top-0">
                <div class="chat-input-holder">
                  <textarea
                    class="chat-input"
                    onChange={e => this.setState({ message: e.target.value })}
                    value={this.state.message}
                  />
                  <input
                    type="submit"
                    value="Send"
                    class="message-send"
                    onClick={this.newMessage.bind(
                      this,
                      target,
                      project,
                      psData
                    )}
                  />
                </div>
                <div class="attachment-panel">
                  {!this.state.showProgress && (
                    <i
                      class="fa fa-paperclip fa-2x"
                      onClick={() => {
                        document.getElementById("fileInput").click();
                      }}
                    ></i>
                  )}
                  <input
                    id="fileInput"
                    style={{ display: "none" }}
                    type="file"
                    className="upload"
                    onChange={this.uploadPDF.bind(
                      this,
                      this.ref,
                      target,
                      project,
                      psData
                    )}
                    ref={this.ref}
                  />
                  {this.state.showProgress && (
                    // <span>
                    //   <i className="fa fa-upload"></i>{" "}
                    //   {this.state.progress + " %"}
                    // </span>
                    <ProgressBar
                                animated
                                now={this.state.progress}
                                label={`${this.state.progress}%`}
                              />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null;
    }
  }
}

class MessageBox extends Component {
  render() {
    const { message } = this.props;
    return (
      <div className="message-box">
        {!message.employer && (
          <div class="message-box-holder">
            {!message.pdf && (
              <div class="message-boxx message-partner">{message.msg}</div>
            )}

            {message.pdf && (
              <div class="message-boxx message-partner">
                <a
                  href={"http://3.133.60.237:3001/" + message.msg}
                  download={message.msg.split(
                    message.msg.replace(/^.*[\\\/]/, "")
                  )}
                  target="_blank"
                >
                  {message.msg.replace(/^.*[\\\/]/, "")}
                </a>
              </div>
            )}
          </div>
        )}

        {message.employer && (
          <div class="message-box-holder">
            {!message.pdf && <div class="message-boxx">{message.msg}</div>}

            {message.pdf && (
              <div class="message-boxx">
                <a
                  href={"http://3.133.60.237:3001/" + message.msg}
                  download={message.msg.split(
                    message.msg.replace(/^.*[\\\/]/, "")
                  )}
                  target="_blank"
                >
                  {message.msg.replace(/^.*[\\\/]/, "")}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

class ConfirmSubmission extends React.Component {
  constructor(props) {
    super(props);
  }

  close = () => {
    this.props.closePopup();
  };

  submitReview = accepted => {
    //change psModel status to 2
    const newStatus = accepted ? 3 : 1;
    this.props.changeStatusTo(newStatus);
    this.close();
  };

  render() {
    return (
      <React.Fragment>
        <div className="container">
          <div
            className="row"
            style={{ height: "50px", marginBottom: "100px", marginTop: "50px" }}
          >
            <div className="col-sm-12">
              <h2>submit review for the task...</h2>
            </div>
          </div>
          <div className="row">
            <div
              className="col-sm-4 btn btn-primary"
              onClick={() => {
                this.submitReview(true);
              }}
            >
              Accept
            </div>
            <div
              className="col-sm-4 btn btn-secondary"
              onClick={() => {
                this.submitReview(false);
              }}
            >
              Reject
            </div>
            <div
              className="col-sm-4 btn btn-secondary"
              onClick={() => {
                this.close("");
              }}
            >
              Close
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

class SubmitReview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      hardSkills: 0,
      softSkills: 0
    };
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    console.log(this.state);
  };

  submitReview = async () => {
    if (!this.state.submitting) {
      this.setState({ submitting: true });
      const res = await employerInstance.post("/reviewStudent", {
        hardSkills: this.state.hardSkills,
        softSkills: this.state.softSkills,
        pid: this.props.project._id,
        sid: this.props.student._id,
        eid: this.props.employer._id
      });
      if (res.data.code === 200) {
        trackActivity("review", { "review for": "student" });
        this.props.refreshState();
        this.props.closePopup();
      } else {
        console.log("error in review submission, ", res.data.msg);
      }
      this.setState({ submitting: false });
    }
  };

  close = () => {
    this.props.closePopup();
  };

  render() {
    return (
      <div className="container">
        <React.Fragment>
          <Table className="star-rating">
            <tbody>
              <tr>
                <th>Hard Skills</th>
                <th style={{ textAlign: "center" }}>
                  <ReactStars
                    count={5}
                    half={false}
                    size={42}
                    color2={"#ffd700"}
                    value={this.state.hardSkills}
                    onChange={newRating => {
                      this.setState({ hardSkills: newRating });
                    }}
                  />
                </th>
              </tr>
              <tr>
                <th>Soft Skills</th>
                <th>
                  <ReactStars
                    count={5}
                    half={false}
                    size={42}
                    color2={"#ffd700"}
                    value={this.state.softSkills}
                    onChange={newRating => {
                      this.setState({ softSkills: newRating });
                    }}
                  />
                </th>
              </tr>
              <tr>
                <th>
                  <div
                    className="col-sm-12 btn btn-primary"
                    onClick={() => {
                      this.submitReview();
                    }}
                  >
                    Submit
                  </div>
                </th>
                <th>
                  <div
                    className="col-sm-12 btn btn-secondary"
                    onClick={() => {
                      this.close();
                    }}
                  >
                    Later
                  </div>
                </th>
              </tr>
            </tbody>
          </Table>
        </React.Fragment>
      </div>
    );
  }
}

class ContractDetail extends Component {
  constructor(props) {
    super(props);
  }

  callFunc = () => {
    if (this.props.status == 2) {
      this.props.toggleConfirmSubmission();
    } else if (this.props.status == 3) {
      this.props.toggleConfirmPayment();
    }
  };

  render() {
    const {
      employer,
      project,
      student,
      status,
      nextStep,
      prevStep
    } = this.props;
    const steps = [
      { name: "Step 1", component: <Step1 status={status} /> },
      { name: "Step 2", component: <Step2 status={status} /> },
      {
        name: "Step 3",
        component: (
          <Step3
            status={status}
            toggleConfirmSubmission={this.props.toggleConfirmSubmission}
          />
        )
      },
      {
        name: "Step 4",
        component: (
          <Step4
            status={status}
            toggleConfirmPayment={this.props.toggleConfirmPayment}
          />
        )
      },
      { name: "Step 5", component: <Step5 status={status} /> }
    ];

    const ids = [employer._id, student._id];

    return (
      <div className="left-block">
        <div className="contract-info">
          <div className="contract-pic">
            <img src={"http://3.133.60.237:3001/" + student.photo} alt="" />
          </div>
          <h2>{`${student.fname} ${student.lname}`}</h2>
          <span>{student.email}</span>
          {status > 0 && (
            <Button
              className="chat-btn"
              onClick={() => {
                this.props.toggle(`${ids[0]}_${ids[1]}`);
              }}
            >
              Chat
            </Button>
          )}
          <div className="contract-about">
            <h2>Task Description</h2>
            <p>{project.taskDescription}</p>
          </div>

          {/* <div className="contract-payment">
            <h2>Payment</h2>
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>30 Oct 2019</td>
                  <td>Design the logo</td>
                  <td>In Progress</td>
                  <td>€30.00 EUR</td>
                </tr>

                <tr>
                  <td>30 Oct 2019</td>
                  <td>Design the logo</td>
                  <td>In Progress</td>
                  <td>€30.00 EUR</td>
                </tr>

                <tr>
                  <td>30 Oct 2019</td>
                  <td>Design the logo</td>
                  <td>In Progress</td>
                  <td>€30.00 EUR</td>
                </tr>

                <tr>
                  <td>30 Oct 2019</td>
                  <td>Design the logo</td>
                  <td>In Progress</td>
                  <td>€30.00 EUR</td>
                </tr>
              </tbody>
            </Table>
          </div> */}

          <div className="step-progress">
            <h2>Task Status</h2>
            <StepZilla
              steps={steps}
              nextButtonText={nextStep}
              backButtonText={prevStep}
            />
            <div className="step-button">
              {status < 4 && (
                <Button className="stepzilla-btn" onClick={this.callFunc}>
                  {nextStep}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ContractRate extends Component {
  render() {
    const { reviewed, review, receivedRating } = this.props;
    console.log("reviewed, ", reviewed);
    console.log("review, ", review);
    return (
      <div className="right-block">
        <h2>Payment Summary</h2>

        <p>Payments-to-date</p>
        {this.props.status >= 4 ? (
          <h3>€{this.props.project.jobValue}.00 EUR</h3>
        ) : (
          <h3>€0.00 EUR</h3>
        )}

        <p>Pending Payments</p>
        {this.props.status < 4 ? (
          <h3>€{this.props.project.jobValue}.00 EUR</h3>
        ) : (
          <h3>€0.00 EUR</h3>
        )}

        <div className="review-box">
          {this.props.status >= 4 ? (
            reviewed ? (
              receivedRating ? (
                <ReactStars
                  count={5}
                  half={false}
                  size={42}
                  edit={false}
                  color2={"#ffd700"}
                  value={review.rating}
                />
              ) : (
                "Waiting for student's review..."
              )
            ) : (
              <div className="review-btn">
                <RPopup
                  modal
                  keepTooltipInside=".tooltipBoundary"
                  contentStyle={{ width: "50%" }}
                  trigger={
                    <div className="review-btn" id="review">
                      {" "}
                      Write Review
                    </div>
                  }
                >
                  {close => (
                    <SubmitReview
                      refreshState={this.props.refreshState}
                      closePopup={close}
                      project={this.props.project}
                      student={this.props.student}
                      employer={this.props.employer}
                    />
                  )}
                </RPopup>
              </div>
            )
          ) : (
            <div
              className="review-btn"
              onClick={() => {
                this.props.toggleConfirmPayment();
              }}
            >
              Pay
            </div>
          )}
        </div>
      </div>
    );
  }
}

class Step1 extends Component {
  render() {
    if (this.props.status != "0" || this.props.status != 0)
      this.props.jumpToStep(this.props.status);
    return (
      <div className="step-container">
        <img src={step1} alt="Step 1" />

        <h3>Applied for Task</h3>
      </div>
    );
  }
}

class Step2 extends Component {
  render() {
    if (this.props.status != 1 || this.props.status != "1")
      this.props.jumpToStep(this.props.status);
    return (
      <div className="step-container">
        <img src={step2} alt="Step 2" />
        <h3>Task in Progress</h3>
      </div>
    );
  }
}

class Step3 extends Component {
  constructor(props) {
    super(props);
  }
  isValidated = async () => {
    await this.props.toggleConfirmSubmission();
    return false;
  };
  render() {
    if (this.props.status != 2 || this.props.status != "2")
      this.props.jumpToStep(this.props.status);
    return (
      <div className="step-container">
        <img src={step3} alt="Step 3" />

        <h3>Task in Review</h3>
      </div>
    );
  }
}

class Step4 extends Component {
  constructor(props) {
    super(props);
  }
  isValidated = async () => {
    await this.props.toggleConfirmPayment();
    return false;
  };

  render() {
    if (this.props.status != 3 || this.props.status != "3")
      this.props.jumpToStep(this.props.status);
    return (
      <div className="step-container">
        <img src={step4} alt="Step 4" />

        <h3>Task Finished</h3>
      </div>
    );
  }
}

class Step5 extends Component {
  render() {
    if (this.props.status != 4 || this.props.status != "4")
      this.props.jumpToStep(this.props.status);
    return (
      <div className="step-container">
        <img src={step4} alt="Step 5" />

        <h3>Payment Complete</h3>
      </div>
    );
  }
}
