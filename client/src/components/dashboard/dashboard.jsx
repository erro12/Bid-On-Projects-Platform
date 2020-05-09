import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab} from 'react-bootstrap';
import "../dashboard/dashboard.css";
import { Link } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

class Dashboard extends Component{

render(){
        return (
            <div className="dashboard-section">
            
                <div className="page-title">
                    <div className="container">
                        <span>Welcome Back!</span>
                        <h2>John Doe Williamson</h2>
                        <span>@johndoe</span>
                    </div>
                </div>


                <div className="dashboard-container">
                    
                    <div className="container">
                        <div className="row">

                            <div className="col-md-8">
                               <RecentProjects />
                            </div>

                            <div className="col-md-4">
                                <Summary />
                            </div>
                            
                        </div>
                    </div>

                </div>


            </div>
        )
    }
}
export default Dashboard;










class RecentProjects extends Component{

    render(){
            return (
                <div className="recent-project-section">
                
                    
                <h2>Recent Projects</h2>
                        <Table>
                            <thead>
                                <tr>
                                <th>Project Title</th>
                                <th>Employer</th>
                                <th>Amount</th>
                                <th>Deadline</th>
                                <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Logo Design</td>
                                    <td>Harry Doe</td>
                                    <td>€100.00 EUR</td>
                                    <td>5 Days</td>
                                    <td>Pending</td>
                                </tr>

                                <tr>
                                    <td>React Gaming Website</td>
                                    <td>John Doe</td>
                                    <td>€5000.00 EUR</td>
                                    <td>2 Months</td>
                                    <td>Pending</td>
                                </tr>

                                <tr>
                                    <td>Wordpress Website</td>
                                    <td>Michel Forge</td>
                                    <td>€30.00 EUR</td>
                                    <td>15 Days</td>
                                    <td>Released</td>
                                </tr>

                                <tr>
                                    <td>PHP Laravel Website</td>
                                    <td>Simoon Luke</td>
                                    <td>€850.00 EUR</td>
                                    <td>25 Days</td>
                                    <td>pending</td>
                                </tr>

                                <tr>
                                    <td>Wordpress Website</td>
                                    <td>John Doe</td>
                                    <td>€500.00 EUR</td>
                                    <td>15 Days</td>
                                    <td>Released</td>
                                </tr>

                                <tr>
                                    <td>Wordpress Website</td>
                                    <td>John Doe</td>
                                    <td>€500.00 EUR</td>
                                    <td>15 Days</td>
                                    <td>Released</td>
                                </tr>


                                <tr>
                                    <td>Wordpress Website</td>
                                    <td>John Doe</td>
                                    <td>€500.00 EUR</td>
                                    <td>15 Days</td>
                                    <td>Released</td>
                                </tr>

                                <tr>
                                    <td>Wordpress Website</td>
                                    <td>John Doe</td>
                                    <td>€500.00 EUR</td>
                                    <td>15 Days</td>
                                    <td>Released</td>
                                </tr>
                                
                                
                            </tbody>
                            </Table>
    
                </div>
            )
        }
    }













class Summary extends Component{

        render(){
                return (
                    <div className="summary-section">
                    
                        <div className="highlight-profile">
                            <h2>John Doe Williamson</h2>
                            <span>@johndoe</span>
                        </div>

                        <div className="highlight-content">

                            <div className="dashboard-widget">
                                <p>Account Balance</p>
                                <h3>€500.00 EUR</h3>
                            </div>

                            <div className="dashboard-widget">
                                <p>Project Finished</p>
                                <h3>22</h3>
                            </div>


                            <div className="dashboard-widget">
                                <p>Soft Skills</p>
                                <h3>Rating</h3>
                            </div>


                            <div className="dashboard-widget">
                                <p>Hard Skills</p>
                                <h3>Rating</h3>
                            </div>

                        </div>

        
                    </div>
                )
            }
        }