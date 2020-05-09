import React, { Component } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Tabs,
  Tab,
  Table
} from "react-bootstrap";
import { userInstance, studentInstance } from "../../../axios/axiosconfig";
import {
  validateData,
  deleteFileFromServer,
  // deleteImageFile,
  deleteVideoFile
} from "../../../functions/functions";
import { NotificationManager } from "react-notifications";
import ProfileMenu from "../../../components/profilemenu/menu";

class StudentUploads extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // images: [],
      videos: []
    };
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  componentDidMount = () => {
    this.getFiles();
  };

  getFiles = async () => {
    console.log("getting files");
    const response = await studentInstance.get("/uploadedFiles");
    console.log("response.data, ", response.data);
    if (response.data.code === 200) {
      this.setState({
        // images: response.data.images,
        videos: response.data.videos
      });
    }
  };

  render() {
    return (
      <div className="edite-profile-section">
        <div className="edit-container">
          <ProfileMenu target="uploads" />

          <div className="dashboard-content">
            {/* <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>Images</h2>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="dashboard-list-box margin-top-0">
                  <div className="dashboard-list-box-static">
                    <div className="my-profile">
                      <Table>
                        <thead>
                          <tr>
                            <th>preview</th>
                            <th>name</th>
                            <th>actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.images.map((image, key) => (
                            <ImageRow
                              key={key}
                              image={image}
                              refresh={this.getFiles}
                            />
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            <div id="titlebar">
              <div className="row">
                <div className="col-md-12">
                  <h2>Profile Video</h2>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="dashboard-list-box margin-top-0">
                  <div className="dashboard-list-box-static">
                    <div className="my-profile">
                      <Table>
                        <thead>
                          <tr>
                            <th>name</th>
                            <th>actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.videos.map((video, key) => (
                            <VideoRow
                              key={key}
                              video={video}
                              refresh={this.getFiles}
                            />
                          ))}
                        </tbody>
                      </Table>
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
export default StudentUploads;

// class ImageRow extends Component {
//   delete = async () => {
//     if (await deleteImageFile(this.props.image)) {
//       console.log("back with true");
//       NotificationManager.success("file deleted successfully", "Message", 4000);
//       this.props.refresh();
//     } else {
//       console.log("back with false");
//       NotificationManager.error(
//         "error occured, please try again",
//         "Message",
//         4000
//       );
//     }
//   };

//   render() {
//     const { image } = this.props;
//     return (
//       <tr>
//         <td>
//           <img
//             src={"http://3.133.60.237:3001/" + image}
//             alt={image}
//             className="preview"
//           />
//         </td>
//         <td>{image}</td>
//         <td>
//           <a
//             href={"http://3.133.60.237:3001/" + image}
//             className="fa fa-eye"
//             target="_blank"
//           ></a>{" "}
//           <i onClick={this.delete} className="fa fa-trash"></i>
//         </td>
//       </tr>
//     );
//   }
// }

class VideoRow extends Component {
  delete = async () => {
    if (await deleteVideoFile(this.props.video)) {
      console.log("back with true");
      NotificationManager.success("file deleted successfully", "Message", 4000);
      this.props.refresh();
    } else {
      console.log("back with false");
      NotificationManager.error(
        "error occured, please try again",
        "Message",
        4000
      );
    }
  };

  render() {
    const { video } = this.props;
    return (
      <tr>
        <td>{video}</td>
        <td>
          <a
            href={"http://3.133.60.237:3001/" + video}
            className="fa fa-eye"
            target="_blank"
          ></a>{" "}
          <i onClick={this.delete} className="fa fa-trash"></i>
        </td>
      </tr>
    );
  }
}
