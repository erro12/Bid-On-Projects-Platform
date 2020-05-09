import React, { Component } from "react";
import Payment from "./components/payment/payment";
import PayToStudent from "./components/payment/payToStudent";
import Pending from "./components/employer/pending/pending";
import EmployerUpdates from "./components/employer/updates/updates";
import EmployerUploads from "./components/employer/uploads/uploads";
import StudentUploads from "./components/student/uploads/uploads";
import StudentUpdates from "./components/student/updates/updates";
import EditApplications from "./components/student/editapplications/editapplications";
import EditTasks from "./components/employer/edittasks/edittasks";
import Selected from "./components/employer/selected/selected";
import Payments from "./components/employer/milestones/payments";
import { Router, Route, Redirect } from "react-router-dom";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import Forget from "./components/forget/forget";
import Home from "./components/home/home";
import Register from "./components/register/register";
import Login from "./components/login/login";
import BlogList from "./components/bloglist/bloglist";
import AdminAuth from "./components/admin/auth/auth";
import BlogPage from "./components/admin/dashboard/blogpage/blogpage";
import Tickets from "./components/support/tickets";
import EditProfile from "./components/editprofile/editprofile";
import AcademicProfile from "./components/academic/academic";
import ChangePassword from "./components/changepassword/changepassword";
import Profile from "./components/profile/profile";
import PublicProfile from "./components/publicprofile/publicprofile";
import PublicDashboard from "./components/publicdashboard/publicdashboard";
import Projects from "./components/projects/projects";
import ProjectDetails from "./components/projectdetail/projectdetail";
import EmployerContract from "./components/employer/contract/contract";
import EmployerCreativeProject from "./components/employer/creativeList/creativeList";
import StudentContract from "./components/student/contract/contract";
// import ApplyProject from "./components/student/applyproject/applyproject";
import ApplyProject from "./components/student/applyproject/applyproject";
import Dashboard from "./components/dashboard/dashboard";
import EditUserEntity from "./components/admin/dashboard/editUserEntity/editUserEntity";
import EditFAQEntity from "./components/admin/dashboard/editFAQEntity/editFAQEntity";
import EditProjectEntity from "./components/admin/dashboard/editProjectEntity/editProjectEntity";
import EditTagEntity from "./components/admin/dashboard/editTagEntity/editTagEntity";
import EditBlogEntity from "./components/admin/dashboard/editBlogEntity/editBlogEntity";
import EditBidEntity from "./components/admin/dashboard/editBidEntity/editBidEntity";
import EditChatEntity from "./components/admin/dashboard/editChatEntity/editChatEntity";
import ChatWindow from "./components/chatwindow/chatwindow";
import Faqs from "./components/faqs/faqs";
import { NotificationContainer } from "react-notifications";
import "react-notifications/lib/notifications.css";
import AdminDashboard from "./components/admin/dashboard/dashboard";

import employerProfile from "./components/employer/profile/profile";
import EmployerNotifications from "./components/employer/notifications/notifications";
import StudentNotifications from "./components/student/notifications/notifications";
import studentProfile from "./components/student/profile/profile";
import employerEditProfile from "./components/employer/editprofile/editprofile";
import employerChangePassword from "./components/employer/editprofile/change_password";
import projectpost from "./components/employer/projectpost/projectpost";
import employerDashboard from "./components/employer/dashboard/dashboard";
import Proposal from "./components/employer/proposal/proposal";
import studentDashboard from "./components/student/dashboard/dashboard";

