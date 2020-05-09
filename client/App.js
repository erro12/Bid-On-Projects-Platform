import React,{Component} from 'react';
import { Router,Switch,Route, Redirect } from 'react-router-dom';
import Header from './components/header/header';
import Footer from './components/footer/footer';
import Forget from './components/forget/forget';
import Home from './components/home/home';
import Register from './components/register/register';
import Login from './components/login/login';
import EditProfile from './components/editprofile/editprofile';
import AcademicProfile from './components/academic/academic';
import ChangePassword from "./components/changepassword/changepassword";
import Profile from "./components/profile/profile";
import Projects from "./components/projects/projects";
import ProjectDetails from "./components/projectdetail/projectdetail";
import Contract from "./components/contract/contract";
import EmployerContract from "./components/employer/contract/contract";
import StudentContract from "./components/student/contract/contract";
import Dashboard from "./components/dashboard/dashboard";
import Faqs from "./components/faqs/faqs";
import {NotificationContainer} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import employerProfile from "./components/employer/profile/profile";
import employerEditProfile from "./components/employer/editprofile/editprofile";
import employerChangePassword from "./components/employer/editprofile/change_password";
import projectpost from "./components/employer/projectpost/projectpost";
import employerDashboard from "./components/employer/dashboard/dashboard";

import history from './history';
import {isauth,isemployer} from "./functions/functions";
import {userInstance} from "./axios/axiosconfig";
export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isauth() ? (
        <Component {...props} {...rest}/>
      ) : (
        <Redirect
          to={{
            pathname: "/",
            state: { from: props.location }
          }}
        />
      )
    }
  />
);


export const PrivateRouteEmployer = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (isauth() && isemployer()) {
        return <Component {...props} {...rest}/>;
      } else {
        return (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location }
            }}
          />
        );
      }
    }}
  />
);

export const PrivateRouteStudent = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (isauth() && !isemployer()) {
        return <Component {...props} {...rest}/>;
      } else {
        return (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location }
            }}
          />
        );
      }
    }}
  />
);


class App extends Component{

  constructor(props){
    super(props)
    this.state={
      _id: "",
      fname: "",
      lname: "",
      email: "",
      phone: "",
      bio: "",
      photo: "",
      isemployer: null,
      studyYear: "",
      academicSubjects: "",
      additionalQualifications: "",
      universityID: "",
      workPreference: "",
      hourlyRate: "",
      companyClassification: "",
      websiteLink: "",
      empstate: true
    }
  }
  
  componentDidMount() {
    this.getProfileData();
    console.log("Inside Component Did mount", this.state);
  }

  getProfileData = async () => {
    const response = await userInstance.post("/getprofile");
    if (response.data.code === 200) {
      const data = response.data.profile_data;

      this.setState({
        _id: data._id,
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        photo: data.photo,
        isemployer: data.isemployer,
        empstate: data.isemployer,
        companyClassification: data.companyClassification,
        websiteLink: data.websiteLink,
        hourlyRate: data.hourlyRate
      });
    }
  };
  
   render(){
      return(
        <div className="main-wrapper">

          <Router history={history}>
            <Header profileData={this.state}/>
              <Route exact path="/" component={Home} />
              <Route exact path="/register" component={Register} />
              <Route path="/login" component={Login} />
              <Route exact path="/forget" component={Forget} />
              <PrivateRoute profileData={this.state} path = "/profile" component={Profile}/>
              <Route exact path="/editprofile" component={EditProfile} />
              <Route exact path="/academic" component={AcademicProfile} />
              <Route path = "/projects" component={Projects}/>
              <Route path = "/projectdetail" component={ProjectDetails}/>
              <Route exact path="/changepassword" component={ChangePassword} />
              <Route path = "/contract" component={EmployerContract}/>
              <PrivateRouteEmployer path = "/employer/contract" component={EmployerContract}/>
              <PrivateRouteStudent path = "/student/contract" component={StudentContract}/>
              <Route path = "/dashboard" component={Dashboard}/>
              <Route path = "/faqs" component={Faqs}/>
              <PrivateRouteEmployer path="/employer/profile" component={employerProfile}/>
              <PrivateRouteEmployer path="/employer/editprofile" component={employerEditProfile}/>
              <PrivateRouteEmployer path="/employer/changepassword" component={employerChangePassword}/>
              <PrivateRouteEmployer path="/employer/createtask" component={projectpost}/>
              <Route path = "/employer/dashboard" component={employerDashboard}/>
          <Footer/>
          <NotificationContainer/>
          </Router> 

        </div>
      )
   }
}
export default App;
