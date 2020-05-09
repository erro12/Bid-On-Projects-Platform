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
import { validateData } from "../../../functions/functions";
import { NotificationManager } from "react-notifications";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      photo: "",
      email: "",
      bio: "",
      fieldOfWork: [],
      address: "",
      projectCount: 0,
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
      // let tags = ''
      // data.workPreference.forEach(el=>{
      //     tags+=el.name+', '
      // })
      console.log("field of work, ", data.workPreference);
      this.setState({
        name: data.fname + " " + data.lname,
        email: data.email,
        bio: data.bio,
        photo: data.photo,
        fieldOfWork: data.workPreference,
        address: data.address,
        projectCount: response.data.projectCount,
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
                  fieldOfWork={this.state.fieldOfWork}
                  projectCount={this.state.projectCount}
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
            <i className="fa fa-map-marker"></i> {this.props.address}
          </span>
          <ul className="contact-icons">
            <li>
              {/* <Link className="c-icon" to={"/employer/profile"}> */}
              <i className="fa fa-user fa-2x"></i>
              {/* </Link> */}
            </li>
            {this.props.payment && (
              <li>
                {/* <Link className="c-icon" to={"/employer/profile"}> */}
                <i className="fa fa-credit-card fa-2x"></i>
                {/* </Link> */}
              </li>
            )}
            <li>
              {/* <Link className="c-icon" to={"/employer/profile"}> */}
              <i className="fa fa-envelope fa-2x"></i>
              {/* </Link> */}
            </li>

            {this.props.url && (
              <li>
                <a className="c-icon" href={this.props.url} target="_blank">
                  <i className="fa fa-globe"></i>
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
          <h2>Tasks Posted</h2>
          <span>{this.props.projectCount}</span>
        </div>

        <div className="profile-widget">
          <h2>Field of work</h2>
          {this.props.fieldOfWork.map(skill => (
            //   <Skill key={skill._id} name={skill.name}/>
            <span>{`${skill.name}, `}</span>
          ))}{" "}
        </div>

        {/* <div className="profile-widget">
                  <h2>Current Situation</h2>
                  <span>Graduaded</span>
                </div> */}
      </div>
    );
  }
}
