import React,{Component} from "react";
import {Button} from 'react-bootstrap';
import "../jobs/jobs.css";
import job_icon from "../../assets/images/job-icon.png";
import { Link } from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { userInstance } from "../../axios/axiosconfig";
import InputRange from 'react-input-range';

import "react-input-range/lib/css/index.css";



class Jobs extends Component{

    constructor(props){
        super(props);

        this.state = {
            items: [],
            filteredJobs: [],
            // companyInfo: [],
            // blockState: {
            //     wb: false,
            //     ob: false,
            //     cb: false
            // }
            wb: false,
            ob: false,
            cb: false,
            cpen: false,
            cpdm: false,
            cpwr: false,
            cptr: false,
            location: '',
            hr: false,
            fr: false
            
          };

        //   this.changeState = this.changeState.bind(this)
        }
        
      
        componentWillMount() {
            console.log('gonna mount anytime now')
          this.getProjects();
        }

        async componentWillUpdate(){
            
                

        }
      
        getProjects = async () => {
          console.log("1");
          let res = await userInstance.get("/jobsdata");
          console.log("2, ", res.data);
        //   await res.data.project_data.map(async item => {
        //     return (item.date = await this.getDiff(new Date(item.date), new Date()));
        //   });
      
          console.log('all posts, ', res.data.jobPosts);
      
          try {
            this.setState({ items: res.data.jobPosts, filteredJobs: res.data.jobPosts });
            console.log("state, ", this.state);
          } catch (error) {
            console.log(error);
          }
        
    }

    // changeState = (name, value)=>{
    //     console.log('main func')
    //     console.log(`name= ${name}, value= ${value}`)
    //     this.setState({
    //         [name] : value
    //     })

    //     console.log(`but state= ${this.state}`)
    //     console.log(`but ob= ${this.state.ob}`)
    //     console.log(`but cb= ${this.state.cb}`)
    // }

    // changeBlockState = async (blocks)=>{
    //     console.log('main func')
    //      console.log(`blockState= ${blocks}`)
    //     await this.setState({
    //         blockState:{
    //             wb: blocks.wb,
    //             ob: blocks.ob,
    //             cd: blocks.cb
    //         }
    //     })

    //     console.log(`but state.ob= ${this.state.blockState}`)
    //     console.log(`but state.wb= ${this.state.blockState[0]}`)
    //     console.log(`but state.cb= ${this.state.blockState.cb}`)
    // }

    changeBlockState = async(name, bool)=>{
        console.log('in root, ', name+ " "+ bool)
        console.log('before, ', this.state)
        await this.setState({
            [name]: bool
        })
        console.log('after, ', this.state)


        const {wb, ob, cb} = this.state;
            let jobs = this.state.items;
            //filterByBlocks...
            if(!(wb && ob && cb) && (wb || ob || cb)){  //not all but some are checked
                jobs = [];
                await this.state.items.forEach(async(job)=>{
                    if(wb && job.jobBlock === "Work Block")
                        await jobs.push(job);
                    if(ob && job.jobBlock === "Open Block")
                        await jobs.push(job);
                    if(cb && job.jobBlock === "Creative Block")
                        await jobs.push(job);
                })
            }

            this.setState({
                filteredJobs : jobs
            })
    }


    changeCpState = async(name, bool)=>{
        console.log('in root, ', name+ " "+ bool)
        console.log('before, ', this.state)
        await this.setState({
            [name]: bool
        })
        console.log('after, ', this.state)


        const {cpen, cpdm, cpwr, cptr} = this.state;
            let jobs = this.state.items;
            //filterByBlocks...
            if(!(cpen && cpdm && cpwr && cptr) && (cpen || cpdm || cpwr || cptr)){  //not all but some are checked
                jobs = [];
                await this.state.items.forEach(async(job)=>{
                    if(cpdm && job.candidateProfile === "Digital Marketing")
                        await jobs.push(job);
                    if(cpen && job.candidateProfile === "Engineering")
                        await jobs.push(job);
                    if(cpwr && job.candidateProfile === "Writing")
                        await jobs.push(job);
                    if(cptr && job.candidateProfile === "Translating")
                        await jobs.push(job);
                })
            }

            this.setState({
                filteredJobs : jobs
            })
    }

    changeRateState = async(name, bool)=>{
        console.log('in root, ', name+ " "+ bool)
        console.log('before, ', this.state)
        await this.setState({
            [name]: bool
        })
        console.log('after, ', this.state)


        const {hr, fr} = this.state;
            let jobs = this.state.items;
            //filterByBlocks...
            if(!(hr && fr) && (hr || fr)){  //not all but some are checked
                jobs = [];
                await this.state.items.forEach(async(job)=>{
                    if(hr && job.jobType === "Hourly")
                        await jobs.push(job);
                    if(fr && job.jobType === "Fixed")
                        await jobs.push(job);
                })
            }

            this.setState({
                filteredJobs : jobs
            })
    }

