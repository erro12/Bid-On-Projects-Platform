import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,FormControl} from 'react-bootstrap';
import "../footer/footer.css";
import logo from "../../assets/images/logo-foot.png";
class Footer extends Component{

    render(){
        return (
            <div className="footer">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="footer-one">
                                <img src={logo}/>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="footer-two">
                                <h3>Company</h3>
                                <ul className="list">
                                    <li><a><i className="fa fa-angle-right" aria-hidden="true" onClick={() => this.props.history.push("/faqs")}></i> About us</a></li>
                                    <li><a><i className="fa fa-angle-right" aria-hidden="true" onClick={() => this.props.history.push("/faqs")}></i> Contact us</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="footer-three">
                                <h3>Policy</h3>
                                <ul className="list">
                                    <li><a><i className="fa fa-angle-right" aria-hidden="true"></i> Term of Service</a></li>
                                    <li><a><i className="fa fa-angle-right" aria-hidden="true"></i> Privacy Policy</a></li>
                                </ul>
                            </div>
                        
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="copy-right">
                                <p><i className="fa fa-copyright" aria-hidden="true"></i> Copyright 2018 by <span>Loremsum</span>. All Rights Reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default Footer;