import React, { Component } from "react";
import { Form, Button, Table } from "react-bootstrap";
import { adminInstance } from "../../../../axios/axiosconfig";
import { validateData } from "../../../../functions/functions";
import { NotificationManager } from "react-notifications";
import SidePanel from "../sidepanel/sidepanel";
// import "./editTagEntity.css";
import "../../assets/editStyle.css";


class EditTagEntity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      total: 1,
      index: 1,
      limit: 5,
      tags: [],
      showDelete: false,
      showAdd: false,
      showPopup: false,
      target: {},
      sortBy: "None",
      desc: false
    };
  }

  componentDidMount = () => {
    this.gettags();
  };

  componentDidUpdate() {
    if (this.state.loading) this.gettags();
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

  togglePopup = target => {
    this.setState({
      showPopup: !this.state.showPopup,
      target
    });
    this.gettags();
  };
  toggleDelete = d_id => {
    this.setState({
      showDelete: !this.state.showDelete,
      d_id
    });
    this.gettags();
  };

  toggleAdd = () => {
    this.setState({
      showAdd: !this.state.showAdd
    });
    this.gettags();
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  gettags = async () => {
    const { index, limit, sortBy, desc } = this.state;
    console.log("about to get tags");
    const response = await adminInstance.post("/gettags", {
      index,
      limit,
      sortBy,
      desc
    });
    console.log("got tags, ", response.data);
    console.log("response,", response);
    if (response.data.code === 200) {
      const tags = response.data.tags;
      console.log("all tags, ", tags);
      this.setState({
        tags,
        loading: false,
        total: response.data.total,
        sortBy: "None"
      });
    }
  };

  updatetags = async () => {
    console.log("state", this.state);
    const payload = {
      tags: this.state.tags
    };

    const isValid = validateData([payload.tags]);
    if (isValid) {
      const response = await adminInstance.post("/updatetags", payload);
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, "Message", 4000);
      } else {
        NotificationManager.error(response.data.msg, "Message", 4000);
      }
    } else {
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  deletetag = async d_id => {
    try {
      const response = await adminInstance.post("/deletetagById", {
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
    this.toggleDelete({});
  };

  addtag = async tagData => {
    if(tagData.name){
      try {
        const response = await adminInstance.post("/addtag", tagData);
        if (response.data.code === 200) {
          //notifi for deletion
          NotificationManager.success(response.data.msg, "Message", 4000);
          console.log("created, ", tagData);
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
      this.toggleAdd();
    }else{
      NotificationManager.error("Some fields are empty", "Message", 4000);
    }
  };

  updatetag = async tag => {
    console.log("no i wont!");
    console.log("state", this.state);
    const payload = {
      _id: tag._id,
      name: tag.name
    };

    const isValid = validateData([payload._id, payload.name]);
    if (isValid) {
      const response = await adminInstance.post("/updatetag", payload);
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
    // console.log("tags, ", this.state.projects);
    return this.state.tags.map(function(object, i) {
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
          <SidePanel target="tags"/>
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>Tags</h2>
                  <button type="button" class="btn btn-secondary" onClick={this.toggleAdd}>
                    Add Tag
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
                            tag Name{" "}
                            <i
                              class="fa fa-sort"
                              aria-hidden="true"
                              onClick={() => {
                                this.changeState({
                                  sortBy: "name",
                                  desc: !this.state.desc
                                });
                              }}
                            ></i>
                          </th>
                          <th>actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.tags.map((object, i) => (
                          <TableRow
                            obj={object}
                            key={i}
                            toggle={this.togglePopup}
                            delete={this.toggleDelete}
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
                   <span> {`Displaying Page ${this.state.index} of ${Math.ceil(
                      this.state.total / this.state.limit
                    )}`}{" "}</span>
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
                      updatetag={this.updatetag}
                    />
                  ) : null}
                  {this.state.showDelete ? (
                    <DeleteUp
                      d_id={this.state.d_id}
                      deletetag={this.deletetag}
                      cancel={this.toggleDelete}
                    />
                  ) : null}
                  {this.state.showAdd ? (
                    <AddUp addtag={this.addtag} cancel={this.toggleAdd} />
                  ) : null}

      </div>
    );
  }
}
export default EditTagEntity;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      _id: "",
      errmsg: ""
    };
  }

  componentWillMount() {
    const { target } = this.props;
    this.setState({
      name: target.name,
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
              <h2>Edit Tag</h2>
            </div>
            <Form>
              <div className="row">
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Tag Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="name"
                      onChange={this.handleChange}
                      value={this.state.name}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.updatetag({
                      _id: this.state._id,
                      name: this.state.name
                    });
                  }}
                >
                  Update Tag
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
      name: "",
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
                <h2>Add Tag</h2>
            </div>
            <Form>
              <div className="row">
                <div className="col-md-12">
                  <Form.Group controlId="formBasicFirst">
                    <Form.Label>Tag Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder=""
                      name="name"
                      onChange={this.handleChange}
                      value={this.state.name}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.addtag({ name: this.state.name });
                  }}
                >
                  Create Tag
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

class DeleteUp extends React.Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <div className="container back-color">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <div>
                    <h1>{`Sure to remove tag: ${this.props.d_id.name}?`}</h1>
                  </div>
                </div>
              </div>
              <div className="row">
                <Button
                  className="signup-btn"
                  onClick={() => {
                    this.props.deletetag(this.props.d_id._id);
                  }}
                >
                  Confirm
                </Button>
                <Button
                  className="signup-btn"
                  onClick={() => {
                    this.props.cancel("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
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
          <td>{this.props.obj.name}</td>
          <td>
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
