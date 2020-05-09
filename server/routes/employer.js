//imports
import userModel from "../models/user";
import psModel from "../models/projectstatus";
import jobPostModal from "../models/jobpost";
import tagModal from "../models/tags";
// import socket from "socket.io";
import reviewModel from "../models/review";
import express from "express";
import http from "http";
// import returnedSocket from "../socketconnection/socketconnection";

import {
  checkIfEmpty,
  signJwt,
  hashPassword,
  verifyHash,
  newNotification
} from "../functions/functions";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { SMPTHOST, SMPTPORT, SMPTEMAIL, SMPTPASS } from "../config/smpt";
import { clientPath } from "../config/keys";
import { userAuthCheck } from "../middlewares/middlewares";
import mongoose from "mongoose";
import userModal from "../models/user";
import {
  uploadProfileImage,
  uploadProjectPDF,
  uploadProfileVideo
} from "../config/multerconfig";
import milestoneModel from "../models/milestone";
import notificationModel from "../models/notification";
// import uploadPDF from "../socketconnection/socketconnection"

// let app = express();
// const server = http.createServer(app);
// const io = socket(server);

var braintree = require("braintree");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "w3d3mgffkp5x3rw3",
  publicKey: "v4gwnx6q3v84rw7b",
  privateKey: "7c7b20a2927b4ddda582e7414ef5e01c"
});

