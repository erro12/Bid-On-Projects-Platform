import React, { Component } from "react";
import { Button, Table } from "react-bootstrap";
import "../editprofile/editprofile.css";
import { isauth, trackActivity, formatDate } from "../../../functions/functions";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton
} from "react-accessible-accordion";

import { employerInstance } from "../../../axios/axiosconfig";
import TaskMenu from "../../employer/mytasksidepanel/mytasksidepanel";

class Pending extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      job: {},
      pending: [],
      showPending: true,
      status: 0
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
      this.getList();
      //   console.log('location state, ', this.props.location.state)
      // this.setState({
      //   job: this.props.location.state.job,
      //   pending: this.props.location.state.job.bids,
      //   showPending: this.props.location.state.pending,
      //   status: this.props.location.state.status,
      // });
      // console.log("pending in proposal, ", this.props.location.state.job.bids);
    }
  }

  getList = async () => {
    console.log("location state, ", this.props.location.state);

    const _jid = this.props.location.state.job._id;
    const response = await employerInstance.post("/getCreativeList", {
      _jid
    });
    if (response.data.code === 200) {
      const job = response.data.job;
      if (job) {
        let pending = job.bids && job.bids.length > 0 ? job.bids : [];
        console.log("pending list, ", pending);
        this.setState({
          job: response.data.job,
          original: this.props.location.state.job,
          pending,
          showPending: this.props.location.state.pending,
          status: this.props.location.state.status
        });
        console.log(this.state);
      } else {
        if (!isauth()) this.props.history.push("/Login");
        else {
          console.log("3");

          this.props.history.push("/employer/mytasks");
        }
      }
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
    // const { state } = this.props.location;
    const { job } = this.state;
    return this.props.location.state ? (
      <div className="edite-profile-section">
        <div className="edit-container">
          <TaskMenu
            job={job}
            pending={this.state.showPending}
            status={this.state.status}
            target="pending"
          />
          {/* <TaskMenu job={this.state.job} pending={this.state.showPending} status={this.state.status}/> */}

          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>{job.jobTitle}</h2>
                  {/* <h2>{state.job.jobTitle}</h2> */}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="dashboard-list-box margin-top-0">
                  <div className="dashboard-list-box-static">
                    <div class="row">
                      <div class="col-sm-12 col-mg-12 col-lg-12">
                        <Accordion>
                          <PendingList
                            processing={this.state.processing}
                            setProcessor={this.setProcessor}
                            getCreativeList={this.getList}
                            setTheState={this.setTheState}
                            push={this.push}
                            pending={this.state.pending}
                            job={this.state.job}
                          />
                        </Accordion>
                        {/* </tbody>
                          </Table> */}
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
export default Pending;

class PendingList extends Component {
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

  render() {
    const { job } = this.props;
    return this.props.pending.map((obj, key) => (
      <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>
            {obj.studentId.fname + " " + obj.studentId.lname}
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <Table>
            <tbody>
              <tr>
                <th>Description:</th>
                <td>
                  <span>
                    {obj.detail && obj.detail.length > 0 ? obj.detail : "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Application Date:</th>
                <td>
                  <p>{formatDate(obj.bidDate)}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    className="btn btn-primary"
                    onClick={() => {
                      this.accept(
                        obj.studentId._id,
                        obj._id,
                        obj.projectId,
                        job,
                        obj.status
                      );
                    }}
                  >
                    Accept
                  </div>
                </td>
                <td>
                  <div
                    className="btn btn-secondary"
                    onClick={() => {
                      this.reject(obj);
                    }}
                  >
                    Reject
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
        </AccordionItemPanel>
      </AccordionItem>
    ));
  }
}
