import React, { Component } from "react";
import { isemployer, trackActivity } from "../../../functions/functions";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton
} from "react-accessible-accordion";

import {
  Button,
} from "react-bootstrap";
import { employerInstance } from "../../../axios/axiosconfig";

class Proposal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      job: {},
      pending: []
    };
    this.push = this.push.bind(this);
  }

  componentWillMount() {
    if (!this.props.location.job) {
      console.log("2");
      if (!this.isloggedin()) this.props.history.push("/Login");
      else {
        console.log("3");
        const route = isemployer()
          ? "/employer/mytasks"
          : "/student/mytasks";
        this.props.history.push(route);
        console.log("4, ", route);
      }
      console.log("5");
    } else {
      this.setState({
        job: this.props.location.job,
        pending: this.props.location.job.bids
      });
      console.log("pending in proposal, ", this.props.location.job.bids);
    }
    // console.log('proposals mounted', this.props.location.job)
  }

  setTheState = stateData => {
    this.setState(stateData);
  };

  push(pa) {
    this.props.history.push(pa);
  }

  isloggedin = async () => {
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf("token") == 0) {
        return true;
      }
    }
    return false;
  };

  setProcessor = mode => {
    this.setState({
      processing: mode
    });
  };

  acceptProposal = async (_sid, _id, _pid, job, status) => {
    if (!this.state.processing) {
      this.setProcessor(true);
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
        this.props.history.push({
          pathname: `/employer/contract/:${job._id}`,
          state: {
            job: job,
            _sid: _sid,
            status: status
          }
        });
      }
      this.setProcessor(false);
    }
  };

  render() {
    const { job } = this.props.location;
    return (

      this.props.location.job ? (
        <div className="edite-profile-section">
          <div className="edit-container">
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
                          <h3>Pending:</h3>
                          {/* <Table>
                            <thead>
                              <tr>
                                <th>Application date</th>
                                <th>detail</th>
                                <th>Student Id</th>
                                <th>Accept</th>
                                <th>Reject</th>
                              </tr>
                            </thead>
                            <tbody> */}
                            <Accordion>
                              <PendingList
                                setTheState={this.setTheState}
                                push={this.push}
                                pending={this.state.pending}
                                job={job}
                              /></Accordion>
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
      ) : null
    );
  }
}

export default Proposal;

class PendingList extends Component {
  constructor(props) {
    super(props);
  }

  accept = async (_sid, _id, _pid, job, status) => {
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
      trackActivity("assign task", {"block type": job.jobBlock})
      this.props.push({
        pathname: `/employer/contract/:${job._id}`,
        state: {
          job: job,
          _sid: _sid,
          status: 1
        }
      });
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

    trackActivity("reject application", {"block type": this.props.job.jobBlock})

    this.props.setTheState({
      job: data,
      pending: data.bids
    });
  };

  render() {
    const { job } = this.props;
    return this.props.pending.map((obj, key) => (
      // <Link key={item._id} className="listing" to={'/'}>
      // <tr key={key}>
      //   <td>{obj.bidDate}</td>
      //   <td>{obj.detail && obj.detail.length > 0 ? obj.detail : "N/A"}</td>
      //   <td>
      //     <Link to={`/profile/${obj.studentId._id}`} target="_blank">
      //       {obj.studentId.fname + " " + obj.studentId.lname}
      //     </Link>
      //   </td>
      //   <td>
      //     <Button
      //       onClick={() => {
      //         this.accept(
      //           obj.studentId._id,
      //           obj._id,
      //           obj.projectId,
      //           job,
      //           obj.status
      //         );
      //       }}
      //     >
      //       Accept
      //     </Button>
      //   </td>
      //   <td>
      //     <Button
      //       onClick={() => {
      //         this.reject(obj);
      //       }}
      //     >
      //       Reject
      //     </Button>
      //   </td>
      // </tr>
        <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>{obj.studentId.fname + " " + obj.studentId.lname}</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <p>{obj.detail && obj.detail.length > 0 ? obj.detail : "N/A"}</p>
          {obj.bidDate}
          <Button
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
          </Button>
          <Button
            onClick={() => {
              this.reject(obj);
            }}
          >
            Reject
          </Button>
        </AccordionItemPanel>
      </AccordionItem>
    ));
  }
}
