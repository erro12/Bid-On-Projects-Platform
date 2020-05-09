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
import "./profile.css";
import employee from "../../../assets/images/employe.jpg";
import { Link } from "react-router-dom";
import history from "../../../history";
import { userInstance } from "../../../axios/axiosconfig";
import { isemployer } from "../../../functions/functions";
import { NotificationManager } from "react-notifications";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      photo: "",
      email: "",
      bio: "",
      skills: [],
      currentSituation: "",
      projectCount: 0,
      address: "",
      location: "",
      url: ""
    };
  }

  componentDidMount = () => {
    this.getProfileData();
  };

  getProfileData = async () => {
    const response = await userInstance.post("/getprofile");
    console.log(response);
    if (response.data.code === 200) {
      const data = response.data.profile_data;
      this.setState({
        name: data.fname + " " + data.lname,
        email: data.email,
        bio: data.bio,
        photo: data.photo,
        skills: data.workPreference,
        currentSituation: data.currentSituation,
        projectCount: response.data.projectCount,
        address: data.address,
        location: data.location,
        url: data.url
      });
    }
  };

  render() {
    return (
      <div className="employer-section">
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
                <ProfileRate
                  projectCount={this.state.projectCount}
                  currentSituation={this.state.currentSituation}
                  skills={this.state.skills}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Profile;

class ProfileDetail extends Component {
  render() {
    return (
      <div className="left-block">
        <div className="employee-info">
          <div className="employee-pic">
            <img src={"http://3.133.60.237:3001/" + this.props.photo} alt="" />
          </div>
          <h2>{this.props.name}</h2>
          {/* <span>{this.props.email}</span> */}
          <span className="location">
            <i className="fa fa-map-marker"></i> {this.props.location}
          </span>
          <ul className="contact-icons">
            <li>
              {/* <Link className="c-icon" to={"/student/profile"}> */}
              <i className="fa fa-user fa-2x"></i>
              {/* </Link> */}
            </li>
            {this.props.payment && (
              <li>
                {/* <Link className="c-icon" to={"/student/profile"}> */}
                <i className="fa fa-credit-card fa-2x"></i>
                {/* </Link> */}
              </li>
            )}

            <li>
              {/* <Link className="c-icon" to={"/student/profile"}> */}
              <i className="fa fa-envelope fa-2x"></i>
              {/* </Link> */}
            </li>
            {this.props.url && (
              <li>
                <a className="c-icon" href={this.props.url} target="_blank">
                  <i className="fa fa-linkedin"></i>
                </a>
              </li>
            )}
          </ul>
          <div className="employee-about">
            <h2>About Me</h2>
            <p>{this.props.bio}</p>
          </div>
        </div>
      </div>
    );
  }
}

class ProfileRate extends Component {
  render() {
    return (
      <div className="right-block">
        <div className="edit-profile-box">
          <Link className="edit-btn" to={"/editprofile"}>
            <i className="fa fa-edit"></i> Edit Profile
          </Link>
        </div>

        <div className="profile-widget">
          <h2>Task Finished</h2>
          <span>{this.props.projectCount}</span>
        </div>

        <div className="profile-widget">
          <h2>Skills</h2>
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

function Skill(props) {
  return <span>`${props.name}, `</span>;
}
