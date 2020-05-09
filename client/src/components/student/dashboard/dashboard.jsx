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
import "../dashboard/dashboard.css";
import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import {
  userInstance,
  employerInstance,
  studentInstance
} from "../../../axios/axiosconfig";
import ReactStars from "react-stars";
import { formatDate } from "../../../functions/functions";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      fCount: 0,
      name: "",
      email: "",
      balance: 0,
      avgSoftSkills: 0,
      avgHardSkills: 0
    };
  }

  componentDidMount = () => {
    this.getProfileData();
    this.getMyProjects();
  };

  getMyProjects = async () => {
    const data = await studentInstance.post("/myRecentProjects");

    console.log("data for dashboard, ", data);
    const projects = data.data.projects;
    let fCount = 0;
    await projects.forEach(async project => {
      if (project.status >= 3) fCount = fCount + 1;
    });
    this.setState({
      projects,
      fCount
    });
  };

  getProfileData = async () => {
    const response = await studentInstance.post("/getprofile2");
    console.log(response);
    if (response.data.code === 200) {
      const data = response.data.profile_data;
      this.setState({
        name: data.fname + " " + data.lname,
        email: data.email,
        balance: data.balance,
        avgHardSkills: response.data.avgHardSkills,
        avgSoftSkills: response.data.avgSoftSkills
        // bio: data.bio,
        // photo: data.photo
      });
    }
  };

  render() {
    return (
      <div className="dashboard-section">
        <div className="page-title">
          <div className="container">
            <span>Welcome Back!</span>
            <h2>{this.state.name}</h2>
            <span>{this.state.email}</span>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <RecentProjects
                  employer={this.state.name}
                  projects={this.state.projects}
                />
              </div>

              <div className="col-md-4">
                <Summary allData={this.state} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Dashboard;

class RecentProjects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: []
    };
  }

  componentDidMount() {
    this.getMyProjects();
  }

  getMyProjects = async () => {
    const { projects } = this.props;
    if (projects)
      this.setState({
        projects
      });
  };

  render() {
    const { projects } = this.props;
    console.log("projects to render, ", projects);
    return (
      <div className="recent-project-section">
        <h2>Recent Tasks</h2>
        <Table>
          <thead>
            <tr>
              <th>Task Title</th>
              <th>Employer</th>
              <th>Amount</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((item, key) => (
              <CustomRow key={key} item={item} />
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

class CustomRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log("inside custom row");
    const { item } = this.props;
    return (
      <tr>
        <td>
          <Link
            key={item._id}
            to={{
              pathname: `/taskdetail/${item.projectId._id}`,
              project: item
            }}
            target="_blank"
          >
            {item.projectId.jobTitle.length > 40
              ? item.projectId.jobTitle.substr(0, 40) + ".."
              : item.projectId.jobTitle}
          </Link>
        </td>
        <td>{item.employerId.fname + " " + item.employerId.lname}</td>
        <td>€{item.projectId.jobValue}.00 EUR</td>
        <td>
          {item.projectId.jobType === "Hourly"
            ? item.projectId.numberOfHours + " hr"
            : formatDate(item.projectId.taskDeadline)}
        </td>
      </tr>
    );
  }
}

class Summary extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="summary-section">
        <div className="highlight-profile">
          <h2>{this.props.allData.name}</h2>
          {/* <span>{this.props.allData.email}</span> */}
        </div>

        <div className="highlight-content">
          <div className="dashboard-widget">
            <p>Account Balance</p>
            <h3>€{this.props.allData.balance}.00 EUR</h3>
          </div>

          <div className="dashboard-widget">
            <p>Task Finished</p>
            <h3>{this.props.allData.fCount}</h3>
          </div>

          <div className="dashboard-widget">
            <p>Soft Skills</p>
            <ReactStars
              count={5}
              value={this.props.allData.avgSoftSkills}
              half={true}
              edit={false}
              size={24}
              color2={"#ffd700"}
            />
          </div>

          <div className="dashboard-widget">
            <p>Hard Skills</p>
            <ReactStars
              count={5}
              value={this.props.allData.avgHardSkills}
              half={true}
              edit={false}
              size={24}
              color2={"#ffd700"}
            />
          </div>
        </div>
      </div>
    );
  }
}