    handleLocationChange = async(loc)=>{
        console.log('inside root loc change')
        this.setState({
            location: loc
        })

        //filterByLocation...
        // let jobs = await this.state.filteredJobs.filter(async job=>{
        //     return job.jobLocation.includes(loc)
        // });

        let jobs = this.state.items;
        if(loc.length > 0){
            jobs = [];
            await this.state.items.forEach(async job=>{
                if(job.jobLocation.toLowerCase().includes(loc.toLowerCase()))
                    await jobs.push(job)
            })
        }


        console.log('new filtered, ', await jobs)

        this.setState({
            filteredJobs: await jobs
        })


    }


    render(){
            return (
                <div className="jobs-section">
                
                    <div className="page-title">
                        <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                            <span>Top Jobs</span>
                            <h2>Earn. Learn. Gain Experience.</h2>
                                <div className="login-signup">
                                    <Link className="job-login-btn" to={'/login'}>Login</Link>
                                    <Link className="job-register-btn" to={'/register'}>Register</Link>
                                </div> 
                            </div>
                           </div>                           
                        </div>
                    </div>
    
    
                    <div className="jobs-container">
                        
                        <div className="container">
                            <div className="row">
    
                                <div className="col-md-8">
                                   <JobListing jobs={this.state.filteredJobs}/>
                                </div>
    
                                <div className="col-md-4">
                                    <JobFilter changeRateState={this.changeRateState} changeBlockState={this.changeBlockState} changeCpState={this.changeCpState} handleLocationChange={this.handleLocationChange}/>
                                </div>
                                
                            </div>
                        </div>
    
                    </div>
    
    
                </div>
            )
        }
    }

export default Jobs;










class JobListing extends Component{
    
    constructor(props){
        super(props);

        // this.state = { 
        //     items: [
        //         {
        //             id: 1, 
        //             name: 'Media Management - SEO/SEM Experience', 
        //             type: 'Open Block', 
        //             location: 'Dublin', 
        //             price: '€25/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 2, 
        //             name: 'Marketing Focus Group Participant', 
        //             type: 'Work Block', 
        //             location: 'Amsterdam', 
        //             price: '€15/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 3, 
        //             name: 'French to English Translation Work', 
        //             type: 'Creative Block', 
        //             location: 'Dublin', 
        //             price: '€25/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 4, 
        //             name: 'Packaging Design Challenge', 
        //             type: 'Open Block', 
        //             location: 'Amsterdam', 
        //             price: '€15/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 5, 
        //             name: 'Mystery Shopper', 
        //             type: 'Work Block', 
        //             location: 'Amsterdam', 
        //             price: '€25/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 6, 
        //             name: 'Remote Customer Service - includes training & flexible hours', 
        //             type: 'Creative Block', 
        //             location: 'Dublin', 
        //             price: '€15/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 7, 
        //             name: 'Media Management - SEO/SEM Experience', 
        //             type: 'Work Block', 
        //             location: 'Amsterdam', 
        //             price: '€25/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 8, 
        //             name: 'French to English Translation Work', 
        //             type: 'Open Block', 
        //             location: 'Dublin', 
        //             price: '€15/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 9, 
        //             name: 'Marketing Focus Group Participant', 
        //             type: 'Work Block', 
        //             location: 'Amsterdam', 
        //             price: '€15/hr', 
        //             date: 'New'
        //         },
        //         {
        //             id: 10, 
        //             name: 'French to English Translation Work', 
        //             type: 'Creative Block', 
        //             location: 'Dublin', 
        //             price: '€25/hr', 
        //             date: 'New'
        //         },
        //     ]

        //  }
    }


    render() {
        return (
            <div className="job-listing">
               <div className="listings-container">
			
               {this.props.jobs.map((item, key) => (
                    // <Link key={item._id} className="listing" to={'/'}>
                    <Link key={item._id} className="listing" to={{
                        pathname: "/jobdetail",
                        job: item
                      }}>
                        <div class="listing-logo">
                            <img src={job_icon} alt=""/>
                        </div>

                        <div className="listing-title">
                            <h4>{item.jobTitle} <span className="listing-type">{item.jobBlock}</span></h4>
                            <ul className="listing-icons">
                                <li><i className="fa fa-map-marker"></i> {item.jobLocation}</li>
                                <li><i className="fa fa-money"></i> {item.jobValue}</li>
                                <li><div className="listing-date new">{item.taskDeadline}</div></li> {/*//replace with job creation date */}
                            </ul>
                        </div>
                    </Link>

                    ))}

		        </div> 
            </div>
        );
    }
}












