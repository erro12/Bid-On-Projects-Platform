//imports
import express from "express";
import userModal from "../models/user";
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
import { clientPath, serverPath } from "../config/keys";
import { userAuthCheck } from "../middlewares/middlewares";
import mongoose from "mongoose";
import tagModal from "../models/tags";
import psModel from "../models/projectstatus";
import reviewModel from "../models/review";
import { uploadProfileImage, uploadProfileVideo } from "../config/multerconfig";
import jobPostModal from "../models/jobpost";
import notificationModel from "../models/notification";

const studentRouter = () => {
  //router variable for api routing

  const router = express.Router();

  let inJSON = (jarr, _id) => {
    console.log("jarr to check, ", jarr);
    if (!jarr || jarr.length == 0) {
      console.log("aborting");
      return true;
    }
    // console.log('demo objectId to str, ', jarr[0].studentId)
    // console.log(`${_id} and ${jarr[0].studentId}`)
    for (let i = 0; i < jarr.length; i++) {
      if (jarr[i].studentId == _id) {
        console.log("a match");
        return true;
        break;
      }
      console.log(`${jarr[i].studentId} != ${_id}`);
    }
    return false;
  };

  router.post("/getprofile2", userAuthCheck, async (req, res) => {
    console.log("inside get profile 2");
    // console.log("req", req.body.tokenData.userid);
    const _id = req.body.tokenData.userid;
    const profile_data = await userModal
      .findById(_id, {
        fname: 1,
        lname: 1,
        email: 1,
        phone: 1,
        bio: 1,
        photo: 1,
        secondaryemail: 1,
        address: 1,
        location: 1,
        workPreference: 1,
        currentSituation: 1,
        isemployer: 1,
        balance: 1
      })
      .populate("workPreference");

    // console.log(profile_data);
    if (profile_data) {
      let projectCount = 0;
      if (profile_data.isemployer) {
        projectCount = await jobPostModal.count({
          createdBy: profile_data._id
        });
      } else {
        projectCount = await psModel.count({
          studentId: profile_data._id,
          status: 1
        });
      }
      profile_data.photo = profile_data.photo[0];
      console.log("now, ", profile_data);

      const reviews = await reviewModel.find({
        student: _id,
        empReviewed: true,
        stdReviewed: true
      });
      console.log("ALL REVIEWS, ", reviews);
      let stars1 = Array.from({ length: 5 }, (v, i) => 0);
      let stars2 = Array.from({ length: 5 }, (v, i) => 0);
      await reviews.forEach(review => {
        // console.log(`stars[${review.empReview.rating-1}] = stars[${review.empReview.rating-1}] + 1`)
        stars1[review.empReview.hardSkills - 1] =
          stars1[review.empReview.hardSkills - 1] + 1;
        stars2[review.empReview.softSkills - 1] =
          stars2[review.empReview.softSkills - 1] + 1;
      });

      console.log("stars1, ", stars1);
      console.log("stars2, ", stars2);

      let c11 = 0;
      let c12 = 0;
      let c21 = 0;
      let c22 = 0;

      for (let i = 1; i < 6; i++) {
        c11 = c11 + i * stars1[i - 1];
        c21 = c21 + i * stars2[i - 1];
        c12 = c12 + stars1[i - 1];
        c22 = c22 + stars2[i - 1];
      }

      console.log("c11, ", c11);
      console.log("c12, ", c12);

      const ahr = c11 / c12;
      const asr = c21 / c22;
      console.log("average rating h and s, ", ahr, " ", asr);

      res.send({
        code: 200,
        profile_data,
        projectCount,
        avgHardSkills: ahr,
        avgSoftSkills: asr,
        reviewCount: reviews.length
      });
    } else {
      res.send({ code: 404, msg: "user not found." });
    }
  });

  router.post("/submitTaskForReview", userAuthCheck, async (req, res) => {
    try {
      const _id = req.body.tokenData.userid;
      console.log("id for loading, ", _id);
      const psData = await psModel.findByIdAndUpdate(req.body.proposalId, {
        status: 2
      });
      console.log("psData after task submission, ", psData);
      newNotification(
        "pending task review",
        "task",
        psData.projectId,
        psData._id,
        _id,
        psData.employerId,
        false,
        false,
        true
      );
      res.send({ code: 200, msg: "Task submitted, waiting for review." });
    } catch (err) {
      console.log(err);
      res.send({ code: 400, msg: "Error in submission. Contact support" });
    }
  });

  router.get("/uploadedFiles", userAuthCheck, async (req, res) => {
    console.log("about to get  files, ");
    const _id = req.body.tokenData.userid;

    try {
      const uploads = await userModal.findById(_id, { video: 1 });
      console.log("uploads, ", uploads);
      if (uploads) {
        res.send({ code: 200, videos: uploads.video });
      } else {
        res.send({ code: 400, msg: "couldn't retrieve data" });
      }
    } catch (err) {
      console.log("error in getting files, ", err);
      res.status(400);
      res.send({ code: 400, msg: err.message });
    }
  });

  router.post("/checkIfApplied", userAuthCheck, async (req, res) => {
    const _id = req.body.tokenData.userid;
    console.log("id for loading, ", _id);
    const job = req.body.job;
    console.log("job to check, ", job);

    //if applied to or selected in this job, return true
    const bidData = await psModel.findOne({
      projectId: job._id,
      studentId: _id
    });
    console.log("is there a bid?, ", bidData);
    if (bidData) res.send({ code: 200, applied: true, loading: false });
    else res.send({ code: 200, applied: false, loading: false });
  });

  router.get("/jobsdata", userAuthCheck, async (req, res) => {
    const _id = req.body.tokenData.userid;
    try {
      //  const jobPosts =  await jobPostModal.find({});
      const jP = await jobPostModal
        .find({ status: 0 })
        .populate({
          path: "createdBy",
          select: "fname lname photo"
        })
        .populate("bids")
        .populate("selected");

      console.log("jP, ", jP);
      const jobPosts = await jP.filter(async project => {
        return await ((await !inJSON(project.bids, _id)) &&
          (await !inJSON(project.selected, _id)));
        // let bFlag = true;
        // let sFlag = true;
        // if(project.bids && project.bids.length > 0)
        //   bFlag =  await inJSON(project.bids, _id);
        // if(project.selected && project.selected.length > 0)
        //   sFlag =  await inJSON(project.selected, _id);

        // return bFlag && sFlag;
      });

      console.log("filtered jobPosts, ", jobPosts);

      //  var companyInfo = [];
      //  for(var i = 0; i<jobPosts.length; i++){
      //   let data = await userModal.findById(jobPosts[i].createdBy, {
      //     fname: 1,
      //     lname: 1,
      //     photo: 1
      //    });
      //    companyInfo.push(data);
      //  }

      //  console.log(companyInfo);
      //   res.send({jobPosts,
      //     companyInfo});
      //   } catch(error){
      //   res.send(error.message);}
      // }
      res.send({ jobPosts });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  });

  router.post("/myProjects", userAuthCheck, async (req, res) => {
    console.log("inside student's my projects");

    const _id = req.body.tokenData.userid;
    console.log("1111111111111");
    try {
      const projects = await psModel
        .find({ studentId: _id })
        .sort({ _id: -1 })
        .populate({
          path: "projectId",
          model: jobPostModal,
          populate: [
            {
              path: "candidateProfile",
              model: tagModal
            }
          ]
        })
        .populate("employerId");
      const suggestions = await tagModal.find();

      console.log("222222222222222");
      // console.log("my projects, ", projects);

      res.status(200).json({
        code: 200,
        projects,
        suggestions
      });
    } catch (err) {
      res.statusMessage = "Some error has cured, please try again";
      res.status(200).json({
        code: 400,
        msg: res.statusMessage
      });
    }
  });

  router.post("/myRecentProjects", userAuthCheck, async (req, res) => {
    console.log("inside student's my projects");

    const _id = req.body.tokenData.userid;
    console.log("1111111111111");
    try {
      const projects = await psModel
        .find({ studentId: _id, status: { $gte: 3 } })
        .sort({ _id: -1 })
        .limit(6)
        .populate({
          path: "projectId",
          model: jobPostModal,
          populate: [
            {
              path: "candidateProfile",
              model: tagModal
            }
          ]
        })
        .populate("employerId");
      const suggestions = await tagModal.find();

      console.log("222222222222222");
      // console.log("my projects, ", projects);

      res.status(200).json({
        code: 200,
        projects,
        suggestions
      });
    } catch (err) {
      res.statusMessage = "Some error has cured, please try again";
      res.status(200).json({
        code: 400,
        msg: res.statusMessage
      });
    }
  });

  router.post("/placeBid", userAuthCheck, async (req, res) => {
    console.log("inside student router");
    console.log(":submit bid route:");

    //get email by id
    const _id = req.body.tokenData.userid;

    // console.log(email.email);
    console.log(req.body);

    // check if fields empty
    const { isValid } = checkIfEmpty(req.body);
    try {
      if (true) {
        console.log("valid");
        //post project
        console.log("student id, ", _id);

        const bidFound = await psModel.findOne({
          projectId: req.body.projectId,
          studentId: _id
        });
        if (bidFound) {
          res.send({
            code: 400,
            msg: " Already applied for this task"
          });
        } else {
          const jobData = await jobPostModal.findById(req.body.projectId, {
            jobBlock: 1,
            status: 1
          });
          if (jobData.jobBlock === "Open Block" && jobData.status == "1") {
            res.send({
              code: 400,
              msg: "Task not available anymore"
            });
          } else {
            req.body.bidDate = new Date().toISOString();
            req.body.studentId = _id;

            const bidData = await new psModel(req.body);

            console.log("2");

            const savedBid = await bidData.save();
            console.log("saved");

            //if work project... add to bid array
            //if open project... empty bid array and add this and make status 1 in both
            //if creative project... add to bid array
            const block = await jobPostModal.findById(bidData.projectId, {
              jobBlock: 1
            });
            // let statusCode = 0; //to forward to projectList
            if (block.jobBlock === "Open Block") {
              await jobPostModal.findByIdAndUpdate(bidData.projectId, {
                selected: [bidData._id],
                status: 1
              });
              await psModel.findByIdAndUpdate(savedBid._id, { status: 1 });
              // statusCode = 1; //to forward to contract
            } else {
              await jobPostModal.findByIdAndUpdate(bidData.projectId, {
                $push: { bids: bidData._id }
              });
              //  await psModel.findByIdAndUpdate(savedBid._id, {status:1})
              // statusCode = 1;
            } // savedUser["password"] = undefined;
            const project = await psModel
              .findById(savedBid._id)
              .populate("projectId");

            newNotification(
              "new student application",
              "task",
              savedBid.projectId,
              savedBid._id,
              savedBid.studentId,
              savedBid.employerId,
              false,
              false,
              true
            );

            res.send({
              savedBid,
              code: 200,
              project,
              msg: "Applied successfully"
            });
          }
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
            .find({ student: _id, stdRead: false, type })
            .sort({ _id: -1 })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate("task")
            .populate("student")
            .populate("employer");
        } else {
          console.log("sorting by, ", sortBy, dir);
          notifications = await notificationModel
            .find({ student: _id, stdRead: false, type })
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
            .find({ student: _id, stdRead: false })
            .sort({ _id: -1 })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate("task")
            .populate("student")
            .populate("employer");
        } else {
          console.log("sorting by, ", sortBy, dir);
          notifications = await notificationModel
            .find({ student: _id, stdRead: false })
            .sort({ [sortBy]: dir, _id: -1 })
            .skip((index - 1) * limit)
            .limit(limit)
            .populate("task")
            .populate("student")
            .populate("employer");
        }
      }

      // const notifications = await notificationModel
      //   .find({ student: _id, stdRead: false })
      //   .sort({ _id: -1 })
      //   .populate("task")
      //   .populate("student")
      //   .populate("employer");
      console.log(notifications);
      let total;
      if (type != "None")
        total = await notificationModel.countDocuments({
          student: _id,
          stdRead: false,
          type
        });
      else
        total = await notificationModel.countDocuments({
          student: _id,
          stdRead: false
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
        { stdRead: true }
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

  router.post("/reviewEmployer", userAuthCheck, async (req, res) => {
    try {
      const { rating, pid, sid, eid } = req.body;
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
            stdReviewed: true,
            stdReview: { rating }
          }
        );

        const psData = await psModel.find(
          { projectId: pid, studentId: sid },
          { _id: 1 }
        );

        newNotification(
          "new review received",
          "task",
          reviewData.project,
          psData._id,
          reviewData.student,
          reviewData.employer,
          false,
          false,
          true
        );

        res.send({ code: 200, msg: "review saved" });
      } else {
        console.log("review body doesn't exist in db");
        const reviewPayload = {
          project: pid,
          employer: eid,
          student: sid,
          stdReviewed: true,
          stdReview: { rating }
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

  router.post("/getacademics", userAuthCheck, async (req, res) => {
    console.log("inside get academics in student route12341");
    //console.log('req',req.body.tokenData.userid)
    const _id = req.body.tokenData.userid;
    let profile_data = await userModal.findById(_id).populate("workPreference");
    const tag_data = await tagModal.find();

    console.log("tags, ", tag_data);

    // profile_data.suggestions = tag_data
    profile_data.password = "";

    let resData = {
      profile_data,
      suggestions: tag_data
    };

    console.log("res data, ", resData);

    console.log("prof", profile_data);
    if (profile_data) {
      console.log("sending res");
      res.send({ code: 200, resData });
    } else {
      console.log("no user alive here");
      res.send({ code: 404, msg: "user not found." });
    }
  });

  router.post("/editacademics", userAuthCheck, async (req, res) => {
    console.log(":editacademicssss:");
    console.log("payload", req.body);
    //console.log('reddq',req.body.tokenData.userid)
    try {
      const _id = req.body.tokenData.userid;
      const data = req.body.data;
      console.log("data is here, ", data);

      const email = data.secondaryemail;
      console.log("se, ", email);
      if (email) {
        //add e-validation in academics.jsx
        const userExists = await userModal.findOne({
          email
        });
        console.log("user, ", userExists);
        if (!userExists) {
          console.log("no pm match");
          const sData = await userModal.findOne({
            secondaryemail: email
          });
          let smFlag = false;
          if (sData && sData._id != _id) {
            smFlag = true;
          }
          if (!smFlag) {
            console.log("no sm match");
            const hash = crypto
              .createHmac("sha256", "verificationHash")
              .update(email)
              .digest("hex");
            console.log("d", hash);
            data.verificationhex = hash;
            console.log("ccc");

            const profile_data = await userModal.findByIdAndUpdate(_id, data);
            console.log("updated profile, ", profile_data);
            if (profile_data) {
              const msg = sData
                ? sData._id == _id
                  ? "Profile updated"
                  : "Profile updated, verify secondary email"
                : "Profile updated, verify secondary email";
              res.send({ code: 200, msg, profile_data });



              // transporter.sendMail(mailOptions);

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

              const svLink = `${serverPath}/user/verifysec/${profile_data.verificationhex}`
              console.log('about to verify sm with link, ', svLink)
              let mailOptions = {
                from: "t.valaucius@gmail.com",
                to: data.secondaryemail,
                subject: "Please verify your alternate email",
                text: `Please click on this link to verify your email address ${svLink}`
              };

              transporter.sendMail(mailOptions);
            } else {
              res.send({ code: 404, msg: "user not found." });
            }
          } else {
            res.send({
              code: 400,
              msg: "Email already registered."
            });
          }
        } else {
          res.send({
            code: 400,
            msg: "Email already registered."
          });
        }
      } else {
        console.log("checking url before updating, ", data.url);
        const profile_data = await userModal.findByIdAndUpdate(_id, data);
        console.log("old data is, ", profile_data);
        const newProfile = await userModal.findById(_id);
        if (newProfile) {
          console.log("new profile, ", newProfile);
          const msg = "Academic profile updated";
          res.send({ code: 200, msg, newProfile });
        } else {
          res.send({ code: 404, msg: "user not found." });
        }
      }
    } catch (err) {
      res.send({ code: 404, msg: err.message });
    }
  });

  router.post("/getProposalData", userAuthCheck, async (req, res) => {
    console.log("req", req.body.tokenData.userid);
    const _id = req.body.tokenData.userid;
    const psData = await psModel
      .findById(req.body.psId)
      .populate("projectId")
      .populate("studentId")
      .populate("employerId");
    console.log(psData);
    if (psData) {
      const reviewData = await reviewModel.findOne({
        student: psData.studentId,
        project: psData.projectId,
        employer: psData.employerId
      });
      console.log("reviewData, ", reviewData);
      if (!reviewData) {
        console.log("creating new");
        let newReview = new reviewModel({
          student: psData.studentId,
          project: psData.projectId,
          employer: psData.employerId,
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

  router.post("/getprofile", userAuthCheck, async (req, res) => {
    // console.log('inside student route get profile 2')
    // console.log("req", req.body.tokenData.userid);
    const _id = req.body.tokenData.userid;
    const profile_data = await userModal
      .findById(_id, {
        fname: 1,
        lname: 1,
        email: 1,
        phone: 1,
        bio: 1,
        photo: 1,
        secondaryemail: 1,
        address: 1,
        location: 1,
        workPreference: 1
      })
      .populate("workPreference");
    // console.log(profile_data);
    if (profile_data) {
      profile_data.photo = profile_data.photo[0];
      console.log("now, ", profile_data);
      res.send({ code: 200, profile_data });
    } else {
      res.send({ code: 404, msg: "user not found." });
    }
  });

  router.post("/uploadprofilevideo", userAuthCheck, async (req, res) => {
    console.log("user route uploadvideo");
    const _id = req.body.tokenData.userid;
    // console.log('req body', req.body)
    // console.log('i, ', req.body.i)
    uploadProfileVideo(req, res, async err => {
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
              // video[0]: `${filePath.trim()}`
              $set: { "video.0": `${filePath.trim()}` }
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

  router.post("/getbids", userAuthCheck, async (req, res) => {
    const { index, limit } = req.body;
    const _id = req.body.tokenData.userid;
    const bids = await psModel
      .find({ studentId: _id, status: 0 })
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

    const total = await psModel.countDocuments({ studentId: _id, status: 0 });
    const projects = await jobPostModal.find();
    console.log("total, ", total);
    res.status(200).send({ code: 200, bids, total, projects });
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

  router.post("/updatebid", async (req, res) => {
    try {
      const { _id } = req.body;
      const bidData = await psModel.findByIdAndUpdate(_id, req.body);
      if(bidData){
        res
        .status(200)
        .send({ code: 200, msg: "Application successfully updated" });
      }else{
        res
        .status(400)
        .send({ code: 200, msg: "Application not found in database" });
      }
    } catch (err) {
      console.log("err in updatebid, ", err);
      res.status(200).send({ code: 400, msg: "Some error occured" });
    }
  });

  router.post("/uploadprofileimg", userAuthCheck, async (req, res) => {
    console.log("user route uploadimg");
    const _id = req.body.tokenData.userid;
    console.log("req body", req.body);
    console.log("i, ", req.body.i);
    uploadProfileImage(req, res, async err => {
      if (err) {
        res.status(200).json({
          code: 400,
          msg: err
        });
        console.log("err occured in UploadProfileImage");
        console.log(err);
      } else {
        console.log("a");
        if (req.file == undefined) {
          console.log("b");
          res.statusMessage = "Some error has occured, please try again";
          res.status(200).json({
            code: 400,
            msg: res.statusMessage
          });
        } else {
          console.log("c");
          let filePath = req.file.path.replace("public/", "");
          console.log("d,  about to save image path in db");
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

  return router;
};

module.exports = studentRouter;
