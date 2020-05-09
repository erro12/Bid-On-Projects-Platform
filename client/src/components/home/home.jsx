import React, { Component } from "react";
import { Button, Container, Row, Col, Carousel } from "react-bootstrap";
import { userInstance } from "../../axios/axiosconfig";
import { Link } from "react-router-dom";

import Slider from "react-slick";
import "../home/home.css";
import "../../assets/css/linearicon.css";
import logo1 from "../../assets/images/logo-01.png";
import logo2 from "../../assets/images/logo-02.png";
import logo3 from "../../assets/images/logo-03.png";
import logo4 from "../../assets/images/logo-04.png";
import logo5 from "../../assets/images/logo-05.png";
import logo6 from "../../assets/images/logo-06.png";
import { formatDate } from "../../functions/functions";
import bowsyIntro from "../../assets/videos/bowsy.mp4";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blogs: []
    };
  }

  componentDidMount() {
    console.log("full url, ", window.location.href);
    if (
      window.location.href.substring(
        window.location.href.lastIndexOf("#") + 1
      ) === "howItWorks"
    ) {
      let elmnt = document.getElementById("howItWorks");
      elmnt.scrollIntoView({ behavior: "smooth" });
    }

    this.getLatestBlogs();
  }

  getLatestBlogs = async () => {
    const res = await userInstance.get("/latestBlogs");
    if (res.data.code === 200) {
      this.setState({
        blogs: res.data.blogs
      });
    }
  };

  render() {
    var settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 5,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            initialSlide: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };

    return (
      <div className="home">
        <section class="home-banner">
          <div className="banner-img">
            <div className="container">
              <div className="banner">
                <div className="banner-text">
                  <h1>Work. Study. Your Way!</h1>
                  <p>
                    Bowsy provides students wih a new flexible way of working
                    that allows you to earn and learn through relevant work
                    experience with some of the worlds leading companies.
                    Register today to begin your new career!
                  </p>
                  <Button
                    className="employe-button"
                    onClick={() => this.props.history.push("/register")}
                  >
                    Register Now
                  </Button>{" "}
                  <Button
                    className="employe-button"
                    onClick={() => this.props.history.push("/tasks")}
                  >
                    Browse Tasks
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="howItWorks" class="how-it-works">
          <Container>
            <Row>
              <Col md={12}>
                <div className="page-heading">
                  <h2>
                    How does <span>Bowsy</span> work?
                  </h2>
                  <p>
                    Bowsy is a free platform for students only that provides
                    flexible tasks that you can work around your study. It
                    allows you to work with multiple companies on different
                    tasks that are relevant to your field of study (you decide)
                    while getting paid and building relevant experience for your
                    future career.
                  </p>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="how-it-work-box">
                  <div className="pic">
                    <i className="ln ln-icon-Business-ManWoman"></i>
                  </div>
                  <div className="how-it-work-box-content">
                    <h3>How is Bowsy Different?</h3>
                    <p>
                      Bowsy is an investment in your future. Unlike other
                      platforms, Bowsy is for students only and offers paid
                      tasks that are relevant to your field of study. Gain
                      valuable experience. Kickstart your career!
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="how-it-work-box">
                  <div className="pic">
                    <i className="ln ln-icon-Business-ManWoman"></i>
                  </div>
                  <div className="how-it-work-box-content">
                    <h3>How do I get paid?</h3>
                    <p>
                      Once you successfully complete a task, Bowsy will pay
                      immediately into your nominated bank account. No fuss. No
                      fees. We do not deduct any money from your pay!
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <div className="how-it-work-box">
                  <div className="pic">
                    <i className="ln ln-icon-Business-ManWoman"></i>
                  </div>
                  <div className="how-it-work-box-content">
                    <h3>How does the rating system work?</h3>
                    <p>
                      There is a 5 star mutual rating system which allows you to
                      rate a company based on your feedback for each task and
                      allows you to build a real CV based on your portfolio of
                      work with Bowsy when you graduate.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="how-it-work-box">
                  <div className="pic">
                    <i className="ln ln-icon-Business-ManWoman"></i>
                  </div>
                  <div className="how-it-work-box-content">
                    <h3>No More Skill Gaps?</h3>
                    <p>
                      Bowsy offers a wide range of tasks closely related to your
                      studies. Our main goal is to give students the opportunity
                      to acquire relevants skills and knowledge during their
                      studies, so they become highly qualified on the labour
                      market.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className="call-to-action">
          <div className="container">
            <div className="para-image">
              <h1>Work. Anytime. Anywhere.</h1>
              <p>
                Bowsy gives you the flexibility to manage your work around your
                study. Not the other way round. Find tasks and challenges that
                you can perform remotely so you dont even have to leave home!
              </p>
            </div>
          </div>
        </section>

        <section className="intro-video">
          <div className="container">
            {/* <div align="center" class="embed-responsive embed-responsive-16by9"> */}
            <video
              width="640"
              height="360"
              className="embed-responsive-item"
              controls
              autoplay
              loop
            >
              <source src={bowsyIntro} type="video/mp4" />
            </video>
            {/* </div> */}
          </div>
        </section>

        {this.state.blogs && (
          <section className="latest-blogs">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <h2>
                    <span>Our</span> Blogs
                  </h2>
                </div>
              </div>

              <div className="row">
                {this.state.blogs.map((blog, key) => (
                  <Blog key={key} blog={blog} />
                ))}
              </div>

              <div className="more-blogs">
                <Link
                  className="btn btn-secondary"
                  to={{
                    pathname: `/blogs`
                  }}
                >
                  SEE MORE
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="contact-us">
          <div className="container">
            <div className="row contact-us-row">
              <div className="col-md-12">
                <h2>
                  <span>Contact</span> us
                </h2>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <h3>Student Enquiries </h3> hello@bowsy.com
              </div>
              <div className="col-md-4">
                <h3>Employer Enquiries </h3> employers@bowsy.com
              </div>
              <div className="col-md-4">
                <h3>Call Us </h3> 0800 444 222
              </div>
            </div>
          </div>
        </section>

        <section className="our-companies">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="companies">
                  <h2>
                    <span>Companies</span> that work with us
                  </h2>
                  <div className="companies-container">
                    <Slider {...settings}>
                      <div>
                        <img src={logo1} alt="" />
                      </div>
                      <div>
                        <img src={logo2} alt="" />
                      </div>
                      <div>
                        <img src={logo3} alt="" />
                      </div>
                      <div>
                        <img src={logo4} alt="" />
                      </div>
                      <div>
                        <img src={logo5} alt="" />
                      </div>
                      <div>
                        <img src={logo6} alt="" />
                      </div>
                    </Slider>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
export default Home;

class Blog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { blog } = this.props;
    return (
      <div className="card col-md-4">
        <div className="card-body">
          <h3 className="card-title">
            {blog.title}{" "}
            <small class="card-subtitle mb-2 text-muted">
              {formatDate(blog.date)}
            </small>
          </h3>
          <span className="card-text">{blog.summary} </span>
          <Link
            className="card-link"
            to={{
              pathname: `/blogs/${blog._id}`,
              blog
            }}
          >
            <a>Read more</a>
          </Link>
        </div>
      </div>
    );
  }
}
