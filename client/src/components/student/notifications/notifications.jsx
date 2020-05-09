import React, { Component } from "react";
import { Button } from "react-bootstrap";
import "../../projects/projects.css";
import job_icon from "../../../assets/images/job-icon.png";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { userInstance } from "../../../axios/axiosconfig";
import InputRange from "react-input-range";

import "react-input-range/lib/css/index.css";
import { studentInstance } from "../../../axios/axiosconfig";
import { formatDate } from "../../../functions/functions";

class StudentNotifications extends Component {
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
      location: "",
      checkedBlocks: { wb: false, ob: false, cb: false },
      checkedRates: { hr: false, fr: false },
      price: 500,
      sortBy: "recent"
    };
  }

  componentDidMount() {
    console.log("projects mounted");
  }

  componentDidUpdate() {
    if (this.state.loading) {
      const { index, limit, filteredJobs, total } = this.state;
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
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf("isemployer") === 0) {
        return true;
      }
    }
    return false;
  };

  megaChange = async () => {
    const { sortBy } = this.state;
    let jobs99 = this.state.items;
    console.log("fresh list, ", jobs99);
    if (
      sortBy === "recent" ||
      sortBy === "oldest" ||
      sortBy === "expiry" ||
      sortBy === "ratehigh" ||
      sortBy === "ratelow"
    ) {
      jobs99 = [];
      switch (sortBy) {
        case "recent":
          console.log("recent sort");
          //sort jobs newest to oldest
          console.log("recent switch");
          jobs99 = await this.state.items.sort(function(a, b) {
            return a.projectId.creationDate < b.projectId.creationDate
              ? 1
              : a.projectId.creationDate > b.projectId.creationDate
              ? -1
              : 0;
          });
          break;
        case "expiry":
          console.log("expired sort");
          //nearest deadline first
          jobs99 = this.state.items.filter(
            project => project.projectId.jobType === "Fixed"
          );
          console.log("fletretetdgjhf, ", jobs99);
          jobs99 = await jobs99.sort(function(a, b) {
            return a.projectId.taskDeadline < b.projectId.taskDeadline
              ? -1
              : a.projectId.taskDeadline > b.projectId.taskDeadline
              ? 1
              : 0;
          });
          break;
        case "oldest":
          console.log("old sort");
          //oldest to newest
          jobs99 = await this.state.items.sort(function(a, b) {
            return a.projectId.creationDate < b.projectId.creationDate
              ? -1
              : a.projectId.creationDate > b.projectId.creationDate
              ? 1
              : 0;
          });
          break;
        case "ratehigh":
          console.log("brand sort");

          //price high to low
          console.log(this.state.items[0].projectId.jobType === "Hourly");

          jobs99 = this.state.items.filter(
            project => project.projectId.jobType === "Hourly"
          );
          console.log("fletretetdgjhf, ", jobs99);
          jobs99 = await jobs99.sort(function(a, b) {
            return a.projectId.jobValue < b.projectId.jobValue
              ? 1
              : a.projectId.jobValue > b.projectId.jobValue
              ? -1
              : 0;
          });
          break;
        case "ratelow":
          console.log("cheap sort");

          //price low to high
          jobs99 = this.state.items.filter(
            project => project.projectId.jobType === "Hourly"
          );
          console.log("fletretetdgjhf, ", jobs99);
          jobs99 = await jobs99.sort(function(a, b) {
            return a.projectId.jobValue < b.projectId.jobValue
              ? -1
              : a.projectId.jobValue > b.projectId.jobValue
              ? 1
              : 0;
          });
          break;
      }
    }
    console.log("sorted jobs, ", jobs99);

    //filter by blocks
    let jobs = jobs99;
    //filterByBlocks...
    console.log("checked blocks, ", this.state.checkedBlocks);
    const blockValues = Object.values(this.state.checkedBlocks);
    if (blockValues.includes(true) && blockValues.includes(false)) {
      //not all but some are checked
      jobs = [];
      await jobs99.forEach(async job => {
        if (
          job.projectId.jobBlock === "Work Block" &&
          this.state.checkedBlocks["wb"] === true
        )
          jobs.push(job);
        if (
          job.projectId.jobBlock === "Open Block" &&
          this.state.checkedBlocks["ob"] === true
        )
          jobs.push(job);
        if (
          job.projectId.jobBlock === "Creative Block" &&
          this.state.checkedBlocks["cb"] === true
        )
          jobs.push(job);
      });
    }

    console.log("jobs, ", jobs);

    let jobs2 = jobs;
    //filterByBlocks...
    console.log("checked suggestions, ", this.state.checkedSuggestions);
    const suggestionValues = Object.values(this.state.checkedSuggestions);
    if (suggestionValues.includes(true) && suggestionValues.includes(false)) {
      //not all but some are checked
      console.log("some suggestions checked, ", suggestionValues);
      jobs2 = [];
      await jobs.forEach(async job => {
        let once = false;
        if (job.candidateProfile && job.candidateProfile.length > 0) {
          await job.projectId.candidateProfile.forEach(async cp => {
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
        // else{
        //   jobs2.push(job);
        // }
      });
    }

    console.log("job2, ", jobs2);

    let jobs3 = jobs2;
    //filterByBlocks...
    console.log("checked rates, ", this.state.checkedRates);
    const rateValues = Object.values(this.state.checkedRates);
    if (rateValues.includes(true) && rateValues.includes(false)) {
      jobs3 = [];
      await jobs2.forEach(async job => {
        if (
          job.projectId.jobType === "Hourly" &&
          this.state.checkedRates["hr"] === true
        )
          jobs3.push(job);
        if (
          job.projectId.jobType === "Fixed" &&
          this.state.checkedRates["fr"] === true
        )
          jobs3.push(job);
      });
    }

    console.log("jobs3, ", jobs3);

    const { price } = this.state;
    // let jobs = this.state.items;
    //filterByBlocks...
    // if(value > 0){  //not all but some are checked
    let jobs4 = [];
    await jobs3.forEach(async proposal => {
      const job = proposal.projectId;
      if (job.jobValue <= price) await jobs4.push(proposal);
    });
    // }

    const { location } = this.state;
    let jobs5 = jobs4;
    if (location.length > 0) {
      jobs5 = [];
      await jobs4.forEach(async proposal => {
        const job = proposal.projectId;
        if (job.jobLocation.toLowerCase().includes(location.toLowerCase()))
          await jobs5.push(proposal);
      });
    }

    console.log("new filtered, ", await jobs5);

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
    if (!this.state.refreshing) {
      if (!this.state.loading) {
        this.setState({ refreshing: true });
      }
      const { index, limit } = this.state;
      console.log("1");
      let res = await studentInstance.post("/myProjects");
      console.log("2, ", res.data);

      console.log("all posts, ", res.data.projects);

      const suggestions = res.data.suggestions;
      console.log("res.data= ", res.data);
      console.log("suggestions= ", suggestions);
      let checkedSuggestions = {};
      await suggestions.forEach(s => {
        checkedSuggestions[s.name] = false;
      });
      console.log("checkedSuggestions, ", checkedSuggestions);

      const items = res.data.projects;
      const paginated = items.slice(0 * limit, index * limit);

      try {
        this.setState({
          paginated,
          total: items.length,
          refreshing: false,
          suggestions,
          checkedSuggestions,
          location: "",
          checkedBlocks: { wb: false, ob: false, cb: false },
          checkedRates: { hr: false, fr: false },
          price: 500,
          sortBy: "recent",
          items: res.data.projects,
          index: 1,
          limit: 10,
          filteredJobs: res.data.projects,
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

  changeLoadingState = st => {
    this.setState({ loading: st });
  };

  handleLocationChange = async loc => {
    console.log("inside root loc change");
    this.setState({
      location: loc
    });

    //filterByLocation...
    // let jobs = await this.state.filteredJobs.filter(async job=>{
    //     return job.projectId.jobLocation.includes(loc)
    // });
    this.megaChange();
  };

  render() {
    return (
      <div className="jobs-section">
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
                    <i className="active">
                      {this.state.index +
                        " / " +
                        (Math.ceil(this.state.total / this.state.limit) > 0
                          ? "" + Math.ceil(this.state.total / this.state.limit)
                          : 1)}
                    </i>
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
                  <div className="col-md-1">
                    <i
                      class="fa fa-refresh fa-fw fa-2x"
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
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <JobFilter
                  changeSortByState={this.changeSortByState}
                  price={this.state.price}
                  changePriceState={this.changePriceState}
                  changeRateState={this.changeRateState}
                  changeBlockState={this.changeBlockState}
                  changeCpState={this.changeCpState}
                  handleLocationChange={this.handleLocationChange}
                  competences={this.state.suggestions}
                  checkedBlocks={this.state.checkedBlocks}
                  checkedRates={this.state.checkedRates}
                  checkedSuggestions={this.state.checkedSuggestions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default StudentNotifications;

class JobListing extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getProjects();
  }

  componentDidUpdate() {
    if (this.props.loading && !this.props.refreshing) {
      this.props.changeLoadingState(false);
    }
  }

  custom_path = status => {
    return status === 0 ? "/student/mytasks" : "/student/contract";
  };

  render() {
    const { index, limit } = this.props;
    return (
      <div className="job-listing">
        <div className="listings-container">
          {this.props.jobs.map((item, i) => (
            // <Link key={item._id} className="listing" to={'/'}>
            <Link
              key={item._id}
              className="listing"
              to={{
                // pathname: this.custom_path(item.status),
                pathname: "/student/contract",
                job: item
              }}
            >
              <div class="listing-logo">
                <img
                  src={"http://3.133.60.237:3001/" + item.employerId.photo[0]}
                  alt=""
                />
              </div>

              <div className="listing-title">
                <h4>
                  {item.projectId.jobTitle}{" "}
                  <span className="listing-type">
                    {item.status === 0
                      ? "Pending Approval"
                      : item.status >= 4
                      ? "Finished"
                      : "Active"}
                  </span>
                </h4>
                <ul className="listing-icons">
                  <li>
                    <i className="fa fa-map-marker"></i>{" "}
                    {item.projectId.jobLocation}
                  </li>
                  <li>
                    <i className="fa fa-money"></i> €{item.projectId.jobValue}
                    .00 EUR
                  </li>
                  <li>
                    <div className="listing-date new">
                      {/* {item.projectId.jobType === "Hourly"
                        ? item.projectId.numberOfHours + " hr"
                        : item.projectId.taskDeadline} */}
                      {formatDate(item.projectId.creationDate)}
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
    console.log(e.target.name + " " + e.target.checked);
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
            <option selected="selected" value="recent">
              Newest
            </option>
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
