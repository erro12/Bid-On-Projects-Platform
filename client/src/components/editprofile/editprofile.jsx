import React, { Component } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Tabs,
  Tab,
  ProgressBar
} from "react-bootstrap";
import "../editprofile/editprofile.css";
import upload from "../../assets/images/upload.jpg";
import { Link } from "react-router-dom";
import ReactTags from "react-tag-autocomplete";
import {
  userInstance,
  employerInstance,
  studentInstance
} from "../../axios/axiosconfig";
import {
  validateData,
  isemployer,
  deleteFileFromServer,
  isauth,
  isadminAuth
} from "../../functions/functions";
import { NotificationManager } from "react-notifications";
import ProfileMenu from "../../components/profilemenu/menu";

class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: true,
      fname: "",
      lname: "",
      email: "",
      phone: "",
      bio: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      secondaryemail: "",
      address: "",
      tags: [],
      suggestions: [],
      // imgName: "",
      // imgFull: [],
      photo: "",
      url: "",
      progress: 0,
      showOPProgress: false,
      showCLProgress: false,
      showDProgress: false,
      showDVProgress: false,
      showOVProgress: false
    };
    this.pref = React.createRef();
    this.vref = React.createRef();
    this.lref = React.createRef();
    this.opref = React.createRef();
    this.ovref = React.createRef();
  }

  getImgName = () => {
    console.log("ref", this.pref.current.files);
  };

  componentWillMount() {
    if (!(isauth() && !isadminAuth())) {
      this.setState({ auth: false });
      this.props.history.push("/login");
    } else if (isadminAuth()) {
      this.setState({ auth: false });
      this.props.history.push("/admin");
    }
  }

  componentDidMount = () => {
    if (this.state.auth) this.getProfileData();
    console.log("daddxgacvg", this.pref.current);
  };

  setOPProgress = bool => {
    this.setState({
      showOPProgress: bool,
      progress: 0
    });
  };

  setOVProgress = bool => {
    this.setState({
      showOVProgress: bool,
      progress: 0
    });
  };

  setCLProgress = bool => {
    this.setState({
      showCLProgress: bool,
      progress: 0
    });
  };

  setDPProgress = bool => {
    this.setState({
      showDPProgress: bool,
      progress: 0
    });
  };

  setDVProgress = bool => {
    this.setState({
      showDVProgress: bool,
      progress: 0
    });
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  //     isemployer = ()=>{

  //         const ca = document.cookie.split(';');
  //         for(let i=0; i< ca.length; i++){
  //         var c = ca[i];
  //         while (c.charAt(0) == ' ') {
  //         c = c.substring(1);
  //         }
  //         if(c.indexOf('isemployer') == 0){
  //             console.log('found cookie, ', c);
  //             let emp =  c.substring('isemployer', c.length).split('=')[1] == 'true'
  //             console.log(emp, " and ")
  //             return emp
  //         }}
  //         return false;

  // }

  getProfileData = async () => {
    let response = null;
    if (isemployer()) {
      console.log("yep");
      response = await employerInstance.post("/getusername");
      let newTag = this.state.tags;
      if (response.data.profile_data.workPreference.length > 0) {
        await response.data.profile_data.workPreference.forEach(skill => {
          newTag.push({ _id: skill._id, name: skill.name });
        });

        console.log("after loop, new tagset", newTag);
        //newSuggestion = this.state.suggestions.push(newTag);
        console.log(".....check suggestions in data.resData........");
      }

      this.state.tags = newTag;
      this.state.suggestions = response.data.suggestions;
      this.state.url = response.data.url;
    } else response = await studentInstance.post("/getprofile");
    console.log(response);
    if (response.data.code === 200) {
      const data = response.data.profile_data;
      console.log("ddaaaaaaattaaaaa, ", data);
      console.log("url, ", this.state.url);
      this.setState({
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        photo: data.photo,
        secondaryemail: data.secondaryemail,
        address: data.address,
        url: data.url
        // isemployer: this.isemployer()
      });
      console.log(this.state);
    }
  };

  updateProfile = async () => {
    let skills = [];
    this.state.tags.forEach(skill => {
      skills.push(skill._id);
    });
    console.log("skills, ", skills);
    console.log("state", this.state);
    let payload = {};
    if (isemployer()) {
      payload = {
        data: {
          phone: this.state.phone,
          bio: this.state.bio,
          secondaryemail: this.state.secondaryemail,
          address: this.state.address,
          workPreference: skills,
          url: this.state.url
        }
      };
    } else {
      payload = {
        data: {
          phone: this.state.phone,
          bio: this.state.bio
          // secondaryemail: this.secondaryemail,
          // address: this.state.address,
        }
      };
    }

    // const isValid = validateData([payload.data.phone]);
    if (true) {
      if (
        payload.data.secondaryemail &&
        !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          payload.data.secondaryemail
        )
      ) {
        NotificationManager.error("Invalid secondary email", "Message", 4000);
      } else {
        if (
          payload.data.phone &&
          !/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(
            payload.data.phone
          )
        ) {
          NotificationManager.error("Invalid phone number", "Message", 4000);
        } else {
          const response = await userInstance.post("/editprofile", payload);
          if (response.data.code === 200) {
            NotificationManager.success(response.data.msg, "Message", 4000);
          } else {
            NotificationManager.error(response.data.msg, "Message", 4000);
          }
        }
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  changePassword = async () => {
    const payload = {
      currentPassword: this.state.currentPassword,
      newPassword: this.state.newPassword
    };
    const isValid = validateData([
      payload.currentPassword,
      payload.newPassword,
      this.state.confirmPassword
    ]);
    if (isValid) {
      if (payload.newPassword === this.state.confirmPassword) {
        const response = await studentInstance.post("/changepassword", payload);
        if (response.data.code === 200) {
          this.setState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          NotificationManager.success(response.data.msg, "Message", 4000);
        } else {
          NotificationManager.error(response.data.msg, "Message", 4000);
        }
      } else {
        NotificationManager.error("Passwords do not match!", "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  //i--> 0=img, 1=video;  j--> 0=student, 1=employer
  uploadss = async (img, i, j) => {
    console.log("before reset", document.getElementById("ov"));
    // let oldInput = document.getElementById("ov");
    // oldInput.parentNode.replaceChild(oldInput.cloneNode(), oldInput);
    // console.log(document.getElementById("ov"));

    console.log("i,j ", i, j);
    if (i == 0) {
      this.uploadimg(img, j);
    } else {
      this.uploadvideo(img, j);
    }
  };

  uploadvideo = async (img, j) => {
    console.log("video, ", img);

    console.log("0 index", img.current.files[0]);
    const isValid = validateData([img.current.files[0]]);
    if (isValid) {
      console.log("valid");
      const data = new FormData();
      data.append("file", img.current.files[0]);

      const size = img.current.files[0].size;
      console.log("total video size, ", size);
      this.setOVProgress(true);
      this.setDVProgress(true);
      const config = {
        onUploadProgress: async progressEvent => {
          this.setState({
            progress: await Math.floor((progressEvent.loaded * 100) / size)
          });
        }, // TO SHOW UPLOAD STATUS
        headers: {
          "content-type": "multipart/form-data"
        }
      };

      console.log("data, ", data);
      console.log("knocking backend");
      let imageData = null;
      if (j == 0) {
        imageData = await studentInstance.post(
          "/uploadprofilevideo",
          data,
          config
        );
      } else {
        imageData = await employerInstance.post(
          "/uploadofficevideos",
          data,
          config
        );
      }
      // let oldInput = document.getElementById("ov");
      // oldInput.parentNode.replaceChild(oldInput.cloneNode(), oldInput);
      // console.log('value of old input, ', oldInput.value)
      // oldInput.value = "";
      // console.log('value now, ', document.getElementById("ov").value)
      console.log("image after response", imageData);
      this.setOVProgress(false);
      this.setDVProgress(false);
      this.getProfileData();
      if (imageData.data.code === 200) {
        NotificationManager.success(imageData.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(imageData.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Please upload profile image", "Message", 4000);
    }
  };

  uploadimg = async (img, j) => {
    console.log("img", img);

    console.log("0 index", img.current.files[0]);
    const isValid = validateData([img.current.files[0]]);
    if (isValid) {
      console.log("valid");
      const data = new FormData();
      data.append("file", img.current.files[0]);

      const size = img.current.files[0].size;
      this.setOPProgress(true);
      const config = {
        onUploadProgress: async progressEvent => {
          this.setState({
            progress: await Math.floor((progressEvent.loaded * 100) / size)
          });
        }, // TO SHOW UPLOAD STATUS
        headers: {
          "content-type": "multipart/form-data"
        }
      };

      console.log("data, ", data);
      console.log("knocking backend");
      let imageData = null;
      if (j == 0) {
        imageData = await studentInstance.post(
          "/uploadprofileimg",
          data,
          config
        );
      } else {
        imageData = await employerInstance.post(
          "/uploadofficeimgs",
          data,
          config
        );
      }
      this.setOPProgress(false);
      console.log("image after response", imageData);
      this.getProfileData();
      if (imageData.data.code === 200) {
        NotificationManager.success(imageData.data.msg, "Message", 4000);
        deleteFileFromServer(this.state.photo);
        this.props.refreshHeader();
      } else {
        NotificationManager.error(imageData.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Please upload profile image", "Message", 4000);
    }
  };

  uploadLogo = async img => {
    console.log("img", img);

    console.log("0 index", img.current.files[0]);
    const isValid = validateData([img.current.files[0]]);
    if (isValid) {
      console.log("valid");
      const data = new FormData();
      data.append("file", img.current.files[0]);

      const size = img.current.files[0].size;
      this.setCLProgress(true);
      const config = {
        onUploadProgress: async progressEvent => {
          this.setState({
            progress: await Math.floor((progressEvent.loaded * 100) / size)
          });
        }, // TO SHOW UPLOAD STATUS
        headers: {
          "content-type": "multipart/form-data"
        }
      };

      console.log("data, ", data);
      console.log("knocking backend");
      console.log("here");
      const imageData = await employerInstance.post(
        "/uploadofficelogo",
        data,
        config
      );
      console.log("image after response", imageData);
      this.getProfileData();
      if (imageData.data.code === 200) {
        NotificationManager.success(imageData.data.msg, "Message", 4000);
        this.props.refreshHeader();
      } else {
        NotificationManager.error(imageData.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Please upload profile image", "Message", 4000);
    }
  };

  async handleDelete(i) {
    const tags = this.state.tags.slice(0);
    console.log("before delete, ", tags);
    // console.log('what i???, anywaYS i= ', i)
    tags.splice(i, 1);
    this.setState({ tags });
    console.log("after delete, ", this.state.tags);
  }

  handleAddition(tag) {
    const tags = [].concat(this.state.tags, tag);
    this.setState({ tags });
  }

  handleDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  render() {
    {
      if (this.state.auth) {
        if (!isemployer()) {
          return (
            <div className="edite-profile-section">
              <div className="edit-container">
                <ProfileMenu target="profile" />

                <div className="dashboard-content">
                  <div id="titlebar">
                    <div className="row">
                      <div className="col-md-12">
                        <h2>My Profile</h2>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-md-12">
                      <div className="dashboard-list-box margin-top-0">
                        <h4 className="gray">Profile Details</h4>
                        <div className="dashboard-list-box-static">
                          <div className="edit-profile-photo">
                            <img
                              src={
                                "http://3.133.60.237:3001/" + this.state.photo
                              }
                              alt=""
                            />
                            <div className="change-photo-btn">
                              <div className="photoUpload">
                                <span>
                                  <i className="fa fa-upload"></i> Upload Photo
                                </span>
                                <input
                                  type="file"
                                  className="upload"
                                  onChange={this.uploadss.bind(
                                    this,
                                    this.pref,
                                    0,
                                    0
                                  )}
                                  ref={this.pref}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="my-profile">
                            <div className="form-group">
                              <label>Upload Video</label>
                              <div className="videoUpload">
                                <span>
                                  <i className="fa fa-upload"></i> Upload
                                </span>
                                {this.state.showDVProgress && <input
                                  type="file"
                                  className="upload"
                                  onChange={this.uploadss.bind(
                                    this,
                                    this.vref,
                                    1,
                                    0
                                  )}
                                  ref={this.vref}
                                />}
                              </div>
                              {this.state.showDVProgress && (
                              <ProgressBar
                                animated
                                now={this.state.progress}
                                label={`${this.state.progress}%`}
                              />
                            )}
                            </div>

                            <div className="form-group">
                              <label>First Name</label>
                              <input
                                readOnly
                                value={this.state.fname}
                                name="fname"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                              <a>contact support</a> to change
                            </div>

                            <div className="form-group">
                              <label>Last Name</label>
                              <input
                                readOnly
                                value={this.state.lname}
                                name="lname"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                              <a>contact support</a> to change
                            </div>

                            <div className="form-group">
                              <label>Phone</label>
                              <input
                                value={this.state.phone}
                                name="phone"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                            </div>

                            <div className="form-group">
                              <label>Email</label>
                              <input
                                readOnly
                                value={this.state.email}
                                name="email"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                            </div>

                            <div className="form-group">
                              <label>Bio</label>
                              <textarea
                                name="bio"
                                id="notes"
                                value={this.state.bio}
                                onChange={this.handleChange}
                                class="form-control"
                              >
                                Message
                              </textarea>
                            </div>
                          </div>

                          <Button
                            className="profile-btn"
                            onClick={this.updateProfile}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6 col-md-12">
                      <div className="dashboard-list-box margin-top-0">
                        <h4 className="gray">Change Password</h4>
                        <div className="dashboard-list-box-static">
                          <div className="my-profile">
                            <div className="form-group">
                              <label className="margin-top-0">
                                Current Password
                              </label>
                              <input
                                class="form-control"
                                name="currentPassword"
                                value={this.state.currentPassword}
                                onChange={this.handleChange}
                                type="password"
                              />
                            </div>

                            <div className="form-group">
                              <label>New Password</label>
                              <input
                                class="form-control"
                                name="newPassword"
                                value={this.state.newPassword}
                                onChange={this.handleChange}
                                type="password"
                              />
                            </div>

                            <div className="form-group">
                              <label>Confirm New Password</label>
                              <input
                                class="form-control"
                                name="confirmPassword"
                                value={this.state.confirmPassword}
                                onChange={this.handleChange}
                                type="password"
                              />
                            </div>

                            <Button
                              className="profile-btn"
                              onClick={this.changePassword}
                            >
                              Change Password
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="edite-profile-section">
              <div className="edit-container">
                <ProfileMenu target="profile" />

                <div className="dashboard-content">
                  <div id="titlebar">
                    <div className="row">
                      <div className="col-md-12">
                        <h2>My Profile</h2>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-md-12">
                      <div className="dashboard-list-box margin-top-0">
                        <div className="dashboard-list-box-static">
                          <div className="my-profile">
                            <div className="form-group">
                              <label>First Name</label>
                              <input
                                readOnly
                                value={this.state.fname}
                                name="fname"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                              <a>contact support</a> to change
                            </div>

                            <div className="form-group">
                              <label>Last Name</label>
                              <input
                                readOnly
                                value={this.state.lname}
                                name="lname"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                              <a>contact support</a> to change
                            </div>

                            <div className="form-group">
                              <label>Email</label>
                              <input
                                readOnly
                                value={this.state.email}
                                name="email"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                            </div>

                            <div className="form-group">
                              <label>Secondary Email</label>
                              <input
                                value={this.state.secondaryemail}
                                name="secondaryemail"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                            </div>

                            <div className="form-group">
                              <label>Contact Information</label>
                              <input
                                value={this.state.phone}
                                name="phone"
                                onChange={this.handleChange}
                                class="form-control"
                                type="text"
                              />
                            </div>

                            <div className="form-group">
                              <label>Company info/Intro</label>
                              <textarea
                                name="bio"
                                id="notes"
                                value={this.state.bio}
                                onChange={this.handleChange}
                                class="form-control"
                              >
                                Message
                              </textarea>
                            </div>
                          </div>

                          {/* may split from here to merge into one */}
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6 col-md-12">
                      <div className="dashboard-list-box margin-top-0">
                        <div className="dashboard-list-box-static">
                          <div className="form-group">
                            <label>Upload Company Logo</label>
                            <div className="videoUpload">
                              <span style={{ float: "right" }}>
                                <i className="fa fa-upload"></i> Upload
                              </span>
                              <input
                                type="file"
                                className="upload"
                                onChange={this.uploadLogo.bind(this, this.lref)}
                                ref={this.lref}
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Upload photos of Office</label>
                            <div className="videoUpload">
                              <span style={{ float: "right" }}>
                                <i className="fa fa-upload"></i> Upload
                              </span>
                              {!this.state.showOPProgress && <input
                                id="ov"
                                type="file"
                                className="upload"
                                onChange={this.uploadss.bind(
                                  this,
                                  this.opref,
                                  0,
                                  1
                                )}
                                ref={this.opref}
                              />}
                            </div>
                            {this.state.showOPProgress && (
                              <ProgressBar
                                animated
                                now={this.state.progress}
                                label={`${this.state.progress}%`}
                              />
                            )}
                          </div>

                          <div className="form-group">
                            <label>Upload Videos of Office</label>
                            <div className="videoUpload">
                              <span style={{ float: "right" }}>
                                <i className="fa fa-upload"></i> Upload
                              </span>
                              {!this.state.showOVProgress && <input
                                type="file"
                                className="upload"
                                onChange={this.uploadss.bind(
                                  this,
                                  this.ovref,
                                  1,
                                  1
                                )}
                                ref={this.ovref}
                              />}
                            </div>
                            {this.state.showOVProgress && (
                              <ProgressBar
                                animated
                                now={this.state.progress}
                                label={`${this.state.progress}%`}
                              />
                            )}
                          </div>

                          {/* <div className="form-group">
                                                    <label>Field of Work</label>
                                                    <input value={this.state.workPreference} name="workPreference" onChange={this.handleChange} class="form-control" type="text"/>
                                                </div> */}

                          <div className="form-group">
                            <label>Field of Work</label>
                            {/* <input  name="fname" class="form-control" type="text"/> */}
                            <ReactTags
                              name="fname"
                              class="form-control"
                              tags={this.state.tags}
                              suggestions={this.state.suggestions}
                              handleDelete={this.handleDelete.bind(this)}
                              handleAddition={this.handleAddition.bind(this)}
                            />
                          </div>

                          <div className="form-group">
                            <label>Address</label>
                            <input
                              value={this.state.address}
                              name="address"
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>

                          <div className="form-group">
                            <label>Company website url</label>
                            <input
                              value={this.state.url}
                              name="url"
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group col-md-12">
                          <Button
                            className="profile-btn"
                            onClick={this.updateProfile}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      } else {
        return null;
      }
    }
  }
}
export default EditProfile;
