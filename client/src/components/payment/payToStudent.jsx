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
import "../login/login.css";
import { employerInstance } from "../../axios/axiosconfig";
import {
  validateData,
  isemployer,
  isadminAuth,
  isauth,
  trackActivity,
  identifyTracking
} from "../../functions/functions";
import { NotificationManager } from "react-notifications";
import { Link } from "react-router-dom";
import history from "../../history";

import Hyperwallet from "hyperwallet-sdk";
import axios from "axios";

class PayToStudent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      client: {},
      users: [],
      cid: "",
      cmail: "",
      ut: ""
    };
  }

  componentDidMount = () => {
    this.loadHyperwallet();
  };

  loadHyperwallet = async () => {
    try {
      var client = new Hyperwallet({
        username: "restapiuser@31910231617",
        password: "Sk1timawsome!!",
        programToken: "prg-8c19269b-a7b9-4cd2-a916-3a22f476e950"
      });
      console.log("client token for hyperwallet sandbox, ", client);

      this.setState({
        client
      });
    } catch (err) {
      console.log("err in loading hyperwallet, ", err);
    }
  };

  listUsers = async () => {
    try {
      //   console.log("user list, ", await this.state.client.listUsers());
      axios({
        method: "get",
        url: "https://api.sandbox.hyperwallet.com/rest/v3/users",
        headers: {
          Authorization:
            "Basic cmVzdGFwaXVzZXJAMzE5MTAyMzE2MTc6U2sxdGltYXdzb21lISE=",
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      })
        .then(function(response) {
          console.log(response, " as user list");
        })
        .catch(function(error) {
          console.log(error, " in place of user list");
        });
    } catch (err) {
      console.log("caught err, ", err);
    }

    // function(error, body) {
    //     if (error) console.log("error in listing user, ", error);
    //     else {
    //       console.log("user list, ", body);
    //       this.setState({ users: body.data });
    //     }
    //   }
  };

  //linking new user profile (student) to hyperwallet to transfer payments
  createUser = async () => {
    this.state.client.createUser(
      {
        clientUserId: this.state.cid,
        profileType: "INDIVIDUAL",
        firstName: "John",
        lastName: "Smith",
        dateOfBirth: "1991-01-01",
        email: this.state.cmail,
        addressLine1: "123 Main Street",
        city: "New York",
        stateProvince: "NY",
        country: "US",
        postalCode: "10016",
        programToken: "prg-9c089eaf-2de9-4b74-97de-705a0c66273a"
      },
      function(error, body) {
        // handle response body here
        if (error) console.log("err in user creattion, ", error);
        else {
          console.log("user created, ", body);
        }
      }
    );
  };

  getUser = async () => {
    // this.state.client.getUser(this.state.ut, function(error, body) {
    //   // handle response body here
    //   if (error) console.log(error, ", instead of user data");
    //   else {
    //     console.log("user data, ", body);
    //   }
    // });

    axios({
      method: "get",
      url: `https://api.sandbox.hyperwallet.com/rest/v3/users/${this.state.ut}`,
      headers: {
        Authorization:
          "Basic cmVzdGFwaXVzZXJAMzE5MTAyMzE2MTc6U2sxdGltYXdzb21lISE=",
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then(function(response) {
        console.log(response, " as user list");
      })
      .catch(function(error) {
        console.log(error, " in place of user list");
      });
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <div className="container">
        <h1>Transfering task amount to student's balance...</h1>
        <span>user id:</span>
        <input
          type="text"
          name="cid"
          value={this.state.cid}
          onChange={this.handleChange}
        />
        <input
          type="text"
          name="cmail"
          value={this.state.cmail}
          onChange={this.handleChange}
        />
        <Button className="btn-secondary" onClick={this.createUser}>
          Create new user
        </Button>
        <Button className="btn-secondary" onClick={this.listUsers}>
          Refresh user list
        </Button>

        <input
          type="text"
          name="ut"
          value={this.state.ut}
          onChange={this.handleChange}
        />
        <Button className="btn-secondary" onClick={this.getUser}>
          Get User Data
        </Button>
      </div>
    );
  }
}
export default PayToStudent;
