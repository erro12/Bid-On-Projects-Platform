import React, { Component } from "react";
import { Button, Form, Col, Table } from "react-bootstrap";
import "../editprofile/editprofile.css";
import {
  isauth,
  trackActivity,
  validateData,
  formatDate
} from "../../../functions/functions";
import { NotificationManager } from "react-notifications";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton
} from "react-accessible-accordion";

import { employerInstance } from "../../../axios/axiosconfig";
import TaskMenu from "../../employer/mytasksidepanel/mytasksidepanel";

class Payments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      job: {},
      milestones: [],
      showPending: true,
      status: 0,
      target: "",
      amount: "",
    };
    this.push = this.push.bind(this);
  }

  componentWillMount() {
    if (!this.props.location.state) {
      console.log("2");
      if (!isauth()) this.props.history.push("/Login");
      else {
        console.log("3");

        this.props.history.push("/employer/mytasks");
      }
      console.log("5");
    } else {
      this.getMilestones();
    }
  }

  getMilestones = async () => {
    const _jid = this.props.location.state.job._id;
    const response = await employerInstance.post("/getMilestones", {
      _jid
    });
    if (response.data.code === 200) {
      const ms = response.data.milestones;

      console.log("ms list, ", ms);
      this.setState({
        job: this.props.location.state.job,
        milestones: ms,
        showPending: this.props.location.state.pending,
        status: this.props.location.state.status
      });
      console.log(this.state);
    }
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  setTheState = stateData => {
    this.setState(stateData);
  };

  setProcessor = mode => {
    this.setState({
      processing: mode
    });
  };

  push(pa) {
    this.props.history.push(pa);
  }

  render() {
    const { job } = this.state;
    return this.props.location.state ? (
      <div className="edite-profile-section">
        <div className="edit-container">
          <TaskMenu
            job={job}
            pending={this.state.showPending}
            status={this.state.status}
            target="payment"
          />
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>{job.jobTitle}</h2>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="dashboard-list-box margin-top-0">
                  <div className="dashboard-list-box-static">
                    <div class="row">
                      <div class="col-sm-12 col-mg-12 col-lg-12">
                        <Accordion style={{collapsible: true}}>
                          <MilestoneForm
                          target={this.state.target}
                          amount={this.state.amount}
                            getMilestones={this.getMilestones}
                            processing={this.state.processing}
                            setProcessor={this.setProcessor}
                            setTheState={this.setTheState}
                            push={this.push}
                            pending={this.state.pending}
                            job={this.state.job}
                          />
                        </Accordion>

                        <MilestoneList milestones={this.state.milestones} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}
export default Payments;

class MilestoneForm extends Component {
  constructor(props) {
    super(props);
  }

  accept = async (_sid, _id, _pid, job, status) => {
    if (!this.props.processing) {
      this.props.setProcessor(true);
      console.log("will accept proposal of student: ", _sid);
      console.log("for project, ", _pid);
      console.log("as per bid, ", _id);
      let res = await employerInstance.post("/acceptproposal", {
        _id: _id,
        projectId: _pid,
        block: job.jobBlock
      });
      if (res.data.status === "ok") {
        // window.location.href = '/employer/contract'
        // this.props.history.push("path/to/push");
        trackActivity("assign task", { "block type": job.jobBlock });
        this.props.push({
          pathname: `/employer/contract/:${job._id}`,
          state: {
            job: job,
            _sid: _sid,
            status: 1
          }
        });
      }
      this.props.setProcessor(false);
    }
  };

  reject = async obj => {
    //delete from bids array in set state and db
    let data = this.props.job;
    data.bids = await data.bids.filter(bid => {
      return bid._id != obj._id;
    });

    const res = await employerInstance.post("/rejectProposal", {
      bid_id: obj._id,
      projectId: data.projectId
    });

    trackActivity("reject application", {
      "block type": this.props.job.jobBlock
    });

    this.props.setTheState({
      job: data,
      pending: data.bids
    });
  };

  addMilestone = async e => {
    e.preventDefault();
    if (!this.props.processing) {
      this.props.setProcessor(true);
      console.log(this.state);
      console.log(
        `Adding milestone, ${this.props.target} ${this.props.amount}`
      );

      const { target, amount } = this.props;
      let totalPaid = 0; //calc total paid from paid milestones
      const totalRemaining = this.props.job.jobValue - totalPaid;
      if (amount > totalRemaining) {
        NotificationManager.error(
          "Amount shall not be greater than remaining amount to be paid",
          "Message",
          4000
        );
      } else {
        console.log('props job, ', this.props.job)
        console.log('props processing, ', this.props.processing)
        const payLoad = {
          date: new Date().toISOString(),
          amount,
          target,
          task: this.props.job._id
        };

        if (isNaN(payLoad.amount))
          NotificationManager.error(
            "Amount shall be a number",
            "Message",
            4000
          );
        else {
          console.log('new milestone payLoad, ', payLoad)
          let isValid = validateData([
            payLoad.target,
            payLoad.date,
            payLoad.amount,
            payLoad.task
          ]);

          if (isValid) {
            console.log("Valid milestone Payload --------", payLoad);
            const response = await employerInstance.post("/addMilestone", {
              payLoad
            });
            console.log("Response from the server -----", response);
            if (response.data.code === 200) {
              const milestone = response.data.savedMilestone;

              trackActivity("create task", {
                "creation date": milestone.date,
                amount: milestone.amount
              });

              NotificationManager.success(
                "Milestone added successfully",
                "Message",
                4000
              );
              this.setState({
                target: "",
                amount: 0
              });
              this.props.setProcessor(false);
              this.props.getMilestones();
            } else {
              this.props.setProcessor(false);
              NotificationManager.error(response.data.msg, "Message", 4000);
            }
          } else {
            this.props.setProcessor(false);
            NotificationManager.error(
              "Please Enter a valid data",
              "Message",
              4000
            );
          }
        }
      }
    }
  };

  handleChange = e => {
    this.props.setTheState({ [e.target.name]: e.target.value });
    // console.log(this.state);
  };

  render() {
    const { job } = this.props;
    return (
      <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>+ Add Milestone</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <Form onSubmit={this.addMilestone}>
            <Form.Row>
              <Form.Group as={Col} controlId="exampleForm.ControlTask">
                <Form.Control
                  onChange={this.handleChange}
                  name="target"
                  value={this.props.target}
                  placeholder="description"
                />
              </Form.Group>
              <Form.Group as={Col} controlId="exampleForm.ControlTask">
                <Form.Control
                  onChange={this.handleChange}
                  name="amount"
                  value={this.props.amount}
                  placeholder="amount"
                />
              </Form.Group>
              <Form.Group as={Col} controlId="exampleForm.ControlTask">
                <Button className="btn btn-primary" type="submit">
                  Submit
                </Button>
              </Form.Group>
            </Form.Row>
          </Form>
        </AccordionItemPanel>
      </AccordionItem>
    );
  }
}

class MilestoneList extends Component {
  render() {
    return (
      <div className="container">
        <div className="contract-payment">
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
              {this.props.milestones &&
                this.props.milestones.map(ms => <MsROW ms={ms} key={ms._id} />)}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

class MsROW extends Component {

  render() {
    return (
      <tr>
        <td>{formatDate(this.props.ms.date)}</td>
        <td>{this.props.ms.target}</td>
        <td>{this.props.ms.paid ? "Complete" : "In Progress"}</td>
        <td>€{this.props.ms.amount}.00 EUR</td>
      </tr>
    );
  }
}
