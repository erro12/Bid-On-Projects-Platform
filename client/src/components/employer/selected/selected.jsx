import React, { Component } from "react";
import { Button, Table } from "react-bootstrap";
import "../editprofile/editprofile.css";
import {
  isauth,
  trackActivity
} from "../../../functions/functions";
import { Link } from "react-router-dom";

import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemPanel,
    AccordionItemButton
  } from "react-accessible-accordion";

import { employerInstance } from "../../../axios/axiosconfig";
import TaskMenu from "../../employer/mytasksidepanel/mytasksidepanel";

class Selected extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      original: {},
      job: {},
      selected: [],
      showPending: true,
      status: 0,
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
        if(!this.props.location.state.job._id){
          console.log("2");
          if (!isauth()) this.props.history.push("/Login");
          else {
            console.log("3");

            this.props.history.push("/employer/mytasks");
          }
          console.log("5");
        }else{
          this.getList()
        }
    }
  }

  getList = async ()=>{
    console.log('location state, ', this.props.location.state)

    const _jid = this.props.location.state.job._id;
    const response = await employerInstance.post("/getCreativeList", {
      _jid
    });
    if (response.data.code === 200) {
      const job = response.data.job;
      let selected =
        job.selected && job.selected.length > 0 ? job.selected : [];
      console.log("selected list, ", selected);
      this.setState({
        job: response.data.job,
        original: this.props.location.state.job,
        selected,
        showPending: this.props.location.state.pending,
        status: this.props.location.state.status,
      });
      console.log(this.state);
    }
  }

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
    const { job, original } = this.state;
    return (
        job ? (<div className="edite-profile-section">
        <div className="edit-container">
          <TaskMenu job={job} pending={this.state.showPending} status={this.state.status} target="selected"/>

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
                            <Accordion>
                              <SelectedList
                              processing={this.state.processing}
                              setProcessor={this.setProcessor}
                                selected={this.state.selected}
                                job={this.state.job}
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
      </div>) : null
    );
  }
}
export default Selected;


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
          <Table>
            <tbody>
              <tr>
              <th>Description:</th>
              <td><span>
                {obj.detail && obj.detail.length > 0
                  ? obj.detail
                  : "N/A"}
              </span></td>
              </tr>
              <tr>
              <th>Status:</th>
              <td>{obj && <p>{obj.status === 0
                ? "Pending Approval"
                : obj.status >= 4
                ? "Finished"
                : "In Progress"}</p>}</td>
              </tr>
              <tr>
              <th><Link to={`/profile/${obj.studentId._id}`} target="_blank">
                Visit Profile
              </Link></th>
              <td><Link
                to={{
                  pathname: `/employer/contract/:${job._id}`,
                  state: { job: job, _sid: obj.studentId._id, status: obj.status }
                }}
              >
                <div className="btn btn-primary">View Contract</div>
              </Link></td>
              </tr>
            </tbody>
          </Table>
          </AccordionItemPanel>
        </AccordionItem>
      ));
    }
  }