class JobFilter extends Component{

    constructor(props) {
        super(props);
     
        this.state = {
            value: 200,
            location: ''
        };
      }


      componentDidMount(){
          console.log('alteast here')
        // const bs = this.props.blockState;
        // for(let k in bs) {
        //     console.log(`setting ${k} to ${bs[k]}`)
        //     document.getElementById(k).checked=bs[k];
        //  }
      }

      componentDidUpdate(){
        console.log('filter compo updated')
    }

    handleLocationChange = (e)=>{
        console.log('inside loc filter')
        console.log('loc, ', this.state.location)
        this.props.handleLocationChange(this.state.location)
    }

    //   handleChange = (e) => {
    //     // this.setState({ [e.target.name]: e.target.value })
    //     // this.props.changeState(e.target.name, e.target.checked)
    //     console.log('inside handler')
    //     console.log(document.getElementById('wb').checked)
    //     const blockState = {
    //         wb: document.getElementById('wb').checked,
    //         ob: document.getElementById('ob').checked,
    //         cb: document.getElementById('cb').checked
    //     }

    //     console.log('created blockState, ', blockState)
    //     this.props.changeBlockState(blockState)
    // }


    handleBlockChange = (e)=>{
        console.log(e.target.name+" "+e.target.checked)
        this.props.changeBlockState(e.target.name, e.target.checked);
    }

    handleRateChange = (e)=>{
        console.log(e.target.name+" "+e.target.checked)
        this.props.changeBlockState(e.target.name, e.target.checked);
    }

    handleCpChange = (e)=>{
        console.log(e.target.name+" "+e.target.checked)
        this.props.changeCpState(e.target.name, e.target.checked);
    }

    handleChange = e=>{
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render(){
        return (
            <div className="job-filter">
                
                
                <div className="widget">
                    <h4>Sort by</h4>


                    <select data-placeholder="Choose Category" className="chosen-select-no-single">
                        <option selected="selected" value="recent">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="expiry">Expiring Soon</option>
                        <option value="ratehigh">Hourly Rate – Highest First</option>
                        <option value="ratelow">Hourly Rate – Lowest First</option>
                    </select>

                </div>


                <div className="widget">
                    <h4>Location</h4>
                    <div class = "form-group">
                        <input type="text" name="location" placeholder="Location" onChange={this.handleChange} value={this.state.location}/>

                        <Button className="filter-btn" onClick={this.handleLocationChange}>
                            Filter
                        </Button>
                    </div>
                </div>


                <div className="widget">
                    <h4>Blocks</h4>

                    <ul className="checkboxes">
                        <li>
                            <Form.Check name='wb' onClick={this.handleBlockChange} type="checkbox" id="wb" label="Work Block" />
                        </li>
                        <li>
                            <Form.Check name='ob' onChange={this.handleBlockChange} type="checkbox" id="ob" label="Open Block" />
                        </li>
                        <li>
                            <Form.Check name='cb' onClick={this.handleBlockChange} type="checkbox" id="cb" label="Creative Block" />
                        </li>

                    </ul>

                </div>

                <div className="widget">
                    <h4>Competences</h4>

                    <ul className="checkboxes">
                        <li>
                            <Form.Check name="cpen" onClick={this.handleCpChange} type="checkbox" id="check-5" label="Engineering" />
                        </li>
                        <li>
                            <Form.Check name="cpdm" onClick={this.handleCpChange} type="checkbox" id="check-6" label="Digital Marketing" />
                        </li>
                        <li>
                            <Form.Check name="cpwr" onClick={this.handleCpChange} type="checkbox" id="check-7" label="Writing" />
                        </li>
                        <li>
                            <Form.Check name="cptr" onClick={this.handleCpChange} type="checkbox" id="check-8" label="Translating" />
                        </li>
                    </ul>

                </div>




                <div className="widget">
                    <h4>Rate</h4>

                    <ul className="checkboxes">
                        <li>
                            <Form.Check name="hr" onClick={this.handleRateChange}type="checkbox" id="check-9" label="Hourly" />
                        </li>
                        <li>
                            <Form.Check name="fr" onClick={this.handleRateChange}type="checkbox" id="check-10" label="Fix Rate" />
                        </li>
                       
                    </ul>

                </div>
                




                <div className="widget">
                    <h4>Duration</h4>

                    <div className="range-slider">
                        <InputRange
                        maxValue={500}
                        minValue={0}
                        value={this.state.value}
                        onChange={value => this.setState({ value })} />
                    </div>

                </div>





            </div>
        )
    }
}