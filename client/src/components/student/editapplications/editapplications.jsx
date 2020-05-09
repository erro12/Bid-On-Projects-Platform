import React, { Component } from "react";
import { Form, Button, Col, Table } from "react-bootstrap";
import { studentInstance } from "../../../axios/axiosconfig";
import { validateData } from "../../../functions/functions";
import { NotificationManager } from "react-notifications";
import ProfileMenu from "../../profilemenu/menu";
import { Link } from "react-router-dom";
import "../../admin/assets/editStyle.css";

class EditApplications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      projects: [],
      total: 1,
      index: 1,
      limit: 20,
      showDelete: false,
      //   showView: false,
      showAdd: false,
      showPopup: false,
      target: {},
      bids: [],
      targetObj: ""
    };
  }

  componentDidMount = () => {
    this.getbids();
  };

  componentDidUpdate() {
    if (this.state.loading) this.getbids();
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

  //   toggleView = target => {
  //     this.setState({
  //       showView: !this.state.showView,
  //       target
  //     });
  //   };

  togglePopup = target => {
    this.setState({
      showPopup: !this.state.showPopup,
      target
    });
    this.getbids();
  };

  toggleDelete = async d_id => {
    if (window.confirm("confirm delete application ?")) {
      await this.deletebid(d_id._id);
    }
    // this.setState({
    //   showDelete: !this.state.showDelete,
    //   d_id
    // });
    this.getbids();
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value, loading: true });
  };

  getbids = async () => {
    const { index, limit } = this.state;
    console.log("about to get bids");
    const response = await studentInstance.post("/getbids", {
      index,
      limit
    });
    console.log("got bids, ", response.data);
    console.log("response,", response);
    if (response.data.code === 200) {
      const bids = response.data.bids;
      console.log("all bids, ", bids);
      this.setState({
        bids,
        projects: response.data.projects,
        loading: false,
        total: response.data.total
      });
      // console.log(this.state);
    }
  };

  deletebid = async d_id => {
    try {
      const response = await studentInstance.post("/deletebidById", {
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
  };

  updatebid = async bid => {
    console.log("no i wont!");
    console.log("state", this.state);
    const payload = {
      _id: bid._id,
      detail: bid.detail
    };
    console.log("editing bid, payload to update, ", payload);
    const isValid = validateData([payload._id]);
    if (isValid) {
      const response = await studentInstance.post("/updatebid", payload);
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

  changeState = newState => {
    if (!this.state.loading) {
      console.log("changing, ", newState);
      this.setState({
        loading: true
      });
    }
  };

  render() {
    const { targetObj, showPopup } = this.state;
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <ProfileMenu target="applications" />
          <div className="dashboard-content">
            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>Applications</h2>
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
                          <th>task</th>
                          <th>employer</th>
                          <th>actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.bids.map((object, i) => (
                          <TableRow
                            obj={object}
                            key={i}
                            toggle={this.togglePopup}
                            delete={this.toggleDelete}
                            // view={this.toggleView}
                          />
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="pagination">
                  <span>
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
            updatebid={this.updatebid}
          />
        ) : null}
        {/* {this.state.showView ? (
          <ViewDetails
            target={this.state.target}
            closePopup={this.toggleView.bind(this)}
          />
        ) : null} */}
      </div>
    );
  }
}
export default EditApplications;

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: "",
      detail: "",
      errmsg: ""
    };
  }

  componentWillMount() {
    const { target } = this.props;
    this.setState({
      _id: target._id,
      detail: target.detail
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
              <h2>Edit Application</h2>
            </div>
            <Form>
              <div className="row"></div>

              <div className="col-md-12">
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Detail</Form.Label>
                  <textarea
                    className="form-control"
                    placeholder=""
                    name="detail"
                    onChange={this.handleChange}
                    value={this.state.detail}
                  />
                </Form.Group>
              </div>

              <div className="err">{this.state.errmsg}</div>
              <div className="text-center">
                <Button
                  className="bid-btn"
                  onClick={() => {
                    this.props.updatebid({
                      _id: this.state._id,
                      detail: this.state.detail
                    });
                  }}
                >
                  Update Bid
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

// class ViewDetails extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       target: {}
//     };
//   }

//   componentWillMount() {
//     const { target } = this.props;
//     this.setState({
//       target
//     });
//   }
//   render() {
//     const { target } = this.state;
//     return (
//       <div className="popup">
//         <div className="popup_inner">
//           <div className="container back-color">
//             <div className="row">
//               <div className="col-md-12">
//                 <Table>
//                   <tbody>
//                     <tr>
//                       <td>task</td>
//                       <td>{target.projectId.jobTitle}</td>
//                     </tr>
//                     <tr>
//                       <td>Employer</td>
//                       <td>
//                         {target.employerId.fname +
//                           " " +
//                           target.employerId.lname}
//                       </td>
//                     </tr>
//                   </tbody>
//                 </Table>
//               </div>
//             </div>
//             <Button
//               onClick={() => {
//                 this.props.closePopup();
//               }}
//             >
//               Close
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

class TableRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <tr>
        <td><Link
            to={{
              pathname: `/taskdetail/${this.props.obj.projectId._id}`,
              project: this.props.obj
            }}
            target="_blank"
          >
            {this.props.obj.projectId.jobTitle}
          </Link></td>

          <td>
            <Link
              to={`/profile/${this.props.obj.employerId._id}`}
              target="_blank"
            >
              {this.props.obj.employerId.fname +
                " " +
                this.props.obj.employerId.lname}
            </Link>
          </td>
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
              class="fa fa-trash fa-fw"
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
