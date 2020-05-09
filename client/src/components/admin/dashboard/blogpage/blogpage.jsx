import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab} from 'react-bootstrap';
import "./blogpage.css";
import {
  userInstance
} from "../../../../axios/axiosconfig";
import { Link } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import { trackActivity } from "../../../../functions/functions";

class BlogPage extends Component{
  constructor(props){
    super(props);
    this.state = {
      blog: {}
    }
  }

  componentWillMount(){
    this.getBlog();
  }

  getBlog = async()=>{
    const {blog_id} = this.props.match.params;
    if(!blog_id)
      this.props.history.push('/blogs');
    else{
      console.log('blog_id, ', blog_id)
      const res = await userInstance.post('/getBlogById', {uid:blog_id});
      if(res.data.code === 200){
        console.log('new message')
        trackActivity("read blog");
        this.setState({
          blog: res.data.blog_data
        })
      }else{
        console.log('reached req unwanted response')
      }
    }
  }

render(){
        return (
            <div className="dashboard-section">

                <div className="page-title">
                    <div className="container">
                        <h2>{this.state.blog.title}</h2>
                        <span>{this.state.blog.date}</span>
                    </div>
                </div>


                <div className="dashboard-container">

                    <div className="container">
                    <div className="row">

                        <div className="col-md-12">
                           <Summary summary={this.state.blog.summary}/>
                        </div>

                    </div>
                        <div className="row">

                            <div className="col-md-12">
                               <Content content={this.state.blog.content}/>
                            </div>

                        </div>
                    </div>

                </div>


            </div>
        )
    }
}
export default BlogPage;










class Content extends Component{

    render(){
            return (
                <div className="content">

                    <p>{this.props.content}</p>


                </div>
            )
        }
    }

    class Summary extends Component{

        render(){
                return (
                    <div className="summary">

                        <h3>{this.props.summary}</h3>

                    </div>
                )
            }
        }
