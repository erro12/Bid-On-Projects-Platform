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
import { userInstance, employerInstance } from "../../../axios/axiosconfig";
import ReactStars from 'react-stars'

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      projectCount: 0,
      avgRating: 0,
      reviewCount: 0,
    };
  }

  componentDidMount = () => {
    this.getProfileData();
  };

  changeState = (newState)=>{
    this.setState(newState);
  }

  getProfileData = async () => {
    const response = await userInstance.post("/getprofile");
    console.log(response);
    if (response.data.code === 200) {
      const data = response.data.profile_data;
      this.setState({
        name: data.fname + " " + data.lname,
        email: data.email,
        projectCount: response.data.projectCount
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
                <RecentProjects employer={this.state.name} changeState={this.changeState}/>
              </div>

              <div className="col-md-4">
                <Summary allData={this.state}/>
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
      avgRating: 0,
      reviewCount: 0,
      projects: []
    };
  }

  componentDidMount() {
    this.getMyProjects();
  }

  getMyProjects = async () => {
    const data = await employerInstance.post("/myProjects");
    console.log("data for dashboard, ", data.data.projects);
    console.log('average rating, ', data.data.avgRating)
    this.setState({
      projects: data.data.projects,
    });
    this.props.changeState({avgRating: data.data.avgRating, reviewCount: data.data.reviewCount})
  };

  render() {
    return (
      <div className="recent-project-section">
        <h2>Recent Tasks</h2>
        <Table>
          <thead>
            <tr>
              <th>Task / Contest Title</th>
              <th>Amount</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {this.state.projects.map((project, key) => (
              <ProjectRow project={project} />
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

class ProjectRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { project } = this.props;
    return (
      <tr>
        <td>
          <Link
            key={project._id}
            to={{
              pathname: `/taskdetail/${project._id}`,
              project: project
            }}
            target="_blank"
          >
            {project.jobTitle.length > 40
              ? project.jobTitle.substr(0, 40) + ".."
              : project.jobTitle}
          </Link>
        </td>
        <td>€{project.jobValue}.00 EUR</td>
        <td>
          {project.jobType === "Hourly"
            ? project.numberOfHours + " hr"
            : project.taskDeadline}
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
            <p>Task Posted</p>
            <h3>{this.props.allData.projectCount}</h3>
          </div>

          <div className="dashboard-widget">
            <p>Rating</p>
            <ReactStars
              count={5}
              value={this.props.allData.avgRating}
              half={true}
              edit={false}
              size={24}
              color2={'#ffd700'} />
          </div>

          <div className="dashboard-widget">
            {/* <p>Comments</p>
            <h3>.....</h3> */}
            <h3>{this.props.allData.reviewCount} Reviews</h3>
          </div>
        </div>
      </div>
    );
  }
}
