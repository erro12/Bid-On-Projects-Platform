//imports
import express from "express";
import adminModel from "../models/admin";
import jobPostModal from "../models/jobpost";
import {
  checkIfEmpty,
  signJwt,
  hashPassword,
  verifyHash
} from "../functions/functions";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { SMPTHOST, SMPTPORT, SMPTEMAIL, SMPTPASS } from "../config/smpt";
import { clientPath, serverPath } from "../config/keys";
import { userAuthCheck } from "../middlewares/middlewares";
import mongoose from "mongoose";
import { uploadProfileImage, uploadProfileVideo } from "../config/multerconfig";
import tagModal from "../models/tags";
import faqModal from "../models/faq";
import blogModal from "../models/blog";
import userModal from "../models/user";
import chatModel from "../models/chat";
import psModel from "../models/projectstatus";

const adminRouter = () => {
  //router variable for api routing
  const router = express.Router();

  //post request to login user
  router.post("/login", async (req, res) => {
    console.log("req boby", req.body);
    try {
      const { isValid } = checkIfEmpty(req.body);
      if (isValid) {
        const { email, password } = req.body;
        //finding user with email
        const isUserExists = await adminModel.findOne({
          email
        });
        if (isUserExists) {
          if (isUserExists.isvalid === false) {
            res.send({
              code: 403,
              msg: "This email is not verified"
            });
          } else {
            const isPasswordValid = await verifyHash(
              password,
              isUserExists.password
            );
            console.log("isPasswordValid", isPasswordValid);
            if (isPasswordValid) {
              //valid password
              const token = signJwt(isUserExists._id);
              res.cookie("adminToken", token, {
                maxAge: 999999999999,
                signed: true
              });
              console.log("Authenticated");
              res.send({
                code: 200,
                msg: "Authenticated"
              });
            } else {
              console.log("Invalid Login Details");
              res.send({
                code: 404,
                msg: "Invalid Login Details!"
              });
            }
          }
        } else {
          res.send({
            code: 404,
            msg: "User not found!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid request body"
        });
      }
    } catch (e) {
      res.send({
        code: 406,
        msg: "Some error has occured!"
      });
    }
  });


  router.post("/updatefaq", async (req, res) => {
    try {
      const { _id, ques, ans } = req.body;
      const { isValid } = checkIfEmpty(ques, ans);
      //if request body data is valid
      console.log("valid, ", isValid);
      if (isValid) {
        let faqExists = await faqModal.findOne({ ques });
        faqExists = faqExists ? !(_id == faqExists._id) : faqExists;

        if (!faqExists) {
          const faqData = await faqModal.findByIdAndUpdate(_id, { ques, ans });
          res.status(200).send({ code: 200, msg: "FAQ successfully updated" });
        } else {
          res.send({
            code: 400,
            msg: "Duplicate faq exists!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log("err in updatefaq, ", err);
      res.status(200).send({ code: 400, msg: "Some error occured" });
    }
  });

  router.post("/updateblog", async (req, res) => {
    try {
      const { _id, title, date, summary, content } = req.body;
      const { isValid } = checkIfEmpty(title, date, summary, content);
      //if request body data is valid
      console.log("valid, ", isValid);
      if (isValid) {
        let blogExists = await blogModal.findOne({ title });
        blogExists = blogExists ? !(_id == blogExists._id) : blogExists;
        if (!blogExists) {
          const blogData = await blogModal.findByIdAndUpdate(_id, {
            title,
            date,
            summary,
            content
          });
          res.status(200).send({ code: 200, msg: "Blog successfully updated" });
        } else {
          res.send({
            code: 400,
            msg: "Duplicate blog title exists!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log("err in updateblog, ", err);
      res.status(200).send({ code: 400, msg: "Some error occured" });
    }
  });

  router.post("/updatetag", async (req, res) => {
    try {
      const { _id, name } = req.body;
      const { isValid } = checkIfEmpty(name);
      //if request body data is valid
      console.log("valid, ", isValid);
      if (isValid) {
        let tagExists = await tagModal.findOne({ name });
        tagExists = tagExists ? !(_id == tagExists._id) : tagExists;

        if (!tagExists) {
          const tagData = await tagModal.findByIdAndUpdate(_id, { name });
          res.status(200).send({ code: 200, msg: "Tag successfully updated" });
        } else {
          res.send({
            code: 400,
            msg: "Duplicate tag exists!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log("err in updatetag, ", err);
      res.status(200).send({ code: 400, msg: "Some error occured" });
    }
  });

  router.post("/updateproject", async (req, res) => {
    try {
      // const { _id, name } = req.body;
      const { isValid } = checkIfEmpty(
        // name
        req.body.data
      );
      //if request body data is valid
      console.log("valid, ", isValid);
      if (isValid) {
        const tagData = await jobPostModal.findByIdAndUpdate(
          req.body.data._id,
          req.body.data
        );
        res
          .status(200)
          .send({ code: 200, msg: "Project successfully updated" });
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log("err in update project, ", err);
      res.status(200).send({ code: 400, msg: "Some error occured" });
    }
  });

  router.post("/updateuser", async (req, res) => {
    try {
      const { _id, fname, lname, email, isvalid } = req.body;
      const { isValid } = checkIfEmpty(fname, lname, email);
      //if request body data is valid
      console.log("valid, ", isValid);
      if (isValid) {
        let userExists = await userModal.findOne({
          email
        });
        console.log("user, ", userExists);
        userExists = userExists ? !(_id == userExists._id) : userExists;
        if (!userExists) {
          console.log("user not found");
          //generating email verification hex
          const email = req.body.email;
          const hash = crypto
            .createHmac("sha256", "verificationHash")
            .update(email)
            .digest("hex");

          console.log("d", hash);
          req.body.verificationhex = hash;
          console.log("ccc");
          // const userData = new userModal(req.body);
          const savedData = await userModal.findByIdAndUpdate(
            req.body._id,
            req.body
          );
          // console.log('e',userData);
          // const savedUser = await userData.save();
          console.log("savedUser", savedData);
          // savedUser["password"] = undefined;
          console.log("valid user, ", req.body.isvalid);
          const msg = req.body.isvalid
            ? "User updated successfully"
            : "Data saved successfully, please verify email address!";
          res.send({
            savedData,
            code: 200,
            msg
          });

          // let transporter = nodemailer.createTransport({
          //   pool: true,
          //   host: SMPTHOST,
          //   port: SMPTPORT,
          //   secure: true,
          //   auth: {
          //     user: SMPTEMAIL,
          //     pass: SMPTPASS
          //   }
          // });

          if (!req.body.isvalid) {
            let transporter = nodemailer.createTransport({
              service: "gmail",
              host: "smtp.ethereal.email",
              port: 587,
              secure: false,
              auth: {
                user: "websultest@gmail.com",
                pass: "Welcome@123"
              }
            });

            // let mailOptions = {
            //   from: SMPTEMAIL,
            //   to: savedUser.email,
            //   subject: "Please verify your email",
            //   text: `Please click on this link to verify your email address ${serverPath}/user/verify/${
            //     savedUser.verificationhex
            //     }`
            // };

            let mailOptions = {
              from: "t.valaucius@gmail.com",
              to: savedUser.email,
              subject: "Please verify your email",
              text: `Please click on this link to verify your email address ${serverPath}/user/verify/${savedUser.verificationhex}`
            };

            transporter.sendMail(mailOptions);
          } else {
            console.log("no need to verify");
          }
        } else {
          res.send({
            code: 400,
            msg: "Email already exists!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log("err in updatetag, ", err);
      res.status(200).send({ code: 400, msg: "Some error occured" });
    }
  });

  router.post("/updatebid", async (req, res) => {
    try {
      const {
        _id,
        // projectId,
        // studentId,
        // employerId,
        status,
        // bidDate
        detail
      } = req.body;

      const { isValid } = checkIfEmpty(
        // projectId,
        // studentId,
        // employerId,
        status
        // bidDate
      );
      //if request body data is valid
      console.log("valid, ", isValid);
      if (isValid) {
        let present = false;
        // const projectExists = await jobPostModal.findOneById(body.projectId);
        // if (!projectExists) present = true;
        // else {
        //   const studentExists = await userModal.findOneById(body.studentId);
        //   if (!studentExists) present = true;
        //   else {
        //     const employerExists = await userModal.findOneById(body.employerId);
        //     if (!employerExists) present = true;
        //   }
        // }
        if (!present) {
          // const bidExists = await psModel.findOne({
          //   projectId: body.projectId,
          //   studentId: body.studentId
          // });
          // console.log("bid, ", bidExists);
          if (!false) {
            console.log("bid not found");
            const tagData = await psModel.findByIdAndUpdate(_id, req.body);
            const pData = await jobPostModal.findById(tagData.projectId);
            if (
              (pData.jobBlock === "Work" || pData.jobBlock === "Open") &&
              tagData.status != 0
            ) {
              await jobPostModal.findByIdAndUpdate(bidData.projectId, {
                selected: [tagData._id],
                status: 1
              });
            }
            res
              .status(200)
              .send({ code: 200, msg: "Application successfully updated" });
          } else {
            res.send({
              code: 400,
              msg: "Duplicate application exists!"
            });
          }
        } else {
          res.send({ code: 400, msg: "A given id doesn't exist" });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log("err in updatebid, ", err);
      res.status(200).send({ code: 400, msg: "Some error occured" });
    }
  });

  router.post("/getchats", async (req, res) => {
    const { index, limit } = req.body;
    console.log("inside getchats panel");
    const chats = await chatModel
      .find()
      .skip((index - 1) * limit)
      .limit(limit)
      .populate({
        path: "employer",
        select: "fname lname"
      })
      .populate({
        path: "student",
        select: "fname lname"
      });
    const total = await chatModel.countDocuments();
    console.log("total, ", total);
    res.status(200).send({ code: 200, chats, total });
  });

  router.post("/getbids", async (req, res) => {
    const { index, limit, type, sortBy, desc } = req.body;
    let bids;
    const dir = desc ? -1 : 1;

    if (type != "None") {
      if (type === "Pending") {
        if (sortBy === "None") {
          bids = await psModel
            .find({ status: 0 })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate({
              path: "projectId",
              select: "jobTitle"
            })
            .populate({
              path: "studentId",
              select: "fname lname"
            })
            .populate({
              path: "employerId",
              select: "fname lname"
            })
            .exec();
        } else {
          console.log("sorting by, ", sortBy, dir);
          bids = await psModel
            .find({ status: 0 })
            .sort({ [sortBy]: dir })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate({
              path: "createdBy",
              select: "fname lname"
            })
            .populate({
              path: "projectId",
              select: "jobTitle"
            })
            .populate({
              path: "studentId",
              select: "fname lname"
            })
            .populate({
              path: "employerId",
              select: "fname lname"
            })
            .exec();
        }
      } else {
        if (sortBy === "None") {
          bids = await psModel
            .find({ status: { $ne: 0 } })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate({
              path: "projectId",
              select: "jobTitle"
            })
            .populate({
              path: "studentId",
              select: "fname lname"
            })
            .populate({
              path: "employerId",
              select: "fname lname"
            })
            .exec();
        } else {
          console.log("sorting by, ", sortBy, dir);
          bids = await psModel
            .find({ status: { $ne: 0 } })
            .sort({ [sortBy]: dir })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate({
              path: "createdBy",
              select: "fname lname"
            })
            .populate({
              path: "projectId",
              select: "jobTitle"
            })
            .populate({
              path: "studentId",
              select: "fname lname"
            })
            .populate({
              path: "employerId",
              select: "fname lname"
            })
            .exec();
        }
      }
    } else {
      if (sortBy === "None") {
        bids = await psModel
          .find()
          .skip((index - 1) * limit)
          .limit(limit)
          .populate({
            path: "projectId",
            select: "jobTitle"
          })
          .populate({
            path: "studentId",
            select: "fname lname"
          })
          .populate({
            path: "employerId",
            select: "fname lname"
          })
          .exec();
      } else {
        console.log("sorting by, ", sortBy, dir);
        bids = await psModel
          .find()
          .sort({ [sortBy]: dir })
          .skip((index - 1) * limit)
          .limit(limit)
          .populate({
            path: "createdBy",
            select: "fname lname"
          })
          .populate({
            path: "projectId",
            select: "jobTitle"
          })
          .populate({
            path: "studentId",
            select: "fname lname"
          })
          .populate({
            path: "employerId",
            select: "fname lname"
          })
          .exec();
      }
    }

    const total = await psModel.countDocuments();
    const projects = await jobPostModal.find();
    const students = await userModal.find({ isemployer: false });
    console.log("total, ", total);
    res.status(200).send({ code: 200, bids, total, projects, students });
  });

  router.post("/gettags", async (req, res) => {
    const { index, limit, sortBy, desc } = req.body;
    let tags;
    const dir = desc ? -1 : 1;

    if (sortBy === "None") {
      tags = await tagModal
        .find()
        .skip((index - 1) * limit)
        .limit(limit);
    } else {
      console.log("sorting by, ", sortBy, dir);
      tags = await tagModal
        .find()
        .sort({ [sortBy]: dir })
        .skip((index - 1) * limit)
        .limit(limit);
    }

    const total = await tagModal.countDocuments();
    console.log("total, ", total);
    res.status(200).send({ code: 200, tags, total });
  });



  router.post("/getOverview", async (req, res) => {
    

    const employers = await userModal.countDocuments({isemployer: true});
    const students = await userModal.countDocuments({isemployer: false});
    const verified = await userModal.countDocuments({isvalid: true});
    const blocked = await userModal.countDocuments({blocked: true});
    const tob = await jobPostModal.countDocuments({jobBlock: "Open Block"});
    const twb = await jobPostModal.countDocuments({jobBlock: "Work Block"});
    const tcb = await jobPostModal.countDocuments({jobBlock: "Creative Block"});
    const finished = await jobPostModal.countDocuments({status: 1});
    const ota = await jobPostModal.countDocuments({status: 0});
    const hourly = await jobPostModal.countDocuments({jobType: "Hourly"});
    const remote = await jobPostModal.countDocuments({jobLocation: "Remote Work"});
    const pA = await psModel.countDocuments({status: "0"});
    const tA = await psModel.countDocuments();

    res.status(200).send({ code: 200, employers, students, verified, blocked, tob, twb, tcb, finished, ota, hourly, remote, pA, tA });
  });



  router.post("/getfaqs", async (req, res) => {
    const { index, limit, sortBy, desc } = req.body;
    let faqs;
    const dir = desc ? -1 : 1;

    if (sortBy === "None") {
      faqs = await faqModal
        .find()
        .skip((index - 1) * limit)
        .limit(limit);
    } else {
      console.log("sorting by, ", sortBy, dir);
      faqs = await faqModal
        .find()
        .sort({ [sortBy]: dir })
        .skip((index - 1) * limit)
        .limit(limit);
    }

    const total = await faqModal.countDocuments();
    console.log("total, ", total);
    res.status(200).send({ code: 200, faqs, total });
  });

  router.post("/getblogs", async (req, res) => {
    const { index, limit, sortBy, desc } = req.body;
    let blogs;
    const dir = desc ? -1 : 1;

    if (sortBy === "None") {
      blogs = await blogModal
        .find()
        .skip((index - 1) * limit)
        .limit(limit);
    } else {
      console.log("sorting by, ", sortBy, dir);
      blogs = await blogModal
        .find()
        .sort({ [sortBy]: dir })
        .skip((index - 1) * limit)
        .limit(limit);
    }

    const total = await blogModal.countDocuments();
    console.log("total, ", total);
    res.status(200).send({ code: 200, blogs, total });
  });

  router.post("/getprojects", async (req, res) => {
    const { index, limit, type, sortBy, desc } = req.body;
    let projects;
    const dir = desc ? -1 : 1;

    if (type != "None") {
      if (sortBy === "None") {
        projects = await jobPostModal
          .find({ jobBlock: type })
          .skip((index - 1) * limit)
          .limit(limit)
          .populate({
            path: "createdBy",
            select: "fname lname"
          })
          .populate({
            path: "candidateProfile",
            select: "_id name"
          })
          .exec();
      } else {
        console.log("sorting by, ", sortBy, dir);
        projects = await jobPostModal
          .find({ jobBlock: type })
          .sort({ [sortBy]: dir })
          .skip((index - 1) * limit)
          .limit(limit)
          .populate({
            path: "createdBy",
            select: "fname lname"
          })
          .populate({
            path: "candidateProfile",
            select: "_id name"
          })
          .exec();
      }
    } else {
      if (sortBy === "None") {
        projects = await jobPostModal
          .find()
          .skip((index - 1) * limit)
          .limit(limit)
          .populate({
            path: "createdBy",
            select: "fname lname"
          })
          .populate({
            path: "candidateProfile",
            select: "_id name"
          })
          .exec();
      } else {
        console.log("sorting by, ", sortBy, dir);
        projects = await jobPostModal
          .find()
          .sort({ [sortBy]: dir })
          .skip((index - 1) * limit)
          .limit(limit)
          .populate({
            path: "createdBy",
            select: "fname lname"
          })
          .populate({
            path: "candidateProfile",
            select: "_id name"
          })
          .exec();
      }
    }

    const total = await jobPostModal.countDocuments();
    const employers = await userModal.find({ isemployer: true });
    console.log("total, ", total);
    res.status(200).send({ code: 200, projects, total, employers });
  });

  router.post("/getusers", async (req, res) => {
    const { index, limit, type, sortBy, desc } = req.body;
    console.log("index2222, ", index);
    console.log("limit3333333, ", limit);
    console.log("type, ", type);
    console.log("sort by and desc, ", sortBy, desc);
    console.log(`fetching from ${(index - 1) * limit + 1} to ${index * limit}`);
    let users;
    const dir = desc ? -1 : 1;
    if (type != "None") {
      const isemployer = type === "Employer";

      if (sortBy === "None") {
        users = await userModal
          .find({ isemployer })
          .skip((index - 1) * limit)
          .limit(limit);
      } else {
        console.log("sorting by, ", sortBy, dir);
        users = await userModal
          .find({ isemployer })
          .sort({ [sortBy]: dir })
          .skip((index - 1) * limit)
          .limit(limit);
      }
    } else {
      if (sortBy === "None") {
        users = await userModal
          .find()
          .skip((index - 1) * limit)
          .limit(limit);
      } else {
        console.log("sorting by, ", sortBy, dir);
        users = await userModal
          .find()
          .sort({ [sortBy]: dir })
          .skip((index - 1) * limit)
          .limit(limit);
      }
    }
    // console.log("users, ", users);
    const total = await userModal.countDocuments();
    console.log("total, ", total);
    res.status(200).send({ code: 200, users, total });
  });

  router.post("/logout", async (req, res) => {
    console.log("sdsddsdsdsd", req.signedCookies);
    // res.clearCookie("isemployer")
    res.clearCookie("adminToken").send("cookie cleared!");
  });

  router.post("/deleteuserById", async (req, res) => {
    try {
      console.log("inside delete user panel");
      const user = await userModal.findByIdAndDelete(req.body._id);
      console.log("users, ", user);
      res.send({ code: 200, msg: "User successfully deleted" });
    } catch (err) {
      console.log("err in delete user, ", err);
      res.send({ code: 400, msg: "Error in deletion" });
    }
  });

  router.post("/deletebidById", async (req, res) => {
    try {
      console.log("inside delete bid panel");
      const bid = await psModel.findByIdAndDelete(req.body._id);
      console.log("bids, ", bid);
      res.send({ code: 200, msg: "Bid successfully deleted" });
    } catch (err) {
      console.log("err in delete bid, ", err);
      res.send({ code: 400, msg: "Error in deletion" });
    }
  });

  router.post("/deletetagById", async (req, res) => {
    try {
      console.log("inside delete tag panel");
      const tag = await tagModal.findByIdAndDelete(req.body._id);
      console.log("tag, ", tag);
      res.send({ code: 200, msg: "Tag successfully deleted" });
    } catch (err) {
      console.log("err in deleting tag, ", err);
      res.send({ code: 400, msg: "Error in deletion" });
    }
  });

  router.post("/deletefaqById", async (req, res) => {
    try {
      console.log("inside delete faq panel");
      const faq = await faqModal.findByIdAndDelete(req.body._id);
      console.log("faq, ", faq);
      res.send({ code: 200, msg: "FAQ successfully deleted" });
    } catch (err) {
      console.log("err in deleting faq, ", err);
      res.send({ code: 400, msg: "Error in deletion" });
    }
  });

  router.post("/deletechatById", async (req, res) => {
    try {
      console.log("inside delete faq panel");
      const faq = await chatModel.findByIdAndDelete(req.body._id);
      console.log("faq, ", faq);
      res.send({ code: 200, msg: "Chat successfully deleted" });
    } catch (err) {
      console.log("err in deleting chat, ", err);
      res.send({ code: 400, msg: "Error in deletion" });
    }
  });

  router.post("/deleteblogById", async (req, res) => {
    try {
      console.log("inside delete blog panel");
      const blog = await blogModal.findByIdAndDelete(req.body._id);
      console.log("blog, ", blog);
      res.send({ code: 200, msg: "Blog successfully deleted" });
    } catch (err) {
      console.log("err in deleting blog, ", err);
      res.send({ code: 400, msg: "Error in deletion" });
    }
  });

  router.post("/adduser", async (req, res) => {
    console.log(":admin route adduser:");
    const body = req.body;
    //verifying if request body data is valid
    console.log("req body", body);
    const { isValid } = checkIfEmpty(
      body.fname,
      body.password,
      body.email,
      body.isemployer
    );
    //if request body data is valid
    console.log("valid, ", isValid);
    try {
      if (isValid) {
        const userExists = await userModal.findOne({
          email: body.email
        });
        console.log("user, ", userExists);
        if (!userExists) {
          console.log("user not found");
          const hashedPassword = await hashPassword(body.password);
          if (hashedPassword) {
            console.log("c", hashedPassword);
            req.body.password = hashedPassword;
            //generating email verification hex
            const email = req.body.email;
            const hash = crypto
              .createHmac("sha256", "verificationHash")
              .update(email)
              .digest("hex");

            console.log("d", hash);
            req.body.verificationhex = hash;
            console.log("ccc");
            const userData = new userModal(req.body);
            console.log("e", userData);
            const savedUser = await userData.save();
            console.log("savedUser", savedUser);
            savedUser["password"] = undefined;
            console.log("valid user, ", savedUser.isvalid);
            const msg = savedUser.isvalid
              ? "User registered successfully"
              : "Data saved successfully, please verify your email address!";
            res.send({
              savedUser,
              code: 200,
              msg
            });

            // let transporter = nodemailer.createTransport({
            //   pool: true,
            //   host: SMPTHOST,
            //   port: SMPTPORT,
            //   secure: true,
            //   auth: {
            //     user: SMPTEMAIL,
            //     pass: SMPTPASS
            //   }
            // });

            if (!savedUser.isvalid) {
              let transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                  user: "websultest@gmail.com",
                  pass: "Welcome@123"
                }
              });

              // let mailOptions = {
              //   from: SMPTEMAIL,
              //   to: savedUser.email,
              //   subject: "Please verify your email",
              //   text: `Please click on this link to verify your email address ${serverPath}/user/verify/${
              //     savedUser.verificationhex
              //     }`
              // };

              let mailOptions = {
                from: "t.valaucius@gmail.com",
                to: savedUser.email,
                subject: "Please verify your email",
                text: `Please click on this link to verify your email address ${serverPath}/user/verify/${savedUser.verificationhex}`
              };

              transporter.sendMail(mailOptions);
            }
          } else {
            res.send({
              code: 400,
              msg: "Some hashed error occured!"
            });
          }
        } else {
          res.send({
            code: 400,
            msg: "Email already exists!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log(err.errors.email);
      res.send({
        code: 400,
        msg: "Some error has occured!"
      });
    }
  });

  router.post("/addtag", async (req, res) => {
    console.log(":admin route addtag:");
    const body = req.body;
    //verifying if request body data is valid
    console.log("req body", body);
    const { isValid } = checkIfEmpty(body.name);
    //if request body data is valid
    console.log("valid, ", isValid);
    try {
      if (isValid) {
        const tagExists = await tagModal.findOne({
          name: body.name
        });
        console.log("tag, ", tagExists);
        if (!tagExists) {
          console.log("tag not found");

          const tagData = new tagModal(req.body);
          console.log("e", tagData);
          const savedTag = await tagData.save();
          console.log("savedTag", savedTag);
          res.send({
            savedTag,
            code: 200,
            msg: "Tag saved successfully"
          });
        } else {
          res.send({
            code: 400,
            msg: "Tag already exists!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log(err);
      res.send({
        code: 400,
        msg: "Some error has occured!"
      });
    }
  });

  router.post("/addfaq", async (req, res) => {
    console.log(":admin route addfaq:");
    const body = req.body;
    //verifying if request body data is valid
    console.log("req body", body);
    const { isValid } = checkIfEmpty(body.ques, body.ans);
    //if request body data is valid
    console.log("valid, ", isValid);
    try {
      if (isValid) {
        const faqExists = await faqModal.findOne({
          ques: body.ques
        });
        console.log("faq, ", faqExists);
        if (!faqExists) {
          console.log("faq not found");

          const faqData = new faqModal(req.body);
          console.log("e", faqData);
          const savedFAQ = await faqData.save();
          console.log("savedFAQ", savedFAQ);
          res.send({
            savedFAQ,
            code: 200,
            msg: "FAQ saved successfully"
          });
        } else {
          res.send({
            code: 400,
            msg: "FAQ already exists!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log(err);
      res.send({
        code: 400,
        msg: "Some error has occured!"
      });
    }
  });

  router.post("/addblog", async (req, res) => {
    console.log(":admin route addblog:");
    const body = req.body;
    //verifying if request body data is valid
    console.log("req body", body);
    const { isValid } = checkIfEmpty(
      body.title,
      body.date,
      body.summary,
      body.content
    );
    //if request body data is valid
    console.log("valid, ", isValid);
    try {
      if (isValid) {
        const blogExists = await blogModal.findOne({
          title: body.title
        });
        console.log("blog, ", blogExists);
        if (!blogExists) {
          console.log("blog not found");

          const blogData = new blogModal(req.body);
          console.log("e", blogData);
          const savedBlog = await blogData.save();
          console.log("savedBlog", savedBlog);
          res.send({
            savedBlog,
            code: 200,
            msg: "Blog saved successfully"
          });
        } else {
          res.send({
            code: 400,
            msg: "Blog already exists!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log(err);
      res.send({
        code: 400,
        msg: "Some error has occured!"
      });
    }
  });

  router.post("/addbid", async (req, res) => {
    console.log(":admin route addbid:");
    const body = req.body;
    //verifying if request body data is valid
    console.log("req body", body);
    const { isValid } = checkIfEmpty(
      body.projectId,
      body.studentId
      // body.employerId,
      // body.status,
      // body.bidDate
    );
    //if request body data is valid
    console.log("valid, ", isValid);
    try {
      if (isValid) {
        let present = false;
        console.log("body in addbid admin, ", req.body);
        const projectExists = await jobPostModal.findById(body.projectId);
        if (!projectExists) present = true;
        else {
          const studentExists = await userModal.findById(body.studentId);
          if (!studentExists) present = true;
        }
        if (!present) {
          const bidExists = await psModel.findOne({
            projectId: body.projectId,
            studentId: body.studentId
          });
          console.log("bid, ", bidExists);
          if (!bidExists) {
            console.log("bid not found");
            const pData = await jobPostModal.findById(req.body.projectId, {
              createdBy: 1,
              status: 1,
              jobBlock: 1
            });
            if (pData.status == 0) {
              req.body.bidDate = new Date().toISOString();

              req.body.employerId = pData.createdBy;
              const bidData = new psModel(req.body);
              console.log("e", bidData);
              const savedBid = await bidData.save();
              console.log("savedBid", savedBid);
              if (pData.jobBlock === "Open Block") {
                await jobPostModal.findByIdAndUpdate(bidData.projectId, {
                  selected: [savedBid._id],
                  status: 1
                });
                await psModel.findByIdAndUpdate(savedBid._id, { status: 1 });
              } else {
                await jobPostModal.findByIdAndUpdate(bidData.projectId, {
                  $push: { bids: bidData._id }
                });
              }
              res.send({
                savedBid,
                code: 200,
                msg: "Application saved successfully"
              });
            } else {
              res.send({
                code: 400,
                msg: "Task is already assigned"
              });
            }
          } else {
            res.send({
              code: 400,
              msg: "An application already exists!"
            });
          }
        } else {
          res.send({ code: 400, msg: "A given data doesn't exist" });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data"
        });
      }
    } catch (err) {
      console.log(err);
      res.send({
        code: 400,
        msg: "Some error has occured!"
      });
    }
  });

  router.post("/deleteprojectById", async (req, res) => {
    try {
      console.log("inside delete project panel");
      const project = await jobPostModal.findByIdAndDelete(req.body._id);
      console.log("project, ", project);
      //delete all bids for this project
      await psModel.remove({
        projectId: req.body._id
      });
      res.send({ code: 200, msg: "Project successfully deleted" });
    } catch (err) {
      console.log("err in deleting project, ", err);
      res.send({ code: 400, msg: "Error in deletion" });
    }
  });

  router.post("/addproject", async (req, res) => {
    console.log(":admin route addproject:");
    try {
      const userExists = await userModal.findOne({
        _id: req.body.data.createdBy
      });
      console.log("userExists", userExists);
      if (userExists.isemployer) {
        if (userExists.isvalid) {
          req.body.data.creationDate = new Date().toISOString();
          console.log("data", req.body.data);
          const jobData = new jobPostModal(req.body.data);
          console.log("dataload", jobData);
          try {
            const savedJobPost = await jobData.save();

            res.send({
              savedJobPost,
              code: 200,
              msg: "Data Saved Successfully"
            });
          } catch (error) {
            console.log(error);
            res.send({
              code: 404,
              msg: error
            });
          }
        } else {
          res.send({
            code: 404,
            msg: "Employer is not verified"
          });
        }
      }
    } catch (error) {
      res.send({
        code: 404,
        msg: "Employer does not exist"
      });
    }
  });

  // router.post;

  return router;
};

module.exports = adminRouter;