const employerRouter = () => {
  //router variable for api routing
  const router = express.Router();

  router.post("/rejectProposal", userAuthCheck, async (req, res) => {
    console.log("about to reject proposal, ", req.body.bid_id);
    const _id = req.body.tokenData.userid;

    try {
      console.log("1");
      const psData = await psModel.findByIdAndDelete(req.body.bid_id);
      console.log("12");
      const jobData = await jobPostModal.findByIdAndUpdate(req.body.projectId, {
        $pull: { bids: req.body.bid_id }
      });
      console.log("rejected proposal, ", psData);
      console.log("13");
      console.log("14");
      newNotification(
        "application rejected",
        "task",
        psData.projectId,
        psData._id,
        psData.studentId,
        psData.employerId,

        true,
        true,
        false
      );
      res.status(200).send({ status: "ok" });
      console.log("15");
    } catch (err) {
      console.log("errrooorrr, ", err);
      res.status(400);
      res.send({ msg: err });
    }
  });

  router.post("/getMilestones", userAuthCheck, async (req, res) => {
    console.log("about to get  milestone, ", req.body);
    const _id = req.body.tokenData.userid;
    const { _jid } = req.body;

    try {
      console.log("1");
      const milestones = await milestoneModel.find({ task: _jid });
      if (milestones)
        res.send({ code: 200, msg: "milestone loaded", milestones });
      else res.send({ code: 400, msg: "milestone not found" });
      console.log("15");
    } catch (err) {
      console.log("error in getting milestones, ", err);
      res.status(400);
      res.send({ code: 400, msg: err.message });
    }
  });

  router.get("/uploadedFiles", userAuthCheck, async (req, res) => {
    console.log("about to get  files, ");
    const _id = req.body.tokenData.userid;

    try {
      const uploads = await userModal.findById(_id, { photo: 1, video: 1 });
      console.log("uploads, ", uploads);
      if (uploads) {
        res.send({ code: 200, images: uploads.photo, videos: uploads.video });
      } else {
        res.send({ code: 400, msg: "couldn't retrieve data" });
      }
    } catch (err) {
      console.log("error in getting files, ", err);
      res.status(400);
      res.send({ code: 400, msg: err.message });
    }
  });

  router.post("/clientToken", userAuthCheck, async (req, res) => {
    console.log("jhjjjjjjjjjjjjjj");
    console.log("about to create  updated client token");
    const _id = req.body.tokenData.userid;
    try {
      gateway.clientToken.generate({}, function(err, response) {
        console.log("response in callback,", response);
        if (err) {
          console.log(err);
        } else {
          var clientToken = response.clientToken;
          console.log(clientToken);
          res.send({ clientToken });
        }
      });
    } catch (err) {
      console.log("error in client token creation, ", err);
      res.status(400);
      res.send({ code: 400, msg: err.message });
    }
  });

  router.post("/checkout", userAuthCheck, function(req, res) {
    var nonceFromTheClient = req.body.payment_method_nonce;
    // Use payment method nonce here
    console.log("nonce for transaction, ", nonceFromTheClient);

    gateway.transaction.sale(
      {
        amount: "10.00",
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true
        }
      },
      function(err, result) {
        if (err) console.log(err);

        console.log(result);
        res.send({ result });
      }
    );
  });

  router.post("/notifications", userAuthCheck, async (req, res) => {
    console.log("about to get  notifications");
    const { index, limit, type, sortBy, desc } = req.body;
    const _id = req.body.tokenData.userid;
    const dir = desc ? -1 : 1;
    try {
      console.log("1");
      let notifications;

      if (type != "None") {
        if (sortBy === "None") {
          notifications = await notificationModel
            .find({ employer: _id, empRead: false, type })
            .sort({ _id: -1 })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate("task")
            .populate("student")
            .populate("employer");
        } else {
          console.log("sorting by, ", sortBy, dir);
          notifications = await notificationModel
            .find({ employer: _id, empRead: false, type })
            .sort({ [sortBy]: dir, _id: -1 })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate("task")
            .populate("student")
            .populate("employer");
        }
      } else {
        if (sortBy === "None") {
          notifications = await notificationModel
            .find({ employer: _id, empRead: false })
            .sort({ _id: -1 })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate("task")
            .populate("student")
            .populate("employer");
        } else {
          console.log("sorting by, ", sortBy, dir);
          notifications = await notificationModel
            .find({ employer: _id, empRead: false })
            .sort({ [sortBy]: dir, _id: -1 })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate("task")
            .populate("student")
            .populate("employer");
        }
      }

      // const notifications = await notificationModel
      //   .find()
      //   .sort({ _id: -1 })
      //   .populate("task")
      //   .populate("student")
      //   .populate("employer");
      console.log(notifications);
      let total;
      if (type != "None")
        total = await notificationModel.countDocuments({
          employer: _id,
          empRead: false,
          type
        });
      else
        total = await notificationModel.countDocuments({
          employer: _id,
          empRead: false
        });
      console.log("total, ", total);
      res.send({ code: 200, notifications, total });
      console.log("15");
    } catch (err) {
      console.log("error in notification fetch, ", err);
      res.status(400);
      res.send({ code: 400, msg: err.message });
    }
  });

  router.post("/readNotification", userAuthCheck, async (req, res) => {
    console.log("about to read  notification");
    // const _id = req.body.tokenData.userid;
    try {
      console.log("1");
      const notifications = await notificationModel.findByIdAndUpdate(
        req.body._id,
        { empRead: true }
      );
      console.log(notifications);
      res.send({ code: 200, notifications });
      console.log("15");
    } catch (err) {
      console.log("error in notification reading, ", err);
      res.status(400);
      res.send({ code: 400, msg: err.message });
    }
  });

  router.post("/addMilestone", userAuthCheck, async (req, res) => {
    console.log("about to make  milestone, ", req.body);
    const _id = req.body.tokenData.userid;
    const { payLoad } = req.body;

    try {
      console.log("1");
      let milestoneData = new milestoneModel(payLoad);

      let savedMilestone = await milestoneData.save();
      res.send({ code: 200, msg: "milestone saved", savedMilestone });
      console.log("15");
    } catch (err) {
      console.log("error in milestone creation, ", err);
      res.status(400);
      res.send({ code: 400, msg: err.message });
    }
  });

  router.post("/makePayment", userAuthCheck, async (req, res) => {
    console.log("about to make payment for task, ", req.body);
    const _id = req.body.tokenData.userid;
    const { to, amount, _jid } = req.body;

    try {
      console.log("1");
      let data = await userModal.findById(to, { balance: 1 });
      let balance = data.balance;
      balance = balance + amount;
      await userModal.findByIdAndUpdate(to, { balance });

      const psData = await psModel.findOne({ projectId: _jid, studentId: to });

      console.log("application id while making payment, ", psData);

      newNotification(
        "new payment received",
        "payment",
        psData.projectId,
        psData._id,
        psData.studentId,
        psData.employerId,
        true,
        true,
        false
      );
      newNotification(
        "new payment made",
        "payment",
        psData.projectId,
        psData._id,
        psData.studentId,
        psData.employerId,
        false,
        false,
        true
      );
      res.status(200).send({ code: 200 });
      console.log("15");
    } catch (err) {
      console.log("errrooorrr, ", err);
      res.status(400);
      res.send({ code: 400, msg: err });
    }
  });

  router.post("/readyChatRoom", userAuthCheck, async (req, res) => {
    try {
      // returnedSocket(io);
    } catch (err) {
      res.send({ code: 400, msg: "Could not load chat room" });
    }
  });

  router.post("/reviewStudent", userAuthCheck, async (req, res) => {
    try {
      const { hardSkills, softSkills, pid, sid, eid } = req.body;
      console.log("---->, ", eid, " ", pid, " ", sid);
      const reviewExists = await reviewModel.findOne({
        project: pid,
        employer: eid,
        student: sid
      });
      console.log("review existence, ", reviewExists);
      if (reviewExists) {
        const reviewData = await reviewModel.findByIdAndUpdate(
          reviewExists._id,
          {
            empReviewed: true,
            empReview: { softSkills: softSkills, hardSkills: hardSkills }
          }
        );

        res.send({ code: 200, msg: "review saved" });
      } else {
        console.log("review body doesn't exist in db");
        const reviewPayload = {
          project: pid,
          employer: eid,
          student: sid,
          empReviewed: true,
          empReview: { hardSkills, softSkills }
        };

        let reviewData = new reviewModel(reviewPayload);

        let savedReview = await reviewData.save();
        res.send({ code: 200, msg: "review saved" });
      }
    } catch (err) {
      console.log(err);
      res.send({ code: 400, msg: err.message });
    }
  });

  router.post("/submitTaskReview", userAuthCheck, async (req, res) => {
    try {
      const _id = req.body.tokenData.userid;
      console.log("id for loading, ", _id);
      const psData = await psModel.findByIdAndUpdate(req.body.proposalId, {
        status: req.body.status
      });
      console.log("psData after task review, ", psData);
      let msg =
        req.body.status == 1
          ? "task submission rejected"
          : "task submission accepted";

      if (req.body.status == 1 || req.body.status == 3) {
        newNotification(
          msg,
          "task",
          psData.projectId,
          psData._id,
          psData.studentId,
          psData.employerId,
          true,
          true,
          false
        );
      }

      res.send({ code: 200, msg });
    } catch (err) {
      console.log(err);
      res.send({ code: 400, msg: "Error in reviewing. Contact support" });
    }
  });

  router.post("/getProposalWithoutId", userAuthCheck, async (req, res) => {
    const psData = await psModel
      .find({ studentId: req.body._sid, projectId: req.body._pid })
      .populate("projectId")
      .populate("studentId")
      .populate("employerId");
    // console.log(psData);
    if (psData) {
      const reviewData = await reviewModel.findOne({
        student: req.body._sid,
        project: req.body._pid,
        employer: req.body._eid
      });
      console.log("reviewData, ", reviewData);
      if (!reviewData) {
        console.log("creating new");
        let newReview = new reviewModel({
          student: req.body._sid,
          project: req.body._pid,
          employer: req.body._eid,
          empReviewed: false,
          stdReviewed: false,
          empReview: {},
          stdReview: {}
        });
        const savedReview = await newReview.save();
        res.send({ code: 200, psData, reviewData: savedReview });
      } else res.send({ code: 200, psData, reviewData });
    } else {
      res.send({ code: 404, msg: "user not found." });
    }
  });

  router.post("/acceptproposal", userAuthCheck, async (req, res) => {
    console.log("about to accept proposal");
    const _id = req.body.tokenData.userid;

    try {
      //make status code of this proposal=1
      //if open, there wont be request anyway.
      //if work, set jobPost status 1 and delete other proposals to this project
      //if creative, set jobPost status 0, i.e, don't touch the status as well as other proposals
      console.log("1");
      const psData = await psModel.findByIdAndUpdate(req.body._id, {
        status: 1
      });
      //delete all other proposals for this project
      console.log("12");
      if (req.body.block === "Work Block") {
        await psModel.remove({
          _id: { $ne: req.body._id },
          projectId: req.body.projectId
        });

        await jobPostModal.findByIdAndUpdate(req.body.projectId, { status: 1 });
        await jobPostModal.findByIdAndUpdate(req.body.projectId, {
          $pull: { bids: req.body._id }
        });
        // await jobPostModal.findByIdAndUpdate(req.body.projectId, {$pull : { bids : { $ne : req.body._id}}})
        await jobPostModal.findByIdAndUpdate(req.body.projectId, {
          selected: [req.body._id]
        });
      } else {
        //shall I remove this bid or shift others bids to 2nd array in case of open block???
        //or, maybe, while listing bids check their status too.
        await jobPostModal.findByIdAndUpdate(req.body.projectId, {
          $pull: { bids: req.body._id }
        });
        await jobPostModal.findByIdAndUpdate(req.body.projectId, {
          $push: { selected: req.body._id }
        });
      }
      console.log("13");

      // proj.status = 1;
      // proj.bids = [];
      // proj.bids.push(req.body._id)
      // proj.save();
      //(not part of this code block)
      //make std contact visible to emp
      //forward to contract from frontend
      //enable chat in contract
      console.log("14");
      newNotification(
        "application accepted",
        "task",
        psData.projectId,
        psData._id,
        psData.studentId,
        psData.employerId,
        true,
        true,
        false
      );
      res.status(200).send({ status: "ok" });
      console.log("15");
    } catch (err) {
      console.log("errrooorrr, ", err);
      res.status(400);
      res.send({ msg: err });
    }
  });

  router.post("/myProjects", userAuthCheck, async (req, res) => {
    console.log("inside my projects");

    const _id = req.body.tokenData.userid;
    console.log("1111111111111");
    try {
      const projects = await jobPostModal
        .find({ createdBy: _id })
        .sort({ _id: -1 })
        .limit(6)
        .populate("bids")
        .populate("selected");

      console.log("222222222222222");
      // console.log("my projects, ", projects);

      const reviews = await reviewModel.find({
        employer: _id,
        empReviewed: true,
        stdReviewed: true
      });
      console.log("ALL REVIEWS, ", reviews);
      let stars = Array.from({ length: 5 }, (v, i) => 0);
      await reviews.forEach(review => {
        console.log(
          `stars[${review.stdReview.rating - 1}] = stars[${review.stdReview
            .rating - 1}] + 1`
        );
        stars[review.stdReview.rating - 1] =
          stars[review.stdReview.rating - 1] + 1;
      });

      console.log("stars, ", stars);

      let c1 = 0;
      let c2 = 0;

      for (let i = 1; i < 6; i++) {
        c1 = c1 + i * stars[i - 1];
        c2 = c2 + stars[i - 1];
      }

      console.log("c1, ", c1);
      console.log("c2, ", c2);

      const avgRating = c1 / c2;
      console.log("average rating, ", avgRating);

      res.status(200).json({
        code: 200,
        projects,
        avgRating,
        reviewCount: reviews.length
      });
    } catch (err) {
      res.statusMessage = "Some error has cured, please try again";
      res.status(200).json({
        code: 400,
        msg: res.statusMessage
      });
    }
  });

  router.post("/myProjectsPopulatedBids", userAuthCheck, async (req, res) => {
    console.log("inside my projects");
    try {
      const _id = req.body.tokenData.userid;
      console.log("1111111111111");

      const projects = await jobPostModal
        .find({ createdBy: _id })
        .sort({ _id: -1 })
        .populate({
          path: "bids",
          model: psModel,
          populate: [
            {
              path: "studentId",
              model: userModal
            }
          ]
        })
        .populate({
          path: "selected",
          model: psModel,
          populate: [
            {
              path: "studentId",
              model: userModal
            }
          ]
        })
        .populate("candidateProfile");

      const suggestions = await tagModal.find();

      console.log("222222222222222");
      console.log("my projects, ", projects);

      res.status(200).json({
        code: 200,
        projects,
        suggestions
      });
    } catch (err) {
      console.log(err);
      res.statusMessage = "Some error has cured, please try again";
      res.status(200).json({
        code: 400,
        msg: res.statusMessage
      });
    }
  });

  router.post("/getCreativeList", userAuthCheck, async (req, res) => {
    console.log("insideget creative list with _jid= ", req.body._jid);

    const _id = req.body.tokenData.userid;
    console.log("1111111111111");
    try {
      const job = await jobPostModal
        .findById(req.body._jid)
        .populate({
          path: "bids",
          model: psModel,
          populate: [
            {
              path: "studentId",
              model: userModal
            }
          ]
        })
        .populate({
          path: "selected",
          model: psModel,
          populate: [
            {
              path: "studentId",
              model: userModal
            }
          ]
        });
      console.log("coverted _jid to, ", job);
      console.log("222222222222222");
      console.log("my creative job, ", job);

      res.status(200).json({
        code: 200,
        job
      });
    } catch (err) {
      res.statusMessage = "Some error has cured, please try again";
      res.status(200).json({
        code: 400,
        msg: res.statusMessage
      });
    }
  });

  router.post("/uploadofficevideos", userAuthCheck, async (req, res) => {
    console.log("employer route uploadvideo");
    const _id = req.body.tokenData.userid;
    // console.log('req body', req.body)
    // console.log('i, ', req.body.i)
    uploadProfileVideo(req, res, async err => {
      if (err) {
        console.log(err);
        res.status(200).json({
          code: 400,
          msg: err
        });
      } else {
        if (req.file == undefined) {
          res.statusMessage = "Some error has occured, please try again";
          res.status(200).json({
            code: 400,
            msg: res.statusMessage
          });
        } else {
          let filePath = req.file.path.replace("public/", "");
          // if(req.i == 0){
          await userModal.findOneAndUpdate(
            {
              _id
            },
            {
              // video[0]: `${filePath.trim()}`
              $push: { video: `${filePath.trim()}` }
            }
          );
          res.statusMessage = "Video saved";
          res.status(200).json({
            code: 200,
            msg: res.statusMessage
          });
          // }else{
          // await userModal.findOneAndUpdate({
          //   _id
          // }, {
          //     video: `${filePath.trim()}`
          //   })
          // res.statusMessage = 'Video saved'
          // res.status(200).json({
          //   code: 200,
          //   msg: res.statusMessage,
          // })
          // }
        }
      }
    });
  });

  router.post("/uploadofficeimgs", userAuthCheck, async (req, res) => {
    console.log("employer route uploadimg");
    const _id = req.body.tokenData.userid;
    console.log("req body", req.body);
    console.log("i, ", req.body.i);
    uploadProfileImage(req, res, async err => {
      if (err) {
        res.status(200).json({
          code: 400,
          msg: err
        });
        console.log(err);
      } else {
        if (req.file == undefined) {
          res.statusMessage = "Some error has occured, please try again";
          res.status(200).json({
            code: 400,
            msg: res.statusMessage
          });
        } else {
          let filePath = req.file.path.replace("public/", "");
          // if(req.i == 0){
          await userModal.findOneAndUpdate(
            {
              _id
            },
            {
              // photo: `${filePath.trim()}`
              $push: { photo: `${filePath.trim()}` }
            }
          );
          res.statusMessage = "Image saved";
          res.status(200).json({
            code: 200,
            msg: res.statusMessage
          });
          // }else{
          // await userModal.findOneAndUpdate({
          //   _id
          // }, {
          //     video: `${filePath.trim()}`
          //   })
          // res.statusMessage = 'Video saved'
          // res.status(200).json({
          //   code: 200,
          //   msg: res.statusMessage,
          // })
          // }
        }
      }
    });
  });

  router.post("/uploadofficelogo", userAuthCheck, async (req, res) => {
    const _id = req.body.tokenData.userid;
    // console.log("req body", req.body);
    // console.log("i, ", req.body.i);
    console.log("employer upload logo");
    uploadProfileImage(req, res, async err => {
      if (err) {
        res.status(200).json({
          code: 400,
          msg: err
        });
        console.log(err);
      } else {
        if (req.file == undefined) {
          res.statusMessage = "Some error has occured, please try again";
          res.status(200).json({
            code: 400,
            msg: res.statusMessage
          });
        } else {
          let filePath = req.file.path.replace("public/", "");
          // if(req.i == 0){
          await userModal.findOneAndUpdate(
            {
              _id
            },
            {
              // photo: `${filePath.trim()}`
              $set: { "photo.0": `${filePath.trim()}` }
            }
          );
          res.statusMessage = "Logo saved";
          res.status(200).json({
            code: 200,
            msg: res.statusMessage
          });
          // }else{
          // await userModal.findOneAndUpdate({
          //   _id
          // }, {
          //     video: `${filePath.trim()}`
          //   })
          // res.statusMessage = 'Video saved'
          // res.status(200).json({
          //   code: 200,
          //   msg: res.statusMessage,
          // })
          // }
        }
      }
    });
  });

  router.post("/uploadProjectPDF", userAuthCheck, async (req, res) => {
    try {
      const _id = req.body.tokenData.userid;
      console.log("employer upload project pdf");
      uploadProjectPDF(req, res, async err => {
        if (err) {
          res.status(200).json({
            code: 400,
            msg: "File type not supported"
          });
          console.log(err);
        } else {
          if (req.file == undefined) {
            res.statusMessage = "Some error has occured, please try again";
            res.status(200).json({
              code: 400,
              msg: res.statusMessage
            });
          } else {
            let filePath = req.file.path.replace("public/", "");
            res.statusMessage = "pdf saved";
            res.status(200).json({
              code: 200,
              filePath,
              msg: res.statusMessage
            });
          }
        }
      });
    } catch (err) {
      console.log(err);
      res.send({
        code: 400
      });
    }
  });

  router.post("/getusername", userAuthCheck, async (req, res) => {
    try {
      console.log("req", req.body.tokenData.userid);
      const _id = req.body.tokenData.userid;
      const profile_data = await userModal
        .findById(_id, {
          fname: 1,
          lname: 1,
          email: 1,
          secondaryemail: 1,
          phone: 1,
          bio: 1,
          photo: 1,
          workPreference: 1,
          address: 1,
          url: 1
        })
        .populate("workPreference");
      console.log(profile_data);
      const tag_data = await tagModal.find();

      console.log("tags, ", tag_data);
      if (profile_data) {
        res.send({ code: 200, profile_data, suggestions: tag_data });
      } else {
        res.send({ code: 404, msg: "user not found." });
      }
    } catch (err) {
      console.log(err);
      res.send({ code: 400, msg: "error occured" });
    }
  });

  router.post("/editprofile", userAuthCheck, async (req, res) => {
    console.log("payload", req.body);
    console.log("reddq", req.body.tokenData.userid);
    const _id = req.body.tokenData.userid;
    const data = req.body.data;
    const profile_data = await userModal.findByIdAndUpdate(_id, data);
    console.log(profile_data);
    if (profile_data) {
      res.send({ code: 200, msg: "Profile updated", profile_data });
    } else {
      res.send({ code: 404, msg: "user not found." });
    }
  });

  router.post("/changepassword", userAuthCheck, async (req, res) => {
    console.log("payload", req.body);
    console.log("reddq", req.body.tokenData.userid);
    try {
      const { isValid } = checkIfEmpty(req.body);
      if (isValid) {
        const _id = req.body.tokenData.userid;
        const data = req.body;
        const isUserExists = await userModal.findOne({ _id });
        if (isUserExists) {
          const isPasswordValid = await verifyHash(
            data.currentPassword,
            isUserExists.password
          );
          if (isPasswordValid) {
            const newhashedPassword = await hashPassword(data.newPassword);
            if (newhashedPassword) {
              await userModal.updateOne(
                {
                  _id
                },
                {
                  password: newhashedPassword
                }
              );
              res.send({
                code: 200,
                msg: "Password updated successfully!"
              });
            }
          } else {
            res.send({ code: 400, msg: "Invalid current password" });
          }
        } else {
          res.send({ code: 404, msg: "Invalid token." });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid input"
        });
      }
    } catch (e) {
      console.log("err", e);
      res.send({
        code: 406,
        msg: "Some error has occured!"
      });
    }
  });

  router.post("/getprojects", userAuthCheck, async (req, res) => {
    const { index, limit, type, sortBy, desc } = req.body;
    const _id = req.body.tokenData.userid;

    let projects;
    const dir = desc ? -1 : 1;

    if (type != "None") {
      if (sortBy === "None") {
        projects = await jobPostModal
          .find({ createdBy: _id, jobBlock: type, status: "0" })
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
          .find({ createdBy: _id, jobBlock: type, status: "0" })
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
          .find({ createdBy: _id, status: "0" })
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
          .find({ createdBy: _id, status: "0" })
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

    const total = await jobPostModal.countDocuments({
      createdBy: _id,
      status: "0"
    });
    console.log("total, ", total);
    res.status(200).send({ code: 200, projects, total });
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

  router.post("/updateproject", async (req, res) => {
    try {
      const { isValid } = checkIfEmpty(req.body.data);
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

  router.post("/uploadprofileimg", userAuthCheck, async (req, res) => {
    const _id = req.body.tokenData.userid;
    uploadProfileImage(req, res, async err => {
      if (err) {
        res.status(200).json({
          code: 400,
          msg: err
        });
        console.log(err);
      } else {
        if (req.file == undefined) {
          res.statusMessage = "Some error has occured, please try again";
          res.status(200).json({
            code: 400,
            msg: res.statusMessage
          });
        } else {
          let filePath = req.file.path.replace("public/", "");
          await userModal.findOneAndUpdate(
            {
              _id
            },
            {
              photo: `${filePath.trim()}`
            }
          );
          res.statusMessage = "Image saved";
          res.status(200).json({
            code: 200,
            msg: res.statusMessage
          });
        }
      }
    });
  });

  return router;
};

module.exports = employerRouter;
