import React, { Component } from "react";
import "./dashboard.css";
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
import upload from "../../../assets/images/upload.jpg";
import { Link } from "react-router-dom";
import {
  userInstance,
  employerInstance,
  studentInstance,
  adminInstance
} from "../../../axios/axiosconfig";
import { validateData } from "../../../functions/functions";
import { NotificationManager } from "react-notifications";
import SidePanel from "./sidepanel/sidepanel";

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      employers: 0,
      students: 0,
      blocked: 0,
      verified: 0,
      twb: 0,
      tob: 0,
      tcb: 0,
      finished: 0,
      ota: 0,
      hourly: 0,
      remote: 0,
      tA: 0,
      pA: 0
    };
  }
  componentDidMount = () => {
    this.getOverview();
  };

  getOverview = async () => {
    if (!this.state.loading) {
      this.state.loading = true;
      console.log("aefsdfs");
      const response = await adminInstance.post("/getOverview");
      console.log("got overview, ", response.data);
      console.log("response,", response);
      const {
        employers,
        students,
        blocked,
        verified,
        twb,
        tob,
        tcb,
        finished,
        ota,
        hourly,
        remote,
        tA,
        pA
      } = response.data;
      if (response.data.code === 200) {
        this.setState({
          employers,
          students,
          blocked,
          verified,
          twb,
          tob,
          tcb,
          finished,
          ota,
          hourly,
          remote,
          tA,
          pA,
          loading: false
        });
      }
    }
  };

  refresh = () => {
    this.state.loading = true;
    this.getOverview();
  };

  render() {
    const {
      employers,
      students,
      blocked,
      verified,
      twb,
      tob,
      tcb,
      finished,
      ota,
      hourly,
      remote,
      tA,
      pA
    } = this.state;
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <SidePanel target="dashboard" />
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <div>
                    <h1>
                      Welcome to <span>Admin Panel!</span>{" "}
                      {/*!this.state.loading && (
                        <i
                          class="fa fa-refresh fa-fw"
                          aria-hidden="true"
                          onClick={this.refresh}
                        ></i>
                      )*/}
                      {this.state.loading && <span>refreshing...</span>}
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6 col-md-6">
                <div className="card-title">
                  <h2>Users</h2>
                </div>

                <div className="card">
                  <Table>
                    <thead>
                      <th>type</th>
                      <th>count</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Employers</td>
                        <td>{employers}</td>
                      </tr>
                      <tr>
                        <td>Students</td>
                        <td>{students}</td>
                      </tr>
                      <tr>
                        <td>Verified</td>
                        <td>{verified}</td>
                      </tr>
                      <tr>
                        <td>Blocked</td>
                        <td>{blocked}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>

              <div className="col-lg-6 col-md-6">
                <div className="card-title">
                  <h2>Applications</h2>
                </div>
                <div className="card">
                  <Table>
                    <thead>
                      <th>type</th>
                      <th>count</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>total</td>
                        <td>{tA}</td>
                      </tr>
                      <tr>
                        <td>accepted</td>
                        <td>{tA - pA}</td>
                      </tr>
                      <tr>
                        <td>pending</td>
                        <td>{pA}</td>
                      </tr>
                      {/* <tr>
                                <td>Blocked</td>
                                <td>0</td>
                              </tr> */}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="card-title">
                  <h2>Tasks</h2>
                </div>

                <div className="card">
                  <Table>
                    <thead>
                      <th>type</th>
                      <th>count</th>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Work Block</td>
                        <td>{twb}</td>
                      </tr>
                      <tr>
                        <td>Open Block</td>
                        <td>{tob}</td>
                      </tr>
                      <tr>
                        <td>Creative Block</td>
                        <td>{tcb}</td>
                      </tr>
                      <tr>
                        <td>Finished</td>
                        <td>{finished}</td>
                      </tr>
                      <tr>
                        <td>Active</td>
                        <td>{tob + tcb + twb - (finished + ota)}</td>
                      </tr>
                      <tr>
                        <td>Open to apply</td>
                        <td>{ota}</td>
                      </tr>
                      <tr>
                        <td>Hourly Rate</td>
                        <td>{hourly}</td>
                      </tr>
                      <tr>
                        <td>Fixed</td>
                        <td>{tob + tcb + twb - hourly}</td>
                      </tr>
                      <tr>
                        <td>Remote</td>
                        <td>{remote}</td>
                      </tr>
                      <tr>
                        {/*    //can add search by location... */}
                        <td>Location Based</td>
                        <td>{tob + tcb + twb - remote}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default AdminDashboard;
