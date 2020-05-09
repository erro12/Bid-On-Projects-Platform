import React, { Component } from "react";
import { Form, Button, Table } from "react-bootstrap";
import { adminInstance } from "../../../../axios/axiosconfig";
import { validateData } from "../../../../functions/functions";
import { NotificationManager } from "react-notifications";
import SidePanel from "../sidepanel/sidepanel";
// import "./editFAQEntity.css";
import "../../assets/editStyle.css";

class EditFAQEntity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      total: 1,
      index: 1,
      limit: 5,
      faqs: [],
      showDelete: false,
      showAdd: false,
      showPopup: false,
      showView: false,
      target: {},
      sortBy: "None",
      desc: false
    };
  }

  componentDidMount = () => {
    this.getfaqs();
  };

  componentDidUpdate() {
    if (this.state.loading) this.getfaqs();
  }

  nextPage = () => {
    console.log(this.state.total);
    console.log(this.state.limit);
    console.log(this.state.total / this.state.limit);
    if (
      !this.state.loading &&
      this.state.index < this.state.total / this.state.limit
    ) {
      this.setState({
        index: this.state.index + 1,
        loading: true
      });
    }
  };

  prevPage = () => {
    if (!this.state.loading && this.state.index > 1) {
      this.setState({
        index: this.state.index - 1,
        loading: true
      });
    }
  };

  toggleView = target => {
    this.setState({
      showView: !this.state.showView,
      target
    });
    this.getfaqs();
  };

  togglePopup = target => {
    this.setState({
      showPopup: !this.state.showPopup,
      target
    });
    this.getfaqs();
  };
  toggleDelete = d_id => {
    if (window.confirm("confirm delete faq ?")) {
      this.deletefaq(d_id._id);
    }
    // this.setState({
    //   showDelete: !this.state.showDelete,
    //   d_id
    // });
    this.getfaqs();
  };

  toggleAdd = () => {
    this.setState({
      showAdd: !this.state.showAdd
    });
    this.getfaqs();
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getfaqs = async () => {
    const { index, limit, sortBy, desc } = this.state;
    console.log("about to get faqs, ", sortBy);
    const response = await adminInstance.post("/getfaqs", {
      index,
      limit,
      sortBy,
      desc
    });
    console.log("got faqs, ", response.data);
    console.log("response,", response);
    if (response.data.code === 200) {
      const faqs = response.data.faqs;
      console.log("all faqs, ", faqs);
      this.setState({
        faqs,
        loading: false,
        total: response.data.total,
        sortBy: "None"
      });
    }
  };

  updatefaqs = async () => {
    console.log("state", this.state);
    const payload = {
      faqs: this.state.faqs
    };

    const isValid = validateData([payload.faqs]);
    if (isValid) {
      const response = await adminInstance.post("/updatefaqs", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  deletefaq = async d_id => {
    try {
      const response = await adminInstance.post("/deletefaqById", {
        _id: d_id
      });
      console.log(response.data);
      if (response.data.code === 200) {
        //notifi for deletion
        NotificationManager.success(response.data.msg, "Message", 4000);
        console.log("burnt, ", d_id);
      } else {
        //notifi for error
        NotificationManager.error(response.data.msg, "Message", 4000);
        console.log("error in backend");
      }
    } catch (err) {
      //notifi for err in frontend
      NotificationManager.error("Error in request", "Message", 4000);
      console.log("error in frontend");
    }
    // this.toggleDelete({});
  };

  addfaq = async faqData => {
    const isValid = validateData([faqData.ques, faqData.ans]);
    if (isValid) {
      try {
        const response = await adminInstance.post("/addfaq", faqData);
        if (response.data.code === 200) {
          //notifi for deletion
          NotificationManager.success(response.data.msg, "Message", 4000);
          console.log("created, ", faqData);
        } else {
          //notifi for error
          NotificationManager.error(response.data.msg, "Message", 4000);
          console.log("error in backend");
        }
      } catch (err) {
        //notifi for err in frontend
        console.log(err);
        NotificationManager.error("Error in request", "Message", 4000);
        console.log("error in frontend");
      }
      this.toggleAdd();
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  updatefaq = async faq => {
    console.log("no i wont!");
    console.log("state", this.state);
    const payload = {
      _id: faq._id,
      ques: faq.ques,
      ans: faq.ans
    };

    const isValid = validateData([payload._id, payload.ques, payload.ans]);
    if (isValid) {
      const response = await adminInstance.post("/updatefaq", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
        this.togglePopup();
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  tabRow() {
    // console.log("faqs, ", this.state.projects);
    return this.state.faqs.map(function(object, i) {
      return <TableRow obj={object} key={i} />;
    });
  }

  changeState = newState => {
    if (!this.state.loading) {
      console.log("changing, ", newState);
      this.setState({
        sortBy: newState.sortBy,
        desc: !this.state.desc,
        loading: true
      });
    }
  };

  render() {
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <SidePanel target="faqs" />
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>FAQs</h2>
                  <button class="btn btn-secondary" onClick={this.toggleAdd}>
                    Add FAQ
                  </button>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="dashboard-list-box margin-top-0">
                  <div className="dashboard-list-box-static">
                    <Table>
                      <thead>
                        <tr>
                          <th>
                            question{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "ques",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>
                            answer{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "ans",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.faqs.map((object, i) => (
                          <TableRow
                            obj={object}
                            key={i}
                            toggle={this.togglePopup}
                            delete={this.toggleDelete}
                            view={this.toggleView}
                          />
                        ))}
                      </tbody>
                    </Table>

                    {/* <Button
                      className="profile-btn"
                      onClick={this.updateProfile}
                    >
                      Save Changes
                    </Button> */}
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="pagination">
                  <span>
                    {" "}
                    {`Displaying Page ${this.state.index} of ${Math.ceil(
                      this.state.total / this.state.limit
                    )}`}{" "}
                  </span>
                  <i
                    class="fa fa-chevron-left"
                    aria-hidden="true"
                    onClick={this.prevPage}
                  ></i>{" "}
                  <i
                    class="fa fa-chevron-right"
                    aria-hidden="true"
                    onClick={this.nextPage}
                  ></i>{" "}
                  {this.state.loading && <b>Loading...</b>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {this.state.showPopup ? (
          <Popup
            target={this.state.target}
            closePopup={this.togglePopup.bind(this)}
            updatefaq={this.updatefaq}
          />
        ) : null}
        {this.state.showView ? (
          <ViewDetails
            target={this.state.target}
            closePopup={this.toggleView.bind(this)}
          />
        ) : null}
        {this.state.showAdd ? (
          <AddUp addfaq={this.addfaq} cancel={this.toggleAdd} />
        ) : null}
      </div>
    );
  }
}
export default EditFAQEntity;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ques: "",
      ans: "",
      _id: "",
      errmsg: ""
    };
  }

  componentWillMount() {
    const { target } = this.props;
    this.setState({
      ques: target.ques,
      ans: target.ans,
      _id: target._id
    });
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div className="form-title">
              <h2>Edit FAQ</h2>
            </div>
            <Form>
              <div className="row">
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="ques"
                      onChange={this.handleChange}
                      value={this.state.ques}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Answer</Form.Label>
                    <textarea
                      className="form-control"
                      placeholder=""
                      name="ans"
                      onChange={this.handleChange}
                      value={this.state.ans}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.updatefaq({
                      _id: this.state._id,
                      ques: this.state.ques,
                      ans: this.state.ans
                    });
                  }}
                >
                  Update FAQ
                </Button>
                <Button
                  className="cancle-btn"
                  onClick={() => {
                    this.props.closePopup();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

class AddUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ques: "",
      ans: "",
      errmsg: ""
    };
  }
  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div className="form-title">
              <h2>Add FAQ</h2>
            </div>
            <Form>
              <div className="row">
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Question</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="ques"
                      onChange={this.handleChange}
                      value={this.state.ques}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Answer</Form.Label>
                    <textarea
                      className="form-control"
                      type="text"
                      placeholder=""
                      name="ans"
                      onChange={this.handleChange}
                      value={this.state.ans}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.addfaq({
                      ques: this.state.ques,
                      ans: this.state.ans
                    });
                  }}
                >
                  Create FAQ
                </Button>
                <Button
                  className="cancle-btn"
                  onClick={() => {
                    this.props.cancel();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

class ViewDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      target: {}
    };
  }

  componentWillMount() {
    const { target } = this.props;
    this.setState({
      target
    });
  }
  render() {
    const { target } = this.state;
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div className="row">
              <div className="col-md-12">
                <Table>
                  <tr>
                    <th>Question</th>
                    <td>{target.ques}</td>
                  </tr>
                  <tr>
                    <th>Answer</th>
                    <td>{target.ans}</td>
                  </tr>
                </Table>
              </div>
            </div>
            <Button
              className="cancle-btn"
              onClick={() => {
                this.props.closePopup();
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

class TableRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <tr>
          <td>{this.props.obj.ques}</td>
          <td>{this.props.obj.ans}</td>
          <td>
            <i
              class="fa fa-eye"
              aria-hidden="true"
              onClick={() => {
                this.props.view(this.props.obj);
              }}
            ></i>
            {"     "}
            <i
              class="fa fa-pencil fa-fw"
              aria-hidden="true"
              onClick={() => {
                this.props.toggle(this.props.obj);
              }}
            ></i>
            {"     "}
            <i
              class="fa fa-trash"
              aria-hidden="true"
              onClick={() => {
                this.props.delete(this.props.obj);
              }}
            ></i>
          </td>
        </tr>
      </React.Fragment>
    );
  }
}
