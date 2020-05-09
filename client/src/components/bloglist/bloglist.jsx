import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "./bloglist.css";
import job_icon from "../../assets/images/job-icon.png";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { isemployer, formatDate } from "../../functions/functions";
import { userInstance, studentInstance } from "../../axios/axiosconfig";
import InputRange from "react-input-range";

import "react-input-range/lib/css/index.css";

class BlogList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
    };
  }

  componentDidMount() {
    console.log("blogs mounted");
  }

  async componentWillMount() {
    console.log("gonna mount anytime now");
    await this.getblogs();
  }

  async componentDidUpdate() {
    console.log("after update, ", this.state.items);
  }

  getblogs = async () => {
    console.log("1");
    let res = null;
    res = await userInstance.get("/getblogs");
    console.log("2, ", res.data);

    console.log("all posts, ", res.data.blog_data);

    try {
      this.setState({
        items: res.data.blog_data,
      });
      console.log("state, ", this.state);
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <div className="jobs-section">

        <div className="jobs-container">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <BlogListing blogs={this.state.items} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BlogList;

class BlogListing extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="job-listing">
        <div className="listings-container">
          {this.props.blogs.map((item, key) => (
            <Link
              key={item._id}
              className="listing"
              to={{
                pathname: `/blogs/${item._id}`,
                blog: item
              }}
            >

              <div className="listing-title">
                <h4>
                  {item.title}{" "}
                  <span className="listing-type">{formatDate(item.date)}</span>
                </h4>
                  <p>{item.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
}
