import React,{Component} from "react";
import {Navbar,Nav,NavDropdown,Form,Button,Tabs, Tab} from 'react-bootstrap';
import "../contract/contract.css";
import { Link } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { userInstance, employerInstance, studentInstance } from "../../axios/axiosconfig";

import io from 'socket.io-client';

const socket = io('http://3.133.60.237:3001/');

class ChatWindow extends Component{
    constructor(props){
        super(props);
        this.state = {
            messages: [],
            message: ''
        }
    }


    componentDidMount(){
        const {_ids} = this.props.location;
        // socket.on('connect', ()=>{
        socket.emit('createRoomForTwo', {code : _ids[0]+"_"+_ids[1]});

        console.log('chat mounted')
        socket.emit("load_messages", {code: _ids[0]+"_"+_ids[1]});
        socket.on("get_chat", this.loadChat);
        socket.on("new_message", this.addMessage);
        // })
    }

    // componentDidUpdate(){
    //     console.log(this.state.message)
    // }

    componentWillUnmount(){
        console.log('chat will unmount')
        socket.off("get_chat");
        socket.off("new_message");
    }

    loadChat = messages =>{
        console.log('about to load stuff, ', messages)
        this.setState({
            messages
        });
    }

    newMessage = () =>{
        console.log('emitting new message')
        let msg = this.state.message;
        // msg.replace(/\r\n|\r|\n/g,"<br />");
        // let msgs = this.state.messages;
        // msgs.push(msg);
        this.setState({
            // messages: msgs,
            message: ''
        })
        const {_ids} = this.props.location;
        socket.emit('new_message', {msg, code: _ids[0]+"_"+_ids[1]});
        // this.state.message=''
    }

    addMessage = (msg) =>{
        // msg.replace(/<br\s?\/?>/g,"\n");
        // console.log('received new msg, ', msg)
        // let msgs = this.state.messages;
        // msgs.push(msg);
        this.setState({
            messages: msg,
        })
    }


    render(){

        return(
            <React.Fragment>
                <h1>Chat Box!</h1>
                <ChatBox messages={this.state.messages}/>
                <textarea name = "messageBox" onChange={e => this.setState({message: e.target.value})} value = {this.state.message} placeholder="type here..."/>
                <button onClick={this.newMessage}>Send</button>
            </React.Fragment>
        )
    }
}

export default ChatWindow

class ChatBox extends Component{
    constructor(props){
        super(props);
    }

    render(){

            return (
                <div className="job-listing">
                   <div className="listings-container">
                   <h3>Messages</h3>
                   {this.props.messages.map((message, key) => (
                        // <Link key={item._id} className="listing" to={'/'}>
                        <div key={key} className="listing">
                            <div class="listing-logo">
                            </div>

                            <div className="listing-title">
                                <p>{message}</p>
                            </div>
                        </div>

                        ))}

                    </div>
                </div>
            );
    }
}
