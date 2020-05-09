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
import { Link } from "react-router-dom";
import {
  isemployer,
  isstudent,
  trackActivity
} from "../../../functions/functions";

import {
  userInstance,
  employerInstance,
  studentInstance,
  adminInstance
} from "../../../axios/axiosconfig";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton
} from "react-accessible-accordion";

class EmployerCreativeProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      job: {},
      pending: [],
      selected: []
    };

    this.push = this.push.bind(this);
  }

  componentWillUnmount() {
    // this.setState({ imgName: "" });
  }

  componentDidMount = () => {
    this.getCreativeList();
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

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

  getCreativeList = async () => {
    console.log("1");
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
      console.log("6");
      const _jid = this.props.location.job._id;
      console.log("about to get creative list of, ", _jid);
      const response = await employerInstance.post("/getCreativeList", {
        _jid
      });
      console.log("got list, ", response.data);
      console.log("response,", response);
      if (response.data.code === 200) {
        const job = response.data.job;
        let pending = job.bids && job.bids.length > 0 ? job.bids : [];
        console.log("pending list, ", pending);
        let selected =
          job.selected && job.selected.length > 0 ? job.selected : [];
        console.log("selected list, ", selected);
        // console.log(, ', pending)
        this.setState({
          job: response.data.job,
          pending,
          selected
        });
        console.log(this.state);
      }
    }
  };

  push(pa) {
    this.props.history.push(pa);
  }

  setTheState = stateData => {
    this.setState(stateData);
  };

  render() {
    const { job } = this.state;
    return job ? (
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
                              <th>Student</th>
                              <th>detail</th>
                              <th>Accept</th>
                              <th>Reject</th>
                            </tr>
                          </thead>

                          <tbody> */}
                        <Accordion>
                          <PendingList
                            processing={this.state.processing}
                            setProcessor={this.setProcessor}
                            getCreativeList={this.getCreativeList}
                            setTheState={this.setTheState}
                            push={this.push}
                            pending={this.state.pending}
                            job={this.props.location.job}
                          />
                        </Accordion>
                        {/* </tbody>
                        </Table> */}
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-sm-12 sol-mg-12 col-lg-12">
                        <br />
                        <br />
                        <br />
                        <br />
                        <hr />
                        <br />
                        <br />
                        <br />
                        <br />
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-sm-12 col-mg-12 col-lg-12">
                        <h3>Selected:</h3>
                        {/* <Table>
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>detail</th>
                              <th>Status</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody> */}
                        <Accordion>
                          <SelectedList
                            processing={this.state.processing}
                            setProcessor={this.setProcessor}
                            selected={this.state.selected}
                            job={this.props.location.job}
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
export default EmployerCreativeProject;

class PendingList extends Component {
  constructor(props) {
    super(props);
  }

  accept = async (_sid, _id, _pid, job) => {
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
        trackActivity("assign task", { "block type": job.jobBlock });

        // window.location.href = '/employer/contract'
        // this.props.history.push("path/to/push");
        // this.props.push({
        //   pathname: `/employer/creativeproject/${job._id}`,
        //   job: job,
        // });
        // {
        //   pathname: `/employer/contract/:${job._id}`,
        //   state: {
        //       job: job,
        //       _sid: _sid
        //   }
        // }
        this.props.getCreativeList();
      }
      this.props.setProcessor(false);
    }
  };

  reject = async obj => {
    if (!this.props.processing) {
      //delete from bids array in set state and db
      this.setProcessor(false);
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
        pending: data.bids,
        processing: false
      });
    }
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
          <p>
            {obj.detail && obj.detail.length > 0
              ? obj.detail
              : "N/A"}
          </p>
          <Link to={`/profile/${obj.studentId._id}`} target="_blank">
            Visit Profile
          </Link>
          {obj.bidDate}
          <Button
            onClick={() => {
              this.accept(obj.studentId._id, obj._id, obj.projectId, job);
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

class SelectedList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { job } = this.props;
    console.log('selected applicants in creative block, ', this.props.selected)
    // console.log('selected applicants in creative block from job obj, ', job.selected)
    console.log("creative props job, ", job);
    return this.props.selected.map((obj, key) => (
      <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>
            {obj.studentId.fname + " " + obj.studentId.lname}
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <p>
            {obj.detail && obj.detail.length > 0
              ? obj.detail
              : "N/A"}
          </p>
          <Link to={`/profile/${obj.studentId._id}`} target="_blank">
            Visit Profile
          </Link>

          {obj.status}

          <Link
            to={{
              pathname: `/employer/contract/:${job._id}`,
              state: { job: job, _sid: obj.studentId._id, status: obj.status }
            }}
          >
            <Button>View Contract</Button>
          </Link>
        </AccordionItemPanel>
      </AccordionItem>
    ));
  }
}
