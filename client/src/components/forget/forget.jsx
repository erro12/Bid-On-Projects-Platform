import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab} from 'react-bootstrap';
import "../forget/forget.css";
import { userInstance } from '../../axios/axiosconfig';
import { validateData } from '../../functions/functions';
import { NotificationManager } from 'react-notifications';
import queryString from 'query-string';
import history from '../../history';
class Forget extends Component{
    constructor(props){
        super(props)
        this.state={
            email:'',
            showForm:null
        }
    }

    handelChange=(e)=>{
        this.setState({[e.target.name]: e.target.value})
    }

    componentDidMount(){
        const parsed = queryString.parse(window.location.search);
        if (parsed.hh) {
            this.setState({showForm:true})
        }else{
            this.setState({showForm:false})
        }
    }

    forget=async(e)=>{
        e.preventDefault();
        const payload ={
            email: this.state.email
        }
        const isValid = validateData([payload.email]);
        if (isValid) {
            const response = await userInstance.post('/resetpassword',payload)
            const statusCode = response.data.code
            const msg = response.data.msg
            console.log('login', msg)
            if (statusCode === 200) {
                this.setState({email:''})
                NotificationManager.success(msg, 'Message', 4000)
                this.props.history.push('/login')
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

    }


    render(){





        return (
            <div className="forget-section">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                       {this.state.showForm===true&&this.state.showForm!==null?<Reset/>:<div className="forget-form login">
                                    <h1>Forgot your <span>Password?</span></h1>
                                    <p>Enter your email address to reset your password</p>
                                    <div className="forget-box">

                                                <Form.Group controlId="formBasicloginone">
                                                        <Form.Control type="email" placeholder="Email address" name="email" onChange={this.handelChange} value={this.state.email} />
                                                </Form.Group>

                                                    <Button className="reset-btn" onClick={this.forget}>
                                                        Reset Password
                                                    </Button>
                                    </div>
                                </div>}

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default Forget;



class Reset extends Component{
    constructor(props){
        super(props)
        this.state={
            newpassword:'',
            confirmpassword:'',
            hex:''
        }
    }

    componentDidMount=()=>{
        const parsed = queryString.parse(window.location.search);
        if (parsed.hh) {
            this.setState({hex:parsed.hh})
        }
    }

    handelChange=(e)=>{
        this.setState({[e.target.name]: e.target.value})
    }

    reset=async(e)=>{
        const payload ={
            hex: this.state.hex,
            newpassword :this.state.newpassword
        }

        const isValid = validateData([payload.newpassword, payload.hex, this.state.confirmpassword])
            if (isValid) {
                if (this.state.newpassword === this.state.confirmpassword) {
                    const response = await userInstance.post('/forgetpassword', payload)
                    console.log('response', response)
                    const statusCode = response.data.code
                    const msg = response.data.msg
                    if (statusCode === 200) {
                        console.log(statusCode)
                        history.push('/login')
                    }
                    else if (statusCode === 400) {
                        NotificationManager.error(msg, 'Message', 4000)
                    }
                    else{
                        NotificationManager.error(msg, 'Message', 4000)
                    }
                }
                else {
                    NotificationManager.error('Passwords do not match!', 'Message', 4000)
                }
            }
            else {
                NotificationManager.error('Some fields are empty', 'Message', 4000)
            }

    }

    render(){
        return (
               <div className="forget-form login">
                            <h1>Reset <span>Password?</span></h1>
                            <div className="reset-box">
                                        <Form.Group controlId="formBasicloginone">
                                              <Form.Control type="text" placeholder="New Password" name="newpassword" value={this.state.newpassword} onChange={this.handelChange} />
                                        </Form.Group>

                                        <Form.Group controlId="formBasicloginone">
                                              <Form.Control type="text" placeholder="Confirm Password" name="confirmpassword" value={this.state.confirmpassword} onChange={this.handelChange} />
                                        </Form.Group>

                                            <Button className="reset-btn" onClick={this.reset}>
                                                Continue
                                            </Button>

                            </div>
                        </div>
        )
    }
}
