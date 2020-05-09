import React, { Component } from "react";
import { userInstance } from "../../axios/axiosconfig";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Tabs,
  Tab
} from "react-bootstrap";
import "../faqs/faqs.css";
import employee from "../../assets/images/employe.jpg";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton
} from "react-accessible-accordion";
import "../../assets/css/linearicon.css";
import "react-accessible-accordion/dist/fancy-example.css";

class Faqs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      faqs: []
    };
  }

  componentWillMount() {
    this.getfaqs();
  }

  getfaqs = async () => {
    const res = await userInstance.get("/faqs");
    if (res.data.code === 200) {
      this.setState({
        faqs: res.data.faqs
      });
    }
  };

  render() {
    return (
      <div className="faqs-section">
        <div className="page-title">
          <div className="container">
            <h2>FAQ's</h2>
          </div>
        </div>

        <div className="faq-container">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="faq-box">
                  <i className="ln ln-icon-Speach-BubbleDialog"></i>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy
                  </p>
                  <Link className="faq-btn" to={"/"}>
                    Chat
                  </Link>
                </div>
              </div>

              <div className="col-md-6">
                <div className="faq-box">
                  <i className="ln ln-icon-Speach-BubbleAsking"></i>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy
                  </p>
                  <Link className="faq-btn" to={"/"}>
                    +33 6 12 25 49 87
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FaqsList faqs={this.state.faqs} />
      </div>
    );
  }
}
export default Faqs;

class FaqsList extends Component {
  render() {
    return (
      <div className="faqs-list">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h2>FAQ's</h2>
            </div>

            <div className="col-md-12">
              <Accordion>
                {this.props.faqs.map(faq => (
                  <FaqItem faq={faq} />
                ))}
                {/* <AccordionItem>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      What harsh truths do you prefer to ignore?
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p>
                      Exercitation in fugiat est ut ad ea cupidatat ut in
                      cupidatat occaecat ut occaecat consequat est minim minim
                      esse tempor laborum consequat esse adipisicing eu
                      reprehenderit enim.
                    </p>
                  </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      Is free will real or just an illusion?
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p>
                      In ad velit in ex nostrud dolore cupidatat consectetur ea
                      in ut nostrud velit in irure cillum tempor laboris sed
                      adipisicing eu esse duis nulla non.
                    </p>
                  </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      What harsh truths do you prefer to ignore?
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p>
                      Exercitation in fugiat est ut ad ea cupidatat ut in
                      cupidatat occaecat ut occaecat consequat est minim minim
                      esse tempor laborum consequat esse adipisicing eu
                      reprehenderit enim.
                    </p>
                  </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      Is free will real or just an illusion?
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p>
                      In ad velit in ex nostrud dolore cupidatat consectetur ea
                      in ut nostrud velit in irure cillum tempor laboris sed
                      adipisicing eu esse duis nulla non.
                    </p>
                  </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      What harsh truths do you prefer to ignore?
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p>
                      Exercitation in fugiat est ut ad ea cupidatat ut in
                      cupidatat occaecat ut occaecat consequat est minim minim
                      esse tempor laborum consequat esse adipisicing eu
                      reprehenderit enim.
                    </p>
                  </AccordionItemPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionItemHeading>
                    <AccordionItemButton>
                      Is free will real or just an illusion?
                    </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <p>
                      In ad velit in ex nostrud dolore cupidatat consectetur ea
                      in ut nostrud velit in irure cillum tempor laboris sed
                      adipisicing eu esse duis nulla non.
                    </p>
                  </AccordionItemPanel>
                </AccordionItem> */}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class FaqItem extends Component {
  render() {
    const { faq } = this.props;
    return (
      <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>{faq.ques}</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <p>{faq.ans}</p>
        </AccordionItemPanel>
      </AccordionItem>
    );
  }
}
