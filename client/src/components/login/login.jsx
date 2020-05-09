import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab} from 'react-bootstrap';
import "../login/login.css";
import { userInstance } from '../../axios/axiosconfig';
import { validateData, isemployer, isadminAuth, isauth, trackActivity, identifyTracking } from '../../functions/functions';
import { NotificationManager } from 'react-notifications';
import { Link } from "react-router-dom";
import history  from "../../history"


class Login extends Component{
    constructor(props){
        super(props)
        this.state = {
            email:'',
            password:'',
            employerEmail:'',
            employerPassword:''
        }
    }

    componentDidMount(){
        if(isadminAuth()){
            this.props.history.push("/admin/dashboard")
        }else{
            if(isauth()){
                this.props.history.push("/")
            }
        }
    }

    handleChange=(e)=>{
        this.setState({[e.target.name]: e.target.value})
    }

    login = async () => {
        const loginPayload = {
            email: this.state.email,
            password: this.state.password
        }
        const isValid = validateData([loginPayload.email, loginPayload.password])
        if (isValid) {
            const response = await userInstance.post('/login', loginPayload)
            const statusCode = response.data.code
            const msg = response.data.msg
            const LOGIN_IN_DATE = new Date().toISOString();
            console.log('login', msg)
            if (statusCode === 200) {
                identifyTracking(response.data._id);
                trackActivity("log in", {"log in date": LOGIN_IN_DATE});

                if(isemployer()){
                    console.log('employer he is')
                    window.location.href = '/employer/dashboard';
                }else{
                    console.log('student spotted')
                    window.location.href = '/student/dashboard';
                }
                // window.location.href = "/"
            }
            else if (statusCode === 404) {
                NotificationManager.error(msg, 'Message', 4000)
            }
            else if (statusCode === 400) {
                NotificationManager.error(msg, 'Message', 4000)
            }
            else {
                NotificationManager.error(msg, 'Message', 4000)
            }
        }
        else {
            NotificationManager.error('Invalid login details!', 'Message', 4000)
        }
    }

    render(){
        return (
            <div className="login-section">
            <div className="container">
                <div classNmae="row">
                    <div className="col-md-12">
                    <div className="login-form">
                            <h1>Login on <span>Bowsy</span></h1>
                            <div className="login-box">
                                <Form>
                                    <Form.Group controlId="formBasicloginone">
                                        <Form.Label>Email address</Form.Label>
                                            <Form.Control type="email" placeholder="" name="email" value={this.state.email} onChange={this.handleChange} />
                                    </Form.Group>
                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="" name="password" value={this.state.password} onChange={this.handleChange}  />
                                    </Form.Group>
                                    <div className="forget-password">
                                        <Link className="forget-link" to={'/forgot'}>
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="login-button">
                                        <Button className="login-btn" onClick={this.login}>
                                            login
                                        </Button>
                                    </div>
                                </Form>
                                <p>Don't have an account yet? <Link className="signup-link" to={'/register'}>
                                Sign Up
                                </Link>  </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )
    }
}
export default Login;
