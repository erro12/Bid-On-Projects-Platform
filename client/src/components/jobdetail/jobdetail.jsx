import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab} from 'react-bootstrap';
import "./jobdetail.css";
import employee from "../../assets/images/employe.jpg";
import { Link } from "react-router-dom";
import job_icon from "../../assets/images/job-icon.png";

class JobDetails extends Component{

    constructor(props){
        super(props);

        this.state = {
            job: {}
        }
    }


    componentWillMount() {
        console.log("component mounted");
        const job = this.props.location.job;
    
        console.log("job, ", job);
        this.setState({
          job: job
        });
      }


    render(){
        return (
            <div className="jobdetail-section">
            
                <div className="page-title">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <h2>Project Detail</h2>
                                <div className="login-signup">
                                    <Link className="job-login-btn" to={'/login'}>Login</Link>
                                    <Link className="job-register-btn" to={'/register'}>Register</Link>
                                </div>
                            </div>  
                        </div>
                    </div>
                </div>


                <div className="jobdetail-container">
                    
                    <div className="container">
                        <div className="row">

                            <div className="col-md-9">
                               <JobInfo job={this.state.job}/>
                            </div>

                            <div className="col-md-3">
                                <JobRate job={this.state.job}/>
                            </div>
                            
                        </div>
                    </div>

                </div>


            </div>
        )
    }
}
export default JobDetails;







class JobInfo extends Component{


    constructor(props){
        super(props);
    }

    render(){
        return (
            <div className="left-block">
                <div className="jobdetail-info">

                    <div className="jobdetail-title">
                    <div className="jobdetail-listing">
                        <div class="jobdetail-listing-logo">
                            <img src={job_icon} alt=""/>
                        </div>

                        <div className="jobdetail-listing-title">
                            <h4>{this.props.job.jobTitle} <span className="jobdetail-listing-type">{this.props.job.jobBlock}</span></h4>
                            <ul className="jobdetail-listing-icons">
                                <li><i className="fa fa-map-marker"></i> {this.props.job.jobLocation} </li>
                                {/* <li><i className="fa fa-money"></i> 12€/hr</li> */}
                                <li><i className="fa fa-money"></i> {this.props.job.jobValue}</li>
                                 <li><div className="jobdetail-listing-date new">{this.props.job.taskDeadline}</div></li> {/*//replace with job create date dif. */}
                            </ul>
                        </div>
                    </div>
                    </div>
                      
                      <div className="jobdetail-about">
                        <h2>Project Description</h2>
                        {/* <p>Millennium Jewelry are introducing a new range of accessories for iPhone and Samsung users and we would value your opinion on our new products. We are holding focus groups over 5 days at our offices in Dublin, starting January 11th.</p>
                        <p>Ideally we are looking for students who are interested in fashion and not afraid to voice their opinion and no previous experience is required. Each focus group will last approximately 4 hours and we would require all candidates to be available for at least two groups during the 5 day period as we will be exploring several different creative routes where we would value your input. The details of the focus group timings are attached and we look forward to hearing from you.</p> */}

                        <p>{this.props.job.taskDescription}</p>
                      </div>
                </div>
            </div>
        )
    }
}







class JobRate extends Component{

    render(){
        return (
            <div className="right-block">
                <div className="apply-job-box">
                    <Link className="apply-job-btn" to={'/'}>
                    Apply Project             
                    </Link>
                </div>
                <div className="jobdetail-widget">
                    <span>Block Type</span>
                    <h2>{this.props.job.jobBlock}</h2>
                </div>
                <div className="jobdetail-widget">
                    <span>Project Time</span>
                    <h2>{this.props.job.numberOfHours} Days</h2>
                </div>
                <div className="jobdetail-widget">
                    <span>Pay</span>
                    <h2>{this.props.job.jobValue}€/hr</h2>
                </div>
                <div className="jobdetail-widget">
                    <span>Location</span>
                    <h2>{this.props.job.jobLocation}</h2>
                </div>
            </div>
        )
    }
}