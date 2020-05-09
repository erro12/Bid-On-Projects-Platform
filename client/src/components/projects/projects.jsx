import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "./projects.css";
import job_icon from "../../assets/images/job-icon.png";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { isemployer, differenceInDays, formatDate } from "../../functions/functions";
import { userInstance, studentInstance } from "../../axios/axiosconfig";
import InputRange from "react-input-range";

import "react-input-range/lib/css/index.css";

class Projects extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      refreshing: false,
      total: 1,
      index: 1,
      limit: 10,
      items: [],
      paginated: [],
      filteredJobs: [],
      suggestions: [],
      checkedSuggestions: {},
      checkedBlocks: { wb: false, ob: false, cb: false },
      checkedRates: { hr: false, fr: false },
      location: "",
      price: 500,
      sortBy: "recent"
    };
  }

  componentDidMount() {
    console.log("projects mounted");
  }

  componentDidUpdate() {
    if (this.state.loading) {
      const { index, limit, filteredJobs } = this.state;
      // let ind = index;
      // if (index <= 0 && total >= 1) {
      //   ind = 1;
      // }
      const paginated = filteredJobs.slice((index - 1) * limit, index * limit);
      this.setState({
        paginated
        // index: ind
      });
    }
  }

  async componentWillMount() {
    console.log("gonna mount anytime now");
    await this.getProjects();
    await this.megaChange();
  }

  nextPage = () => {
    console.log(this.state.total);
    console.log(this.state.limit);
    console.log(this.state.total / this.state.limit);
    if (
      !this.state.loading &&
      !this.state.refreshing &&
      this.state.index < this.state.total / this.state.limit
    ) {
      this.setState({
        index: this.state.index + 1,
        loading: true
      });
    }
  };

  prevPage = () => {
    if (!this.state.loading && !this.state.refreshing && this.state.index > 1) {
      this.setState({
        index: this.state.index - 1,
        loading: true
      });
    }
  };

  isloggedin = () => {
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf("isemployer") == 0) {
        return true;
      }
    }
    return false;
  };

  megaChange = async () => {
    //sort

    const { sortBy } = this.state;
    let jobs99 = this.state.items;
    if (
      sortBy == "recent" ||
      sortBy == "oldest" ||
      sortBy == "expiry" ||
      sortBy == "ratehigh" ||
      sortBy == "ratelow"
    ) {
      jobs99 = [];
      switch (sortBy) {
        case "recent":
          //sort jobs newest to oldest
          console.log("recent switch");
          jobs99 = await this.state.items.sort(function(a, b) {
            return a.creationDate < b.creationDate
              ? 1
              : a.creationDate > b.creationDate
              ? -1
              : 0;
          });
          break;
        case "expiry":
          //nearest deadline first
          jobs99 = this.state.items.filter(
            project => project.jobType === "Fixed"
          );
          jobs99 = await jobs99.sort(function(a, b) {
            return a.taskDeadline < b.taskDeadline
              ? -1
              : a.taskDeadline > b.taskDeadline
              ? 1
              : 0;
          });
          break;
        case "oldest":
          //oldest to newest
          jobs99 = await this.state.items.sort(function(a, b) {
            return a.creationDate < b.creationDate
              ? -1
              : a.creationDate > b.creationDate
              ? 1
              : 0;
          });
          break;
        case "ratehigh":
          //price high to low
          jobs99 = this.state.items.filter(
            project => project.jobType === "Hourly"
          );
          jobs99 = await jobs99.sort(function(a, b) {
            return a.jobValue < b.jobValue
              ? 1
              : a.jobValue > b.jobValue
              ? -1
              : 0;
          });
          break;
        case "ratelow":
          //price low to high
          jobs99 = this.state.items.filter(
            project => project.jobType === "Hourly"
          );
          jobs99 = await jobs99.sort(function(a, b) {
            return a.jobValue < b.jobValue
              ? -1
              : a.jobValue > b.jobValue
              ? 1
              : 0;
          });
          break;
      }
    }
    console.log("sorted jobs, ", jobs99);

    //filter by block
    let jobs = jobs99;
    //filterByBlocks...

    console.log("checked blocks, ", this.state.checkedBlocks);
    const blockValues = Object.values(this.state.checkedBlocks);
    if (blockValues.includes(true) && blockValues.includes(false)) {
      //not all but some are checked
      jobs = [];
      await jobs99.forEach(async job => {
        if (
          job.jobBlock === "Work Block" &&
          this.state.checkedBlocks["wb"] === true
        )
          jobs.push(job);
        if (
          job.jobBlock === "Open Block" &&
          this.state.checkedBlocks["ob"] === true
        )
          jobs.push(job);
        if (
          job.jobBlock === "Creative Block" &&
          this.state.checkedBlocks["cb"] === true
        )
          jobs.push(job);
      });
    }

    console.log("jobs, ", jobs);
    //filter by competence
    let jobs2 = jobs;
    console.log("checked suggestions, ", this.state.checkedSuggestions);
    const suggestionValues = Object.values(this.state.checkedSuggestions);
    if (suggestionValues.includes(true) && suggestionValues.includes(false)) {
      //not all but some are checked
      jobs2 = [];
      await jobs.forEach(async job => {
        let once = false;
        console.log("here is candidateProfile, ", job.candidateProfile);
        if (job.candidateProfile && job.candidateProfile.length > 0) {
          await job.candidateProfile.forEach(async cp => {
            console.log(
              "comparing, ",
              cp,
              " and, ",
              this.state.checkedSuggestions[cp.name]
            );
            console.log(once, "== once");
            if (!once && this.state.checkedSuggestions[cp.name] === true) {
              if (once) console.log("yet again");
              jobs2.push(job);
              once = true;
            }
          });
        }
        //  else {
        //   jobs2.push(job);
        // }
      });
    }

    console.log("job2, ", jobs2);

    //filter by location
    const { location } = this.state;
    let jobs3 = jobs2;
    console.log("for location, ", location);
    if (location.length > 0) {
      jobs3 = [];
      await jobs2.forEach(async job => {
        if (job.jobLocation.toLowerCase().includes(location.toLowerCase()))
          await jobs3.push(job);
      });
    }

    console.log("jobs3, ", jobs3);
    //filter by price
    const { price } = this.state;
    let jobs4 = [];
    await jobs3.forEach(async job => {
      if (job.jobValue <= price) await jobs4.push(job);
    });

    let jobs5 = jobs4;
    //filterByBlocks...

    console.log("checked rates, ", this.state.checkedRates);
    const rateValues = Object.values(this.state.checkedRates);
    if (rateValues.includes(true) && rateValues.includes(false)) {
      jobs5 = [];
      await jobs4.forEach(async job => {
        if (job.jobType === "Hourly" && this.state.checkedRates["hr"] === true)
          jobs5.push(job);
        if (job.jobType === "Fixed" && this.state.checkedRates["fr"] === true)
          jobs5.push(job);
      });
    }

    console.log("jobs5, ", jobs5);

    if (this.state.index > Math.ceil(jobs5.length / this.state.limit)) {
      this.state.index =
        Math.ceil(jobs5.length / this.state.limit) > 0
          ? Math.ceil(jobs5.length / this.state.limit)
          : 1;
    }

    const { index, limit } = this.state;
    const paginated = jobs5.slice((index - 1) * limit, index * limit);

    this.setState({
      filteredJobs: await jobs5,
      paginated,
      total: jobs5.length
    });
  };

  getProjects = async () => {
    console.log("1");
    if (!this.state.refreshing) {
      if (!this.state.loading) {
        this.setState({ refreshing: true });
      }
      const { index, limit } = this.state;
      let res = null;
      res = await userInstance.get("/jobsdata");
      console.log("2, ", res.data);

      console.log("all posts, ", res.data.jobPosts);
      const suggestions = res.data.suggestions;
      let checkedSuggestions = {};
      await suggestions.forEach(s => {
        checkedSuggestions[s.name] = false;
      });

      const items = res.data.jobPosts;
      const paginated = items.slice(0 * limit, index * limit);

      try {
        this.setState({
          paginated,
          total: items.length,
          refreshing: false,
          location: "",
          checkedBlocks: { wb: false, ob: false, cb: false },
          checkedRates: { hr: false, fr: false },
          price: 500,
          sortBy: "recent",
          suggestions,
          checkedSuggestions,
          index: 1,
          limit: 10,
          items: res.data.jobPosts,
          filteredJobs: res.data.jobPosts,
          loading: false
        });
        console.log("state, ", this.state);
      } catch (error) {
        console.log(error);
      }
    }
  };

  changeBlockState = async (name, bool) => {
    console.log("in root, ", name + " " + bool);
    let cb = this.state.checkedBlocks;
    cb[name] = bool;
    console.log("before, ", this.state);
    await this.setState({
      checkedBlocks: cb
    });
    console.log("after, ", this.state);
    this.megaChange();
  };

  changeCpState = async (name, bool) => {
    console.log("in root, ", name + " " + bool);
    let cs = this.state.checkedSuggestions;
    cs[name] = bool;
    console.log("before, ", this.state);
    await this.setState({
      checkedSuggestions: cs
    });
    console.log("after, ", this.state);
    this.megaChange();
  };

  changeRateState = async (name, bool) => {
    console.log("in root, ", name + " " + bool);
    let cr = this.state.checkedRates;
    cr[name] = bool;
    console.log("before, ", this.state);
    await this.setState({
      checkedRates: cr
    });
    console.log("after, ", this.state);
    this.megaChange();
  };

  changePriceState = async value => {
    console.log("in root, ", value);
    console.log("before, ", this.state);
    await this.setState({
      price: value
    });
    console.log("after, ", this.state);

    this.megaChange();
  };

  changeSortByState = async value => {
    console.log("in root, ", value);
    console.log("before, ", this.state);
    await this.setState({
      sortBy: value
    });
    console.log("after, ", this.state);
    this.megaChange();
  };

  handleLocationChange = async loc => {
    console.log("inside root loc change, ", loc);
    await this.setState({
      location: loc
    });
    this.megaChange();
  };

  changeLoadingState = st => {
    this.setState({ loading: st });
  };

  render() {
    return (
      <div className="jobs-section">
        <div className="page-title">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <span>Top Jobs</span>
                <h2>Earn. Learn. Gain Experience.</h2>
                {!this.isloggedin() && (
                  <div className="login-signup">
                    <Link className="job-login-btn" to={"/login"}>
                      Login
                    </Link>
                    <Link className="job-register-btn" to={"/register"}>
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="jobs-container">
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <div className="row">
                  <div className="col-md-11 pagination">
                  <i
                    class="fa fa-chevron-left employe-button"
                    aria-hidden="true"
                    onClick={this.prevPage}
                  ></i>
                    <i className="active">{this.state.index +
                      " / " +
                      (Math.ceil(this.state.total / this.state.limit) > 0
                        ? "" + Math.ceil(this.state.total / this.state.limit)
                        : 1)}</i>
                    <i
                      class="fa fa-chevron-right employe-button"
                      aria-hidden="true"
                      onClick={this.nextPage}
                    ></i>{" "}
                    {this.state.loading && <b>loading...</b>}
                    {!this.state.loading && this.state.refreshing && (
                      <b>refreshing...</b>
                    )}
                  </div>
                  <div className="col-md-1 fa-2x">
                    <i
                      class="fa fa-refresh fa-fw"
                      aria-hidden="true"
                      onClick={this.getProjects}
                    ></i>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                  <JobListing
                    index={this.state.index}
                    limit={this.state.limit}
                    loading={this.state.loading}
                    refreshing={this.state.refreshing}
                    changeLoadingState={this.changeLoadingState}
                    jobs={this.state.paginated}
                    getProjects={this.getProjects}
                  />{" "}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <JobFilter
                  changeSortByState={this.changeSortByState}
                  changePriceState={this.changePriceState}
                  price={this.state.price}
                  changeRateState={this.changeRateState}
                  changeBlockState={this.changeBlockState}
                  changeCpState={this.changeCpState}
                  handleLocationChange={this.handleLocationChange}
                  competences={this.state.suggestions}
                  checkedSuggestions={this.state.checkedSuggestions}
                  checkedBlocks={this.state.checkedBlocks}
                  checkedRates={this.state.checkedRates}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Projects;

class JobListing extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    if (this.props.loading && !this.props.refreshing) {
      this.props.changeLoadingState(false);
    }
  }

  render() {
    return (
      <div className="job-listing">
        <div className="listings-container">
          {this.props.jobs.map((item, key) => (
            // <Link key={item._id} className="listing" to={'/'}>
            <Link
              key={item._id}
              className="listing"
              to={{
                pathname: `/taskdetail/${item._id}`,
                job: item
              }}
            >
              <div class="listing-logo">
                {/* <img src={job_icon} alt="" /> */}
                <img
                  src={"http://3.133.60.237:3001/" + item.createdBy.photo[0]}
                  alt=""
                />
              </div>

              <div className="listing-title">
                <h4>
                  {item.jobTitle}{" "}
                  <span className="listing-type">{item.jobBlock}</span>
                </h4>
                <ul className="listing-icons">
                  <li>
                    <i class="fas fa-briefcase"></i>
                    {item.createdBy.fname + " " + item.createdBy.lname}
                  </li>
                  <li>
                    <i className="fa fa-map-marker"></i>{" "}
                    {item.jobLocation === "Remote Work"
                      ? "Remote"
                      : item.jobLocation}
                  </li>
                  <li>
                    <i className="fa fa-money"></i> €{item.jobValue}.00 EUR
                  </li>
                  <li>
                    <div className="listing-date new">
                      {/* {item.jobType === "Hourly"
                        ? item.numberOfHours + " hr"
                        : item.taskDeadline} */}
                        {formatDate(item.creationDate)}
                    </div>
                  </li>{" "}
                  {/*//replace with job creation date */}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
}

class JobFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: 500,
      location: ""
    };
  }

  componentDidMount() {
    console.log("alteast here");
  }

  componentDidUpdate() {
    console.log("filter compo updated");
  }

  handleLocationChange = e => {
    console.log("inside loc filter");
    console.log("loc, ", this.state.location);
    this.props.handleLocationChange(this.state.location);
  };

  handleBlockChange = e => {
    console.log(e.target.name + " " + e.target.checked);
    this.props.changeBlockState(e.target.name, e.target.checked);
  };

  handleRateChange = e => {
    console.log(e.target.name + " " + e.target.checked);
    this.props.changeRateState(e.target.name, e.target.checked);
  };

  handlePriceChange = value => {
    console.log("filter for price,  " + value);
    this.props.changePriceState(value);

    this.setState({
      value
    });
  };

  handleCpChange = e => {
    this.props.changeCpState(e.target.name, e.target.checked);
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  sortBy = e => {
    console.log(e.target.value);
    this.props.changeSortByState(e.target.value);
  };

  render() {
    return (
      <div className="job-filter">
        <div className="widget">
          <h4>Sort by</h4>

          <select
            data-placeholder="Choose Category"
            className="chosen-select-no-single"
            onChange={this.sortBy}
          >
            <option value="recent">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="expiry">Expiring Soon</option>
            <option value="ratehigh">Hourly Rate – Highest First</option>
            <option value="ratelow">Hourly Rate – Lowest First</option>
          </select>
        </div>

        <div className="widget">
          <h4>Location</h4>
          <div class="form-group">
            <input
              type="text"
              name="location"
              placeholder="Location"
              onChange={this.handleChange}
              value={this.state.location}
            />

            <Button className="filter-btn" onClick={this.handleLocationChange}>
              Filter
            </Button>
          </div>
        </div>

        <div className="widget">
          <h4>Blocks</h4>

          <ul className="checkboxes">
            <li>
              <Form.Check
                name="wb"
                onClick={this.handleBlockChange}
                type="checkbox"
                id="wb"
                label="Work Block"
                checked={this.props.checkedBlocks["wb"] ? true : false}
              />
            </li>
            <li>
              <Form.Check
                name="ob"
                onChange={this.handleBlockChange}
                type="checkbox"
                id="ob"
                label="Open Block"
                checked={this.props.checkedBlocks["ob"] ? true : false}
              />
            </li>
            <li>
              <Form.Check
                name="cb"
                onClick={this.handleBlockChange}
                type="checkbox"
                id="cb"
                label="Creative Block"
                checked={this.props.checkedBlocks["cb"] ? true : false}
              />
            </li>
          </ul>
        </div>

        <div className="widget competences">
          <h4>Competences</h4>

          <ul className="checkboxes">
            {this.props.competences.map((cp, i) => (
              <Competence
                key={i}
                competence={cp}
                handleCpChange={this.handleCpChange}
                checkedSuggestions={this.props.checkedSuggestions}
              />
            ))}
          </ul>
        </div>

        <div className="widget">
          <h4>Rate</h4>

          <ul className="checkboxes">
            <li>
              <Form.Check
                name="hr"
                onClick={this.handleRateChange}
                type="checkbox"
                id="check-9"
                label="Hourly"
                checked={this.props.checkedRates["hr"] ? true : false}
              />
            </li>
            <li>
              <Form.Check
                name="fr"
                onClick={this.handleRateChange}
                type="checkbox"
                id="check-10"
                label="Fix Rate"
                checked={this.props.checkedRates["fr"] ? true : false}
              />
            </li>
          </ul>
        </div>

        <div className="widget">
          <h4>Price</h4>

          {/* <div className="range-slider">
                        <InputRange
                        maxValue={500}
                        minValue={0}
                        value={this.state.value}
                        onChange={value => this.setState({ value })} />
                    </div> */}

          <div className="range-slider">
            <InputRange
              maxValue={500}
              minValue={0}
              value={this.props.price}
              onChange={value => this.handlePriceChange(value)}
            />
          </div>
        </div>
      </div>
    );
  }
}

class Competence extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { competence } = this.props;
    console.log("competence in last , ", competence);
    return (
      <li>
        <Form.Check
          name={competence.name}
          onClick={this.props.handleCpChange}
          type="checkbox"
          id={competence.name}
          label={competence.name}
          checked={
            this.props.checkedSuggestions[competence.name] ? true : false
          }
        />
      </li>
    );
  }
}
