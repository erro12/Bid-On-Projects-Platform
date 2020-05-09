import React, { Component } from "react";
import "./projectdetail.css";
import employee from "../../assets/images/employe.jpg";
import { Link } from "react-router-dom";
import job_icon from "../../assets/images/job-icon.png";
import {
  isemployer,
  isstudent,
  isauth,
  isadminAuth
} from "../../functions/functions";
import { studentInstance, userInstance } from "../../axios/axiosconfig";
class ProjectDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      project: {},
      createdBy: {},
      retrieving: true,
      loading: true,
      applied: false,
      notCheckedYet: true
    };
  }

  async componentDidMount() {
    const { projectId } = this.props.match.params;

    const res = await userInstance.post("/getProjectByIdPopulatedCreatedBy", {
      projectId
    });

    const project = res.data.projectData;
    // console.log("project from response, ", project);
    if (!project) {
      if (!isauth()) this.props.history.push("/tasks");
      else {
        const route = isemployer() ? "/employer/tasks" : "/student/tasks";
        this.props.history.push(route);
      }
    }

    this.state.createdBy = project.createdBy;

    this.setState({
      project: project,
      loading: false,
      retrieving: false
    });
  }

  changeState = newState => {
    console.log("new state inside change state, ", newState);
    this.setState(newState);
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

  render() {
    {
      return this.state.project ? (
        <div className="jobdetail-section">
          <div className="page-title">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <h2>Task Detail</h2>
                  {!isauth() && (
                    <div className="login-signup">
                      <Link className="job-login-btn" to={"/login"}>
                        Login
                      </Link>
                      <Link className="job-register-btn" to={"/register"}>
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="jobdetail-container">
            <div className="container">
              <div className="row">
                <div className="col-md-9">
                  <JobInfo job={this.state.project} />
                </div>

                <div className="col-md-3">
                  <JobRate
                    changeState={this.changeState.bind(this)}
                    createdBy={this.state.createdBy._id}
                    job={this.state.project}
                    state={{
                      loading: this.state.loading,
                      notCheckedYet: this.state.notCheckedYet,
                      applied: this.state.applied,
                      retrieving: this.state.retrieving
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p> Data not found </p>
      );
    }
  }
}
export default ProjectDetails;

class JobInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      applied: false
    };
  }

  render() {
    const { job } = this.props;
    if (job.createdBy) console.log("dp, ", job.createdBy.photo[0]);
    {
      return job.createdBy ? (
        <div className="left-block">
          <div className="jobdetail-info">
            <div className="jobdetail-title">
              <div className="jobdetail-listing">
                <div className="jobdetail-listing-logo">
                  {/* <img src={job_icon} alt="" /> */}
                  <img
                    src={"http://3.133.60.237:3001/" + job.createdBy.photo[0]}
                    alt=""
                  />
                </div>

                <div className="jobdetail-listing-title">
                  <h4>
                    {job.jobTitle}{" "}
                    <span className="jobdetail-listing-type">
                      {job.jobBlock}
                    </span>
                  </h4>
                  <ul className="jobdetail-listing-icons">
                    <li>
                      <Link
                        to={`/profile/${job.createdBy._id}`}
                        target="_blank"
                      >
                        <i class="fas fa-briefcase"></i>{" "}
                        {job.createdBy.fname + " " + job.createdBy.lname}
                      </Link>
                    </li>
                    <li>
                      <i className="fa fa-map-marker"></i>
                      {job.jobLocation === "Remote Work"
                        ? "Remote"
                        : job.jobLocation}
                    </li>
                    <li>
                      <i className="fa fa-money"></i> €{job.jobValue}.00 EUR
                    </li>
                    <li>
                      <div className="jobdetail-listing-date new">
                        {job.jobType === "Hourly"
                          ? job.numberOfHours + " hr"
                          : job.taskDeadline}
                      </div>
                    </li>{" "}
                    {/*//replace with job create date dif. */}
                  </ul>
                </div>
              </div>
            </div>

            <div className="jobdetail-about">
              <h2>Task Description</h2>
              {/* <p>Millennium Jewelry are introducing a new range of accessories for iPhone and Samsung users and we would value your opinion on our new products. We are holding focus groups over 5 days at our offices in Dublin, starting January 11th.</p>
                    <p>Ideally we are looking for students who are interested in fashion and not afraid to voice their opinion and no previous experience is required. Each focus group will last approximately 4 hours and we would require all candidates to be available for at least two groups during the 5 day period as we will be exploring several different creative routes where we would value your input. The details of the focus group timings are attached and we look forward to hearing from you.</p> */}

              <p>{job.taskDescription}</p>
            </div>
          </div>
        </div>
      ) : (
        <p></p>
      );
    }
  }
}

class JobRate extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    if ((await isstudent()) && this.props.state.notCheckedYet) {
      console.log("is student inside did mount");
      //   if (!this.props.state.retrieving) {
      this.checkIfApplied();
      //   }
    }
  }

  componentDidUpdate() {
    if (isstudent() && this.props.state.notCheckedYet) {
      console.log("is student inside did update");
      if (this.props.job) {
        this.checkIfApplied();
      }
    }
  }

  checkIfApplied = async () => {
    console.log("inside check if applied with job, ", this.props.job);
    if (!(Object.keys(this.props.job).length === 0)) {
      const res = await studentInstance.post("/checkIfApplied", {
        job: this.props.job
      });

      this.props.changeState({
        loading: res.data.loading,
        notCheckedYet: false,
        applied: res.data.applied
      });
    } else {
      console.log("inside check if applied, no jobs yet");
    }
  };

  isloggedin = async () => {
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf("isemployer") == 0) {
        return true;
      }
    }
    return false;
  };

  render() {
    const { job, createdBy } = this.props;
    const { applied, loading, retrieving } = this.props.state;
    console.log(":inside jobrate component:");
    console.log("job=", job);
    console.log("applied=", applied);
    console.log("loading=", loading);

    return (
      <div className="right-block">
        <div className="apply-job-box">
          {!isauth() && <div className="apply-job-btn">Login to apply</div>}

          {isauth() && !isemployer() && !loading && !applied && (
            <Link
              className="apply-job-btn"
              to={{
                // pathname: apply_link,
                pathname: `/student/applyproject/${job._id}+${createdBy}`,
                state: {
                  project: job._id,
                  owner: createdBy
                }
              }}
            >
              Apply Task
            </Link>
          )}

          {isauth() && !isemployer() && !loading && applied && (
            <div className="apply-job-btn">Applied</div>
          )}
        </div>

        <div className="jobdetail-widget">
          <span>Block Type</span>
          <h2>{job.jobBlock}</h2>
        </div>
        {job.jobType === "Hourly" ? (
          <React.Fragment>
            <div className="jobdetail-widget">
              <span>Task Time</span>
              <h2>{job.numberOfHours} Hours</h2>
            </div>
            <div className="jobdetail-widget">
              <span>Pay</span>
              <h2>€{job.jobValue}.00 EUR / hr</h2>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="jobdetail-widget">
              <span>Task Deadline</span>
              <h2>{job.taskDeadline}</h2>
            </div>
            <div className="jobdetail-widget">
              <span>Pay</span>
              <h2>€{job.jobValue}.00 EUR</h2>
            </div>
          </React.Fragment>
        )}

        <div className="jobdetail-widget">
          <span>Location</span>
          <h2>{job.jobLocation}</h2>
        </div>
      </div>
    );
  }
}
