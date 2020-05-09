import React, { Component } from "react";
import "./publicdashboard.css";
import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";
import {
  userInstance
} from "../../axios/axiosconfig";
import ReactStars from 'react-stars'


class PublicDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userid: "",
      name: "",
      email: "",
      isemployer: false,
      loading: true,
      projectCount: 0,
      avgRating: 0,
      reviewCount: 0,
      balance: 0,
      avgSoftSkills: 0,
      avgHardSkills: 0
    };
  }

  componentDidMount = () => {
    const { _id } = this.props.match.params;
    if (!_id) {
      this.props.history.push("/");
    } else this.getProfileData();
  };

  changeState = newState => {
    this.setState(newState);
  };

  getProfileData = async () => {
    const { _id } = this.props.match.params;
    const response = await userInstance.get(`/profileById/${_id}`);
    console.log(response);
    if (response.data.code === 200) {
      const data = response.data.profile_data;

      if (data.isemployer) {
        this.setState({
          userid: data._id,
          name: data.fname + " " + data.lname,
          email: data.email,
          loading: false,
          projectCount: response.data.projectCount,
          isemployer: data.isemployer
          // bio: data.bio,
          // photo: data.photo
        });
      } else {
        this.setState({
          userid: data._id,
          name: data.fname + " " + data.lname,
          email: data.email,
          loading: false,
          balance: data.balance,
          avgHardSkills: response.data.avgHardSkills,
          avgSoftSkills: response.data.avgSoftSkills,
          projectCount: response.data.projectCount,
          isemployer: data.isemployer
          // bio: data.bio,
          // photo: data.photo
        });
      }
    }
  };

  render() {
    {
      return this.state.loading ? null : this.state.isemployer ? (
        <EmployerDashboard
          allData={this.state}
          changeState={this.changeState}
        />
      ) : (
        <StudentDashboard allData={this.state} changeState={this.changeState} />
      );
    }
  }
}
export default PublicDashboard;

class EmployerDashboard extends Component {
  changeState = newState => {
    this.props.changeState(newState);
  };

  render() {
    const { name, email, userid } = this.props.allData;
    return (
      <div className="dashboard-section">
        <div className="page-title">
          <div className="container">
            <h2>{name}</h2>
            <span>{email}</span>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <EmployerRecentProjects
                  userid={userid}
                  employer={name}
                  changeState={this.changeState}
                />
              </div>

              <div className="col-md-4">
                <EmployerSummary allData={this.props.allData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}



class StudentDashboard extends Component {

changeState = (newState) => {
  this.props.changeState({name: this.props.allData.name});
}

  render() {
    const { name, email, userid } = this.props.allData;
    return (
      <div className="dashboard-section">
        <div className="page-title">
          <div className="container">
            <h2>{name}</h2>
            <span>{email}</span>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <StudentRecentProjects
                  userId={userid}
                  employer={name}
                  changeState={this.changeState}
                  allData={this.props.allData}
                />
              </div>

              <div className="col-md-4">
                <StudentSummary allData={this.props.allData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class EmployerRecentProjects extends Component {
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
    const data = await userInstance.post("/empProjects", {
      userid: this.props.userid
    });
    console.log("data for dashboard, ", data.data);
    console.log("average rating, ", data.data.avgRating);
    this.setState({
      projects: data.data.projects
    });
    this.props.changeState({
      avgRating: data.data.avgRating,
      reviewCount: data.data.reviewCount
    });
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
            {this.state.projects.map(item => (
              // <Link key={item._id} className="listing" to={'/'}>
              <EmployerCustomRow item={item} />
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

class StudentRecentProjects extends Component {
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
    const data = await userInstance.post("/stdProjects", {
      userid: this.props.userId
    });
    console.log("data for dashboard, ", data.data);

    this.setState({
      projects: data.data.projects
    });
    this.props.changeState({});
  };

  render() {
    return (
      <div className="recent-project-section">
        <h2>Recent Tasks</h2>
        <Table>
          <thead>
            <tr>
              <th>Task / Contest Title</th>
              <th>Employer</th>
              <th>Amount</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {this.state.projects.map(item => (
              // <Link key={item._id} className="listing" to={'/'}>
              <StudentCustomRow item={item} />
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

class EmployerCustomRow extends Component {

  render() {
    const { item } = this.props;
    return (
      <tr>
        <td>
          <Link
            key={item._id}
            to={{
              pathname: `/taskdetail/${item._id}`,
              project: item
            }}
            target="_blank"
          >
            {item.jobTitle.length > 40
              ? item.jobTitle.substr(0, 40) + ".."
              : item.jobTitle}
          </Link>
        </td>
        <td>€{item.jobValue}.00 EUR</td>
        <td>
          {item.jobType === "Hourly"
            ? item.numberOfHours + " hr"
            : item.taskDeadline}
        </td>
      </tr>
    );
  }
}

class EmployerSummary extends Component {

  render() {
    return (
      <div className="summary-section">
        {/* <div className="highlight-profile">
          <h2>{this.props.allData.name}</h2>
           <span>{this.props.allData.email}</span> 
        </div> */}

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

class StudentCustomRow extends Component {

  render() {
    const { item } = this.props;
    return (
      <tr>
        <td>
          <Link
            key={item._id}
            to={{
              pathname: `/taskdetail/${item._id}`,
              project: item
            }}
            target="_blank"
          >
            {item.projectId.jobTitle.length > 40
              ? item.projectId.jobTitle.substr(0, 40) + ".."
              : item.projectId.jobTitle}
          </Link>
        </td>
        <td>
          {item.employerId.fname +
            " " +
            item.employerId.lname}
        </td>
        <td>€{item.projectId.jobValue}.00 EUR</td>
        <td>{item.projectId.jobType === "Hourly"
            ? item.projectId.numberOfHours + " hr"
            : item.projectId.taskDeadline}</td>
      </tr>
    );
  }
}

class StudentSummary extends Component {

  render() {
    return (
      <div className="summary-section">
        {/* <div className="highlight-profile">
          <h2>{this.props.allData.name}</h2>
           <span>{this.props.allData.email}</span> 
        </div> */}

        <div className="highlight-content">
          <div className="dashboard-widget">
            <p>Account Balance</p>
            <h3>{`€${this.props.allData.balance}.00 EUR`}</h3>
          </div>

          <div className="dashboard-widget">
            <p>Task Finished</p>
            <h3>{this.props.allData.projectCount}</h3>
          </div>

          <div className="dashboard-widget">
            <p>Soft Skills</p>
            <ReactStars
              count={5}
              value={this.props.allData.avgSoftSkills}
              half={true}
              edit={false}
              size={24}
              color2={'#ffd700'} />
          </div>

          <div className="dashboard-widget">
            <p>Hard Skills</p>
            <ReactStars
              count={5}
              value={this.props.allData.avgHardSkills}
              half={true}
              edit={false}
              size={24}
              color2={'#ffd700'} />
          </div>
        </div>
      </div>
    );
  }
}