import history from "./history";
import { isauth, isemployer, isadminAuth } from "./functions/functions";
import { userInstance } from "./axios/axiosconfig";
export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isauth() ? (
        <Component {...props} {...rest} />
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
        return <Component {...props} {...rest} />;
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
        return <Component {...props} {...rest} />;
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

export const PrivateRouteAdmin = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      // if (isauth() && isadmin()) {
      if (isadminAuth()) {
        return <Component {...props} {...rest} />;
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      balance: 0,
      empstate: true
    };
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
        hourlyRate: data.hourlyRate,
        balance: data.balance
      });
    }
  };

  refreshHeader = () => {
    this.getProfileData();
  };

  render() {
    return (
      <div className="main-wrapper">
        <Router history={history}>
          <Header profileData={this.state} />
          <Route exact path="/" component={Home} />
          <Route exact path="/register" component={Register} />
          <Route path="/login" component={Login} />
          <Route exact path="/forget" component={Forget} />
          <Route exact path="/forgot" component={Forget} />

          {/* <PrivateRoute profileData={this.state} path = "/profile" component={Profile}/> */}
          <Route
            exact
            path="/editprofile"
            render={props => (
              <EditProfile {...props} refreshHeader={this.refreshHeader} />
            )}
          />
          <PrivateRouteStudent
            exact
            path="/student/academic"
            component={AcademicProfile}
          />
          <PrivateRouteEmployer path="/employer/tasks" component={Projects} />
          <PrivateRouteEmployer path="/employer/payment" component={Payment} />
          <PrivateRouteEmployer
            path="/employer/payToStudent"
            component={PayToStudent}
          />
          <Route path="/tasks" component={Projects} />
          <PrivateRouteEmployer
            path="/employer/mytasks"
            component={EmployerNotifications}
          />
          <PrivateRouteEmployer
            path="/employer/notifications"
            component={EmployerUpdates}
          />
          <PrivateRouteEmployer
            path="/employer/edittasks"
            component={EditTasks}
          />

          <PrivateRouteStudent
            path="/student/notifications"
            component={StudentUpdates}
          />
          <PrivateRouteStudent
            path="/student/applications"
            component={EditApplications}
          />
          <Route path="/chatwindow" component={ChatWindow} />
          <PrivateRouteEmployer
            path="/employer/chatwindow"
            component={ChatWindow}
          />
          <PrivateRouteStudent
            path="/student/chatwindow"
            component={ChatWindow}
          />
          <PrivateRouteStudent
            path="/student/mytasks"
            component={StudentNotifications}
          />
          <PrivateRouteStudent path="/student/tasks" component={Projects} />
          <Route path="/taskdetail/:projectId" component={ProjectDetails} />
          <Route path="/profile/:_id" component={PublicProfile} />
          <Route path="/career/:_id" component={PublicDashboard} />

          <PrivateRouteStudent
            path="/student/taskdetail/:projectId"
            component={ProjectDetails}
          />
          <PrivateRouteEmployer
            path="/employer/taskdetail/:projectId"
            component={ProjectDetails}
          />
          <PrivateRouteEmployer
            path="/employer/proposal"
            component={Proposal}
          />
          {/* <Route exact path="/changepassword" component={ChangePassword} /> */}
          <Route path="/contract" component={EmployerContract} />
          <Route exact path="/blogs" component={BlogList} />
          <PrivateRouteEmployer
            path="/employer/contract"
            component={EmployerContract}
          />
          <PrivateRouteEmployer
            path="/employer/task/pending"
            component={Pending}
          />
          <PrivateRouteEmployer
            path="/employer/task/selected"
            component={Selected}
          />
          <PrivateRouteEmployer
            path="/employer/task/payments"
            component={Payments}
          />
          <PrivateRouteStudent
            path="/student/contract"
            component={StudentContract}
          />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/faqs" component={Faqs} />
          <PrivateRouteEmployer
            path="/employer/creativeproject/:_jid"
            component={EmployerCreativeProject}
          />
          <PrivateRouteEmployer
            path="/employer/profile"
            component={employerProfile}
          />
          <PrivateRouteStudent
            path="/student/profile"
            component={studentProfile}
          />
          {/* <PrivateRouteStudent path="/student/applyproject" component={ApplyProject}/> */}
          <PrivateRouteStudent
            path="/student/applyproject/:projectId"
            component={ApplyProject}
          />

          <PrivateRouteEmployer
            path="/employer/editprofile"
            component={employerEditProfile}
          />
          <PrivateRouteEmployer
            path="/employer/changepassword"
            component={ChangePassword}
          />
          <PrivateRouteEmployer
            path="/employer/createtask"
            component={projectpost}
          />
          <PrivateRouteEmployer
            path="/employer/uploads"
            component={EmployerUploads}
          />
          <PrivateRouteStudent
            path="/student/uploads"
            component={StudentUploads}
          />
          <PrivateRouteEmployer
            path="/employer/dashboard"
            component={employerDashboard}
          />
          <PrivateRouteStudent
            path="/student/dashboard"
            component={studentDashboard}
          />

          <Route path="/admin/login" component={AdminAuth} />
          <Route path="/blogs/:blog_id" component={BlogPage} />
          <Route path="/admin" component={AdminAuth} />
          <PrivateRouteAdmin
            path="/admin/dashboard"
            component={AdminDashboard}
          />
          <Route path="/support" component={Tickets} />
          <PrivateRouteAdmin
            path="/admin/edit/chats"
            component={EditChatEntity}
          />
          <PrivateRouteAdmin
            path="/admin/edit/faqs"
            component={EditFAQEntity}
          />
          <PrivateRouteAdmin
            path="/admin/edit/users"
            component={EditUserEntity}
          />
          <PrivateRouteAdmin
            path="/admin/edit/tasks"
            component={EditProjectEntity}
          />
          <PrivateRouteAdmin
            path="/admin/edit/bids"
            component={EditBidEntity}
          />
          <PrivateRouteAdmin
            path="/admin/edit/tags"
            component={EditTagEntity}
          />
          <PrivateRouteAdmin
            path="/admin/edit/blogs"
            component={EditBlogEntity}
          />
          <Footer />
          <NotificationContainer />
        </Router>
      </div>
    );
  }
}
export default App;
