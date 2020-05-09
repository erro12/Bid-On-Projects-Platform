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
import "../academic/academic.css";
import upload from "../../assets/images/upload.jpg";
import { Link } from "react-router-dom";
import { userInstance, studentInstance } from "../../axios/axiosconfig";
import { validateData } from "../../functions/functions";
import { NotificationManager } from "react-notifications";
import ProfileMenu from "../../components/profilemenu/menu";
import linkedin from "../../assets/images/linkedin.png";

import ReactDOM from "react-dom";
import ReactTags from "react-tag-autocomplete";

class AcademicProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: [],
      suggestions: [],
      studyYear: "",
      universityID: "",
      address: "",
      location: "",
      situation: "",
      additionalEmail: "",
      lrl: "",
      academicSubjects: "",
      fieldOfStudies: "",
      hourlyRate: "",
      previousExperience: "",
      public: true
    };
  }

  componentWillMount() {
    // this.setState({ isChecked: this.props.isChecked });
  }

  async componentDidMount() {
    await this.getacademics();
    console.log("after getting academics this.state, ", this.state);
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getacademics = async () => {
    const response = await studentInstance.post("/getacademics");
    // console.log(response)
    if (response.data.code === 200) {
      console.log("received response");
      const data = response.data;
      console.log("response data for academics data1234, ", data);
      console.log(
        "work preference, ",
        data.resData.profile_data.workPreference
      );
      let newTag = this.state.tags;
      if (data.resData.profile_data.workPreference.length > 0) {
        data.resData.profile_data.workPreference.forEach(skill => {
          newTag.push({ _id: skill._id, name: skill.name });
        });

        console.log("after loop, new tagset", newTag);
        //newSuggestion = this.state.suggestions.push(newTag);
        console.log(".....check suggestions in data.resData........");
      }

      const profileData = data.resData.profile_data;

      this.setState({
        tags: newTag,
        suggestions: data.resData.suggestions,
        universityID: profileData.universityID,
        studyYear: profileData.studyYear,
        situation: profileData.currentSituation,
        additionalEmail: profileData.secondaryemail,
        address: profileData.address,
        location: profileData.location,
        lrl: profileData.url,
        academicSubjects: profileData.academicSubjects,
        fieldOfStudies: profileData.fieldOfStudies,
        hourlyRate: profileData.hourlyRate,
        previousExperience: profileData.previousExperience,
        public: profileData.public
      });
      console.log("got in state after setState, ", this.state);
    }
  };

  updateacademics = async () => {
    console.log("when about to update db, state", this.state);
    let skills = [];
    this.state.tags.forEach(skill => {
      skills.push(skill._id);
    });
    console.log("skills, ", skills);

    const isValid =
      this.state.additionalEmail && this.state.additionalEmail.length > 0
        ? /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            this.state.additionalEmail
          )
        : true;
    if (isValid) {
      const payload = {
        data: {
          workPreference: skills,
          universityID: this.state.universityID,
          studyYear: this.state.studyYear,
          currentSituation: this.state.situation,
          secondaryemail: this.state.additionalEmail,
          location: this.state.location,
          address: this.state.address,
          url: this.state.lrl,
          academicSubjects: this.state.academicSubjects,
          fieldOfStudies: this.state.fieldOfStudies,
          hourlyRate: this.state.hourlyRate,
          previousExperience: this.state.previousExperience,
          public: this.state.public
        }
      };
      console.log("payload is, ", payload);

      const response = await studentInstance.post("/editacademics", payload);
      console.log("check server");
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Invalid secondary email", "Message", 4000);
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
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <ProfileMenu target="academic" />

          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>Academic Profile</h2>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="dashboard-list-box margin-top-0">
                  <div className="dashboard-list-box-static">
                    <div className="my-profile">
                      <div className="row">
                        <div className="col-lg-6 col-md-6">
                          <div className="form-group">
                            <label>University ID</label>
                            <input
                              value={this.state.universityID}
                              name="universityID"
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>

                          <div className="form-group">
                            <label>Year of Study</label>
                            <input
                              value={this.state.studyYear}
                              name="studyYear"
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>

                          <div className="form-group">
                            <label>Academic Subject</label>
                            <input
                              name="academicSubjects"
                              value={this.state.academicSubjects}
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>

                          <div className="form-group">
                            <label>Hourly Rate</label>
                            <input
                              name="hourlyRate"
                              value={this.state.hourlyRate}
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>

                          <div className="form-group">
                            <label>Previous Experience</label>
                            <input
                              name="previousExperience"
                              value={this.state.previousExperience}
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>

                          <div className="form-group">
                            <label>LinkedIn profile url</label>
                            <input
                              name="lrl"
                              class="form-control"
                              type="text"
                              value={this.state.lrl}
                              onChange={this.handleChange}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6">
                          <div className="form-group">
                            <label>Skills</label>
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
                            <label>Location</label>
                            <input
                              name="location"
                              value={this.state.location}
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>

                          <div className="form-group">
                            <label>Field of Studies</label>
                            <input
                              name="fieldOfStudies"
                              value={this.state.fieldOfStudies}
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>

                          {/* <div className="form-group">
                                                <label>Current Situation</label>
                                                <input  name="email"  class="form-control" type="text"/>
                                            </div> */}

                          <div className="form-group">
                            <label>Current Situation</label>
                            <Form.Control
                              as="select"
                              value={this.state.situation}
                              onChange={e =>
                                this.setState({ situation: e.target.value })
                              }
                            >
                              <option>Graduated</option>
                              <option>Undergraduate</option>
                            </Form.Control>
                          </div>

                          <div className="form-group">
                            <label>Additional Email</label>
                            <input
                              value={this.state.additionalEmail}
                              name="additionalEmail"
                              onChange={this.handleChange}
                              class="form-control"
                              type="text"
                            />
                          </div>
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <div className="form-group">
                            <label>Student Address (European University)</label>
                            <textarea
                              name="address"
                              value={this.state.address}
                              onChange={this.handleChange}
                              id="notes"
                              class="form-control"
                            >
                              Message
                            </textarea>
                          </div>
                        </div>

                        <div className="col-lg-6 col-md-6">
                          {/* <div className="form-group verification">
                            <h3>Verification</h3>
                            <label>Connect with</label>{" "}
                            <img src={linkedin} alt="Linkedin" />
                          </div> */}
                        </div>

                        <div className="col-lg-6 col-md-6">
                          <div className="form-group public-profile">
                            <label>Public Profile</label>
                            <label>
                              <input
                                ref="switch"
                                checked={this.state.public}
                                onChange={e =>
                                  this.setState({ public: e.target.checked })
                                }
                                className="switch"
                                type="checkbox"
                              />
                              <div>
                                <div></div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button
                          className="profile-btn"
                          onClick={this.updateacademics}
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
        </div>
      </div>
    );
  }
}
export default AcademicProfile;
