import React, { Component } from "react";
import "./publicprofile.css";
import employee from "../../assets/images/employe.jpg";
import { Link } from "react-router-dom";
import history from "../../history";
import { userInstance } from "../../axios/axiosconfig";
import { validateData } from "../../functions/functions";
import { NotificationManager } from "react-notifications";

class PublicProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      name: "",
      photo: "",
      email: "",
      bio: "",
      skills: [],
      fieldOfWork: [],
      currentSituation: "",
      projectCount: 0,
      address: "",
      location: "",
      isemployer: true,
      url: ""
    };
  }

  componentDidMount = () => {
    const { _id } = this.props.match.params;
    if (!_id) {
      this.props.history.push("/");
      // this.props.history.goBack();
    } else this.getProfileData();
  };

  getProfileData = async () => {
    const { _id } = this.props.match.params;
    const response = await userInstance.get(`/profileById/${_id}`);
    console.log(response);
    if (response.data.code === 200) {
      const data = response.data.profile_data;
      console.log("public profile data, ", data);
      if (!data.public) {
        console.log("public or not, ", data);
        console.log("this.account is private");
        //redirect to private profile message
        this.props.history.push("/");
      }
      if (data.isemployer) {
        this.setState({
          name: data.fname + " " + data.lname,
          email: data.email,
          bio: data.bio,
          photo: data.photo,
          fieldOfWork: data.workPreference,
          projectCount: response.data.projectCount,
          address: data.address,
          loading: false,
          isemployer: data.isemployer,
          _id: data._id,
          url: data.url
        });
      } else {
        this.setState({
          name: data.fname + " " + data.lname,
          email: data.email,
          bio: data.bio,
          photo: data.photo,
          skills: data.workPreference,
          currentSituation: data.currentSituation,
          projectCount: response.data.projectCount,
          address: data.address,
          isemployer: data.isemployer,
          location: data.location,
          loading: false,
          _id: data._id,
          url: data.url
        });
      }
    }
  };

  render() {
    return this.state.loading ? null : (
      <div className="dashboard-section">
        <div className="page-title">
          <div className="container">
            <h2>{this.state.name}</h2>
            <span>{this.state.email}</span>
          </div>
        </div>

        <div className="employer-container">
          <div className="container">
            <div className="row">
              <div className="col-md-9">
                <ProfileDetail {...this.state} />
              </div>

              <div className="col-md-3">
                {!this.state.isemployer ? (
                  <StudentProfileRate
                    email={this.state.email}
                    _id={this.state._id}
                    skills={this.state.skills}
                    currentSituation={this.state.currentSituation}
                    projectCount={this.state.projectCount}
                  />
                ) : (
                  <EmployerProfileRate
                    email={this.state.email}
                    _id={this.state._id}
                    fieldOfWork={this.state.fieldOfWork}
                    projectCount={this.state.projectCount}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default PublicProfile;

class ProfileDetail extends Component {
  render() {
    const { isemployer, url } = this.props;
    console.log("employer public profile, ", isemployer);
    console.log("url public profile, ", url);
    return (
      <div className="left-block">
        <div className="employee-info">
          <div className="employee-pic">
            <img src={"http://3.133.60.237:3001/" + this.props.photo} alt="" />
          </div>
          <h2>{this.props.name}</h2>
          {/* <span>{this.props.email}</span> */}
          <span className="location">
            <i className="fa fa-map-marker"></i>{" "}
            {this.props.isemployer ? this.props.address : this.props.location}
          </span>
          <ul className="contact-icons">
            <li>
              {/* <Link className="c-icon" to={"/"}> */}
              <i className="fa fa-user fa-2x"></i>
              {/* </Link> */}
            </li>
            <li>
              {/* <Link className="c-icon" to={"/"}> */}
              <i className="fa fa-credit-card fa-2x"></i>
              {/* </Link> */}
            </li>
            <li>
              {/* <Link className="c-icon" to={"/"}> */}
              <i className="fa fa-envelope fa-2x"></i>
              {/* </Link> */}
            </li>
            {this.props.url && this.props.isemployer && (
              <li>
                <a className="c-icon" href={this.props.url} target="_blank">
                  <i className="fa fa-globe"></i>
                </a>
              </li>
            )}
            {this.props.url && !this.props.isemployer && (
              <li>
                <a className="c-icon" href={this.props.url} target="_blank">
                  <i className="fa fa-linkedin"></i>
                </a>
              </li>
            )}
          </ul>
          <div className="employee-about">
            <h2>About</h2>
            <p>{this.props.bio}</p>
          </div>
        </div>
      </div>
    );
  }
}

class StudentProfileRate extends Component {
  constructor(props) {
    super(props);
  }

  skillSet = () => {};

  render() {
    return (
      <div className="right-block">
        <div className="edit-profile-box">
          <Link className="edit-btn" to={`/career/${this.props._id}`}>
            <i className="fa fa-external-link"></i> Task Details
          </Link>
        </div>

        <div className="profile-widget">
          <h2>Task Finished</h2>
          <span>{this.props.projectCount}</span>
        </div>

        <div className="profile-widget">
          <h2>Skills</h2>
          {/* <span>MS Office, Translating Front-End Programming</span> */}
          {this.props.skills.map(skill => (
            //   <Skill key={skill._id} name={skill.name}/>
            <span>{`${skill.name}, `}</span>
          ))}
        </div>

        <div className="profile-widget">
          <h2>Current Situation</h2>
          <span>{this.props.currentSituation}</span>
        </div>
      </div>
    );
  }
}

class EmployerProfileRate extends Component {
  constructor(props) {
    super(props);
  }

  skillSet = () => {};

  render() {
    return (
      <div className="right-block">
        <div className="edit-profile-box">
          <Link className="edit-btn" to={`/career/${this.props._id}`}>
            <i className="fa fa-external-link"></i> Task Details
          </Link>
        </div>

        <div className="profile-widget">
          <h2>Tasks Posted</h2>
          <span>{this.props.projectCount}</span>
        </div>

        <div className="profile-widget">
          <h2>field of work</h2>
          {/* <span>MS Office, Translating Front-End Programming</span> */}
          {this.props.fieldOfWork.map(skill => (
            //   <Skill key={skill._id} name={skill.name}/>
            <span>{`${skill.name}, `}</span>
          ))}
        </div>
      </div>
    );
  }
}
