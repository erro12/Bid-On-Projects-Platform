import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab, Modal} from 'react-bootstrap';
import "./profile.css";
import employee from "../../assets/images/employe.jpg";
import { Link } from "react-router-dom";
import history from "../../history"
import { userInstance } from "../../axios/axiosconfig";
import { validateData } from '../../functions/functions';
import { NotificationManager } from 'react-notifications';

class Profile extends Component{
    constructor(props){
        super(props)
        this.state={
            name:'',
            photo:'',
            email:'',
            bio:'',
            skills: [],
            currentSituation: ''
        }
    }

    componentDidMount=()=>{
        this.getProfileData();
    }

    getProfileData=async()=>{
        const response = await userInstance.post('/getprofile');
        console.log(response)
        if (response.data.code===200) {
            const data = response.data.profile_data;

            let skillSet = [];

           await  data.workPreference.forEach(skill=>{
                skillSet.push(skill.name)
            })

            this.setState({
                name: data.fname+' '+data.lname,
                email: data.email,
                bio: data.bio,
                photo: data.photo,
                skills: skillSet,
                currentSituation: data.currentSituation
            })

            console.log('skillset, ', this.state)
        }
    }



    render(){
        return (
            <div className="employer-section">
            
                <div className="page-title">
                    <div className="container">
                        <h2>{this.state.name}</h2>
                        <span>{this.state.email}</span>
                    </div>
                </div>


                <div className="employer-container">
                    
                    <div className="container">
                        <div className="row">

                            <div className="col-md-9">
                               <ProfileDetail {...this.state}/>
                            </div>

                            <div className="col-md-3">
                                <ProfileRate skills={this.state.skills} currentSituation={this.state.currentSituation}/>
                            </div>
                            
                        </div>
                    </div>

                </div>


            </div>
        )
    }
}
export default Profile;







class ProfileDetail extends Component{

    deleteProfile = async()=>{
        //await confirmation popup
        //req deleteProfile
    }

    render(){
        return (
            <div className="left-block">
                <div className="employee-info">
                      <div className="employee-pic">
                          <img src={'http://3.133.60.237:3001/'+this.props.photo} alt="" />
                      </div>
                      <h2>{this.props.name}</h2>
                      <span>{this.props.email}</span>
                      <span className="location">
                        <i className="fa fa-map-marker"></i> Amsterdam
                      </span>
                      <ul className="contact-icons">
                        <li>
                            <Link className="c-icon" to={'/'}>
                                <i className="fa fa-user"></i>             
                            </Link>
                        </li>
                        <li>
                            <Link className="c-icon" to={'/'}>
                                <i className="fa fa-credit-card"></i>             
                            </Link>
                        </li>
                        <li>
                            <Link className="c-icon" to={'/'}>
                                <i className="fa fa-envelope"></i>             
                            </Link>
                        </li>
                      </ul>
                      <div className="employee-about">
                        <h2>About Me</h2>
                        <p>{this.props.bio}</p>
                      </div>
                </div>
            </div>
        )
    }
}







class ProfileRate extends Component{
    constructor(props){
        super(props)
    }

    skillSet = ()=>{
        
    }



    render(){
        return (
            <div className="right-block">
                <div className="edit-profile-box">
                    <Link className="edit-btn" to={'/editprofile'}>
                    <i className="fa fa-edit"></i> Edit Profile               
                    </Link>
                </div>

                <div className="profile-widget">
                <h2>Project Finished</h2>
                  <span>22</span>
                  
                </div>


                <div className="profile-widget">                  
                  <h2>Skills</h2>
                  {/* <span>MS Office, Translating Front-End Programming</span> */}
                  <SkillSet skills={this.props.skills}/>
                </div>

                <div className="profile-widget">
                    <h2>Current Situation</h2>
                    <span>{this.props.currentSituation}</span>
                </div>

                <div className="">
                    {/* <input type="button" value="Delete Profile" onClick={this.deleteProfile}/> */}
                    {/* <ConfirmDelete /> */}
                </div>
            </div>
        )
    }
}



function SkillSet(props){
    return (
        <div>
        {props.skills.map(function(skill, i){
           return (<span key={i}>{skill+"  "}</span>)
         })}
        </div>
      );
}



// class ConfirmDelete extends Component() {
//     constructor(props){
//         super(props);
//         this.state = {
//             show: false
//         }
//     }

//      show = ()=>{
//         this.setState({
//             show: true
//         })
//     }

//      handleClose = ()=>{
//         // setShow(false)
//         this.setState({
//             show: false
//         })
//         console.log('cancel')
//     }

//      handleConfirm = ()=>{
//         //req delProfile then close modal
//         //...
//         this.setState({
//             show: false
//         })
//         console.log('confirm')
//     }
  
//     render(){
//         return (
//             <React.Fragment>
//             <Button variant="primary" onClick={this.show}>
//               Delete Profile
//             </Button>
      
//             <Modal show={this.state.show} onHide={this.handleClose} animation={false}>
//               <Modal.Header closeButton>
//                 <Modal.Title>Delete Profile</Modal.Title>
//               </Modal.Header>
//               <Modal.Body>Click confirm to delete profile...</Modal.Body>
//               <Modal.Footer>
//                 <Button variant="secondary" onClick={this.handleClose}>
//                   Cancel
//                 </Button>
//                 <Button variant="primary" onClick={this.handleConfirm}>
//                   Confirm
//                 </Button>
//               </Modal.Footer>
//             </Modal>
//           </React.Fragment>
//         )
//     }
//   }