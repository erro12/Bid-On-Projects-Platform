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

import { Link } from "react-router-dom";
import {
  userInstance,
  employerInstance,
  studentInstance,
  adminInstance
} from "../../../../axios/axiosconfig";
import { isemployer } from "../../../../functions/functions";

class SidePanel extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('clicked target, ', this.props.target)
    let e=document.getElementById(this.props.target);
    if(e) {
      console.log('target locked, ', e)
      e.classList.add('link-active')
    }
  }

  render() {
    return (
      <div className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <ul data-submenu-title="">
            <li>
              <Link to={"/admin/dashboard"} id="dashboard">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to={"/admin/edit/users"} id="users">
                Users
              </Link>
            </li>

            <li>
              <Link to={"/admin/edit/bids"} id="applications">Applications</Link>
            </li>

            <li>
              <Link to="/admin/edit/tags" id="tags">Tags</Link>
            </li>
            <li>
              <Link to="/admin/edit/tasks" id="tasks">Tasks</Link>
            </li>
            {/* {<li><Link to='/admin/edit/chats'>Chats</Link></li>} */}
            <li>
              <Link to="/admin/edit/faqs" id="faqs">FAQs</Link>
            </li>
            <li>
              <Link to="/admin/edit/blogs" id="blogs">Blogs</Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
export default SidePanel;
