import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab} from 'react-bootstrap';
import "../contract/contract.css";
import employee from "../../assets/images/employe.jpg";
import { Link } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import StepZilla from "react-stepzilla";
import 'react-stepzilla/src/css/main.css';

import step1 from "../../assets/images/step-1.jpg";
import step2 from "../../assets/images/step-2.jpg";
import step3 from "../../assets/images/step-2.jpg";
import step4 from "../../assets/images/step-4.jpg";




class Contract extends Component{

render(){
        return (
            <div className="contract-section">
            
                <div className="page-title">
                    <div className="container">
                        <h2>Project Name - Web Design</h2>
                        <span>Approved</span>
                    </div>
                </div>


                <div className="contract-container">
                    
                    <div className="container">
                        <div className="row">

                            <div className="col-md-8">
                               <ContractDetail />
                            </div>

                            <div className="col-md-4">
                                <ContractRate />
                            </div>
                            
                        </div>
                    </div>

                </div>


            </div>
        )
    }
}
export default Contract;












class ContractDetail extends Component{

   

    render(){

        const steps =
        [
          {name: 'Step 1', component: <Step1 />},
          {name: 'Step 2', component: <Step2 />},
          {name: 'Step 3', component: <Step3 />},
          {name: 'Step 4', component: <Step4 />}
        ]

        return (
            <div className="left-block">
                <div className="contract-info">
                      <div className="contract-pic">
                          <img src={employee} alt="" />
                      </div>
                      <h2>John Doe Williamson</h2>
                      <span>@johnwilliamson</span>
                        <Button className="chat-btn">Chat</Button>
                      <div className="contract-about">
                        <h2>Project Description</h2>
                        <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.</p>

                      </div>


                      <div className="contract-payment">
                        <h2>Payment</h2>
                        <Table>
                            <thead>
                                <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>30 Oct 2019</td>
                                    <td>Design the logo</td>
                                    <td>In Progress</td>
                                    <td>€30.00 EUR</td>
                                </tr>

                                <tr>
                                    <td>30 Oct 2019</td>
                                    <td>Design the logo</td>
                                    <td>In Progress</td>
                                    <td>€30.00 EUR</td>
                                </tr>


                                <tr>
                                    <td>30 Oct 2019</td>
                                    <td>Design the logo</td>
                                    <td>In Progress</td>
                                    <td>€30.00 EUR</td>
                                </tr>


                                <tr>
                                    <td>30 Oct 2019</td>
                                    <td>Design the logo</td>
                                    <td>In Progress</td>
                                    <td>€30.00 EUR</td>
                                </tr>

                                
                                
                            </tbody>
                            </Table>
                      </div>





                      <div className="step-progress">
                        <h2>Project Status</h2>
                        <StepZilla steps={steps} />
                      </div>





                </div>
            </div>
        )
    }
}












class ContractRate extends Component{

    render(){
        return (
            <div className="right-block">
                <h2>Payment Summary</h2>

                <p>Payments-to-date</p>
                <h3>€0.00 EUR</h3>


                <p>Pending Payments</p>
                <h3>€0.00 EUR</h3>

                <div className="review-box">
                    <Link className="review-btn" to={'/'}>
                    Write Review              
                    </Link>
                </div>
                
            </div>
        )
    }
}









class Step1 extends Component{

    render(){
        return (
            <div className="step-container">

                <img src={step1} alt="Step 1"/>

                <h3>Applied for Project</h3>

                
            </div>
        )
    }
}


class Step2 extends Component{

    render(){
        return (
            <div className="step-container">


                <img src={step2} alt="Step 2"/>
                <h3>Project in Progress</h3>

                
            </div>
        )
    }
}





class Step3 extends Component{

    render(){
        return (
            <div className="step-container">

                <img src={step3} alt="Step 3"/>

                <h3>Project in Review</h3>

                
            </div>
        )
    }
}





class Step4 extends Component{

    render(){
        return (
            <div className="step-container">

                <img src={step4} alt="Step 4"/>

                <h3>Project Finished</h3>

                
            </div>
        )
    }
}