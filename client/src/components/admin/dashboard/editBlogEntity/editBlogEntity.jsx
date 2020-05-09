import React, { Component } from "react";
import { Form, Button, Table } from "react-bootstrap";
import { adminInstance } from "../../../../axios/axiosconfig";
import { validateData, formatDate } from "../../../../functions/functions";
import { NotificationManager } from "react-notifications";
import SidePanel from "../sidepanel/sidepanel";
// import "./editBlogEntity.css";
import "../../assets/editStyle.css";

class EditBlogEntity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      total: 1,
      index: 1,
      limit: 20,
      blogs: [],
      showDelete: false,
      showView: false,
      showAdd: false,
      showPopup: false,
      target: {},
      sortBy: "None",
      desc: false
    };
  }

  componentDidMount = () => {
    this.getblogs();
  };

  componentDidUpdate() {
    if (this.state.loading) this.getblogs();
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
    this.getblogs();
  };

  togglePopup = target => {
    this.setState({
      showPopup: !this.state.showPopup,
      target
    });
    this.getblogs();
  };
  toggleDelete = d_id => {
    if(window.confirm("comfirm delete blog ?")){
      this.deleteblog(d_id._id)
    }
    // this.setState({
    //   showDelete: !this.state.showDelete,
    //   d_id
    // });
    this.getblogs();
  };

  toggleAdd = () => {
    this.setState({
      showAdd: !this.state.showAdd
    });
    this.getblogs();
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  getblogs = async () => {
    const { index, limit, sortBy, desc } = this.state;
    console.log("about to get blogs");
    const response = await adminInstance.post("/getblogs", {
      index,
      limit,
      sortBy,
      desc
    });
    console.log("got blogs, ", response.data);
    console.log("response,", response);
    if (response.data.code === 200) {
      const blogs = response.data.blogs;
      console.log("all blogs, ", blogs);
      this.setState({
        blogs,
        loading: false,
        total: response.data.total,
        sortBy: "None"
      });
    }
  };

  updateblogs = async () => {
    console.log("state", this.state);
    const payload = {
      blogs: this.state.blogs
    };

    const isValid = validateData([payload.blogs]);
    if (isValid) {
      const response = await adminInstance.post("/updateblogs", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  deleteblog = async d_id => {
    try {
      const response = await adminInstance.post("/deleteblogById", {
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

  addblog = async blogData => {
    const isValid = validateData([
      blogData.title,
      blogData.summary,
      blogData.content,
      blogData.date
    ]);
    if (isValid) {
      try {
        const response = await adminInstance.post("/addblog", blogData);
        if (response.data.code === 200) {
          //notifi for deletion
          NotificationManager.success(response.data.msg, "Message", 4000);
          console.log("created, ", blogData);
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

  updateblog = async blog => {
    console.log("no i wont!");
    console.log("state", this.state);
    const payload = {
      _id: blog._id,
      title: blog.title,
      date: blog.date,
      summary: blog.summary,
      content: blog.content
    };

    const isValid = validateData([
      payload._id,
      payload.title,
      payload.date,
      payload.summary,
      payload.content
    ]);
    if (isValid) {
      const response = await adminInstance.post("/updateblog", payload);
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
    // console.log("blogs, ", this.state.projects);
    return this.state.blogs.map(function(object, i) {
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
          <SidePanel target="blogs" />
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>Blogs</h2>
                  <button
                    type="button"
                    class="btn btn-secondary"
                    onClick={this.toggleAdd}
                  >
                    Add Blog
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
                            title{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "title",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>
                            date{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "date",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.blogs.map((object, i) => (
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
            updateblog={this.updateblog}
          />
        ) : null}
        {this.state.showView ? (
          <ViewDetails
            target={this.state.target}
            closePopup={this.toggleView.bind(this)}
          />
        ) : null}
        {this.state.showAdd ? (
          <AddUp addblog={this.addblog} cancel={this.toggleAdd} />
        ) : null}
      </div>
    );
  }
}
export default EditBlogEntity;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      date: "",
      summary: "",
      content: "",
      _id: "",
      errmsg: ""
    };
  }

  componentWillMount() {
    const { target } = this.props;
    this.setState({
      title: target.title,
      date: target.date,
      content: target.content,
      summary: target.summary,
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
              <h2>Edit Blog</h2>
            </div>

            <Form>
              <div className="row">
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="title"
                      onChange={this.handleChange}
                      value={this.state.title}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Summary</Form.Label>
                    <textarea
                      className="form-control"
                      placeholder=""
                      name="summary"
                      onChange={this.handleChange}
                      value={this.state.summary}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Content</Form.Label>
                    <textarea
                      className="form-control"
                      placeholder=""
                      name="content"
                      onChange={this.handleChange}
                      value={this.state.content}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.updateblog({
                      _id: this.state._id,
                      title: this.state.title,
                      date: this.state.date,
                      summary: this.state.summary,
                      content: this.state.content
                    });
                  }}
                >
                  Update Blog
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
                    <th>Title</th>
                    <td>{target.title}</td>
                  </tr>
                  <tr>
                    <th>Summary</th>
                    <td>{target.summary}</td>
                  </tr>
                  <tr>
                    <th>Content</th>
                    <td>{target.content}</td>
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

class AddUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      date: new Date().toISOString(),
      summary: "",
      content: "",
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
                <h2>Add Blog</h2>
            </div>
            <Form>
              <div className="row">
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="title"
                      onChange={this.handleChange}
                      value={this.state.title}
                    />
                  </Form.Group>
                  </div>

                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Summary</Form.Label>
                    <textarea className="form-control" 
                      placeholder=""
                      name="summary"
                      onChange={this.handleChange}
                      value={this.state.summary}
                    />
                  </Form.Group>
                  </div>

                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Content</Form.Label>
                    <textarea className="form-control" 
                      placeholder=""
                      name="content"
                      onChange={this.handleChange}
                      value={this.state.content}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.addblog({
                      title: this.state.title,
                      summary: this.state.summary,
                      content: this.state.content,
                      date: this.state.date
                    });
                  }}
                >
                  Create Blog
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

class TableRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <tr>
          <td>{this.props.obj.title}</td>
          <td>{formatDate(this.props.obj.date)}</td>
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
