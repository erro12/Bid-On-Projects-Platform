import React, { Component } from "react";
import "../mytasksidepanel/mytasksidepanel.css";
import { Link } from "react-router-dom";

class MyTaskSidePanel extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('clicked target, ', this.props.target)
    let e=document.getElementById(this.props.target);
    if(e) {
      console.log('target locked, ', e)
      e.classList.add('link-active')
    }
  }

  render() {
    const { job, pending } = this.props;
    console.log("job, pending, ", job, pending);
    return (
      <div className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <ul data-submenu-title="">
            {this.props.pending === true && (
              <li>
                {/* {true && <li> */}
                <Link
                  to={{
                    pathname: "/employer/task/pending",
                    state: {
                      job: this.props.job,
                      pending: this.props.pending,
                      status: this.props.status
                    }
                  }}

                  id="pending"
                >
                  Pending
                </Link>
              </li>
            )}
            <li>
              <Link
                to={{
                  pathname: "/employer/task/selected",
                  state: {
                    job: this.props.job,
                    pending: this.props.pending,
                    status: this.props.status
                  }
                }}

                id="selected"
              >
                Selected
              </Link>
            </li>
            <li>
              {/*<Link to={{
                  pathname: "/employer/task/payments",
                  state: {
                    job: this.props.job,
                    pending: this.props.pending,
                    status: this.props.status
                  }
                }} id="payment">Payments</Link>*/}
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
export default MyTaskSidePanel;
