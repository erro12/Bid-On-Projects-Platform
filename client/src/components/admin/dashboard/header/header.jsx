import React, { Component } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  FormControl
} from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../../../assets/images/logo.png";
import employee from "../../../assets/images/employe.jpg";
import { adminInstance } from "../../../axios/axiosconfig";
import { isauth, isemployer } from "../../../functions/functions";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import history from "../../../history";

class Header extends Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
            
            <h3>Entity Name</h3>
        )
    }
}

export default Header;