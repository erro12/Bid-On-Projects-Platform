import React, { Component } from "react";

import Zendesk from "zendesk-node-api";
import axios from "axios";

class Tickets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      client: {},
      tickets: []
    };
  }

  componentDidMount = () => {
    try {
      // let client = zendesk.createClient({
      //   username: "Nuke Frost",
      //   token: "SJVpzxZei5mL5SvYmvnVNyMt1rthJD9th2QbluVU",
      //   remoteUri: "https://testing1237.zendesk.com/api/v2"
      // });

      var zendesk = new Zendesk({
        url: "https://testing1237.zendesk.com", // https://example.zendesk.com
        // email: "jhaajay038@gmail.com", // me@example.com
        token: "aa47ba9df23b5eb36b7afcd691a522400b8c172d95de524ffb4932fd087625f7", // hfkUny3vgHCcV3UfuqMFZWDrLKms4z3W2f6ftjPT
        oauth: true
      });

      //   axios({
      //     method: "get",
      //     url: "https://testing1237.zendesk.com/api/v2/tickets.json",
      //     headers: {
      //       Authorization: "Basic amhhYWpheTAzOEBnbWFpbC5jb206U2sxdGltYXdzb21lIQ=="
      //     }
      //     }).then(function(response) {
      //       console.log(response, " as zendesk client");
      //       this.setState({ client: response });
      //     })
      //     .catch(function(error) {
      //       console.log(error, " in place of zendesk client");
      //     });
      //   // console.log("client object, ", client);   CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
      console.log(zendesk, " as zendesk client");
      this.setState({ client: zendesk });
    } catch (err) {
      console.log("error in client creation, ", err);
    }
  };

  componentDidUpdate = () => {
    console.log("updated");
    this.loadTickets();
  };

  loadTickets = async () => {
    console.log("fetching tickets");
    if (this.state.client) {
      // const tickets = await this.state.client.list();
      // console.log("tickets, ", tickets);
      // this.setState({ tickets });

      this.state.client.tickets
        .list("sort_by=status&sort_order=desc")
        .then(function(tickets) {
          console.log("tickets, ", tickets);
          this.setState({ tickets });
        });
    }
  };

  render() {
    return <h1>check console for now...</h1>;
  }
}
export default Tickets;
