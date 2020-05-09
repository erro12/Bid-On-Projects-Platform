import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab} from 'react-bootstrap';
import "../profilemenu/menu.css";
import { Link } from "react-router-dom";
import {trackActivity, resetTracking} from '../../../functions/functions';
import { userInstance } from "../../../axios/axiosconfig";



class ProfileMenu extends Component{
    logout=async()=>{
        const response = await userInstance.post("/logout")
        if(response.data.code === 200 || response.status === 200){
            const LOG_OUT_DATE = new Date().toISOString();
            trackActivity("log out", {"log out date": LOG_OUT_DATE})
            resetTracking();
            window.location.href = "/";
          }
    }
    render(){
        return (
        <div className="dashboard-nav">
            <div className="dashboard-nav-inner">

                <ul data-submenu-title="Account">
                    <li><Link className="link-active" to={'/employer/editprofile'}>Profile</Link></li>
                    <li><Link to={'/employer/changepassword'}>Change Password</Link></li> 
                    <li><Link to={'/'}>Email/Notification <span className="nav-tag">2</span></Link></li>
                    {/* <li><Link to={'/'}>Password</Link></li> */}
                    <li><Link to={'/'}>Payment</Link></li>
                    {/* <li><Link to={'/'}>Security</Link></li> */}
                    <li><Link onClick={this.logout}>Logout</Link></li>
                </ul>
                
            </div>
        </div>
        )
    }
}
export default ProfileMenu;