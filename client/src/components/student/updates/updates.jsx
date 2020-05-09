import React, { Component } from "react";
import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { isemployer } from "../../../functions/functions";
import { studentInstance } from "../../../axios/axiosconfig";
import InputRange from "react-input-range";
import { NotificationManager } from "react-notifications";

import "react-input-range/lib/css/index.css";

class StudentUpdates extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      loading: true,
      total: 1,
      index: 1,
      limit: 10,
      sortBy: "None",
      desc: false,
      type: "None"
    };
  }

  async componentDidMount() {
    // console.log("gonna mount anytime now");
    this.getNotifications();
  }

  componentDidUpdate() {
    if (this.state.loading) this.getNotifications();
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

  handleChange = e => {
    console.log("changing type, ", e.target.value);
    this.setState({ [e.target.name]: e.target.value, loading: true });
  };


  getNotifications = async () => {
    const { index, limit, sortBy, type, desc } = this.state;
    console.log("1");
    let res = null;
    res = await studentInstance.post("/notifications", {
      index,
      limit,
      type,
      sortBy,
      desc
    });
    console.log("2, ", res.data);

    console.log("all notifications, ", res.data.notifications);

    try {
      this.setState({
        items: res.data.notifications,
        loading: false,
        total: res.data.total,
        sortBy: "None"
      });
      console.log("state, ", this.state);
    } catch (error) {
      console.log(error);
    }
  };

  // changeState = newState => {
  //   this.setState(newState);
  //   if (!this.state.loading) this.getNotifications();
  // };

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
      <div className="pagination-container">
        <div className="container">
        <div id="titlebar">
            <div className="row">
              <div className="col-md-9">
                {/* <h2>Notifications</h2> */}
                {/* <button
                    type="button"
                    class="btn btn-secondary"
                    onClick={this.toggleAdd}
                  >
                    Add Task
                  </button> */}
              </div>
              <div className="col-md-3">
                <div className="widget">
                  <h4>type</h4>

                  <select
                    data-placeholder="Choose Category"
                    className="chosen-select-no-single"
                    name="type"
                    value={this.state.type}
                    onChange={this.handleChange}
                  >
                    <option>None</option>
                    <option>task</option>
                    <option>chat</option>
                    <option>payment</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <Table>
                <thead>
                  <th>about</th>
                  <th>task</th>
                  <th>employer</th>
                  <th>visit</th>
                  <th>mark as read</th>
                </thead>
                <tbody>
                  <NotificationListing
                    notifications={this.state.items}
                    loading={this.state.loading}
                    changeState={this.changeState}
                  />
                </tbody>
              </Table>
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
    );
  }
}

export default StudentUpdates;

class NotificationListing extends Component {
  constructor(props) {
    super(props);
  }

  markRead = async _id => {
    if (!this.props.loading) {
      this.props.changeState({ loading: true });
      const res = await studentInstance.post("/readNotification", { _id });
      if (res.data.code === 200) {
        this.props.changeState({ loading: false });
      } else {
        NotificationManager.error("Error, please try again", "Message", 4000);
      }
      this.props.changeState({ loading: false });
    }
  };

  render() {
    return this.props.notifications.map((item, key) => (
      <tr>
        <React.Fragment>
          <td>{item.message}</td>
          <td>{item.task.jobTitle}</td>
          <td>{item.employer.fname + " " + item.employer.lname}</td>
          <td>
            <Link
              key={item._id}
              to={{
                pathname: "/student/contract",
                job: {
                  _id: item.application,
                  studentId: item.student._id
                }
              }}
            >
              <i class="fa fa-external-link" aria-hidden="true"></i>
            </Link>
          </td>
          <td>
            <span onClick={() => this.markRead(item._id)}>
              <i class="fa fa-minus-circle" aria-hidden="true"></i>
            </span>
          </td>
        </React.Fragment>
      </tr>
    ));
  }
}
