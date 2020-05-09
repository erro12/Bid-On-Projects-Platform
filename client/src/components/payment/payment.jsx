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

import DropIn from "braintree-web-drop-in-react";

class Payment extends Component {
  instance;

  state = {
    clientToken: null
  };

  async componentDidMount() {
    console.log("will get client token for payment");
    // Get a client token for authorization from your server
    const response = await employerInstance.post("/clientToken");
    const clientToken = await response.data.clientToken;
    console.log("got token, ", response.data);

    this.setState({
      clientToken
    });
  }

  async buy() {
    // Send the nonce to your server
    const { nonce } = await this.instance.requestPaymentMethod();
    const response = await employerInstance.post('/checkout', {payment_method_nonce: nonce});
    console.log('result of transaction')
  }

  render() {
    if (!this.state.clientToken) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    } else {
      return (
        <div>
          <DropIn
            options={{ authorization: this.state.clientToken }}
            onInstance={instance => (this.instance = instance)}
          />
          <button onClick={this.buy.bind(this)}>Buy</button>
        </div>
      );
    }
  }
}
export default Payment;
