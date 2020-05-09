//imports
import express from "express";
import userModal from "../models/user";
import blogModal from "../models/blog";
import jobPostModal from "../models/jobpost";
import reviewModel from "../models/review";
import faqModal from "../models/faq";
import {
  checkIfEmpty,
  signJwt,
  hashPassword,
  verifyHash,
  differenceInDays
} from "../functions/functions";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { SMPTHOST, SMPTPORT, SMPTEMAIL, SMPTPASS } from "../config/smpt";
import { clientPath, serverPath } from "../config/keys";
import { userAuthCheck } from "../middlewares/middlewares";
import mongoose from "mongoose";
import { uploadProfileImage, uploadProfileVideo } from "../config/multerconfig";
import tagModal from "../models/tags";
import psModel from "../models/projectstatus";
import fs from "fs";

const userRouter = () => {
  //router variable for api routing
  const router = express.Router();

  //post request to signup user
  router.post("/signup", async (req, res) => {
    console.log(":user route signup:");
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
            res.send({
              savedUser,
              code: 200,
              msg: "Data saved successfully, please verify your email address!"
            });

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

            let mailOptions = {
              from: "t.valaucius@gmail.com",
              to: savedUser.email,
              subject: "Please verify your email",
              text: `Please click on this link to verify your email address ${serverPath}/user/verify/${savedUser.verificationhex}`
            };

            transporter.sendMail(mailOptions);
          } else {
            console.log("error in hashing pass");
            res.send({
              code: 400,
              msg: "Some has error occured!"
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
      console.log("error caught in signup ", err.message);
      res.send({
        code: 400,
        msg: err.message
      });
    }
  });

  router.get("/faqs", async (req, res) => {
    try {
      const faqs = await faqModal.find();
      res.send({ code: 200, faqs });
    } catch (err) {
      console.log(err);
      res.send({ code: 404, msg: "error in fetching" });
    }
  });

  //post request to login user
  router.post("/login", async (req, res) => {
    try {
      const { isValid } = checkIfEmpty(req.body);
      if (isValid) {
        const { email, password } = req.body;
        //finding user with email
        const isUserExists = await userModal.findOne({
          email
        });
        if (isUserExists) {
          if (isUserExists.isvalid === false) {
            res.send({
              code: 403,
              msg: "This email is not verified"
            });
          } else {
            if (isUserExists.blocked) {
              res.send({
                code: 403,
                msg: "This profile is blocked. Contact support for details."
              });
            } else {
              const isPasswordValid = await verifyHash(
                password,
                isUserExists.password
              );
              if (isPasswordValid) {
                //valid password
                const token = signJwt(isUserExists._id);
                res.cookie("token", token, {
                  maxAge: 999999999999,
                  signed: true
                });
                res.cookie("isemployer", isUserExists.isemployer, {
                  maxAge: 999999999999,
                  signed: false
                });
                res.send({
                  code: 200,
                  _id: isUserExists._id,
                  msg: "Authenticated"
                });
              } else {
                res.send({
                  code: 404,
                  msg: "Invalid Login Details!"
                });
              }
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

  //get request to verify user email
  router.get("/verify/:hex", async (req, res) => {
    try {
      const verificationhex = req.params.hex;
      const userHex = await userModal.findOne({
        $and: [
          {
            verificationhex
          },
          {
            isvalid: false
          }
        ]
      });
      if (userHex) {
        await userModal.updateOne(
          {
            _id: userHex._id
          },
          {
            isvalid: true
          }
        );
        res.redirect(`${clientPath}?verified=true`);
      } else {
        res.send({
          code: 404,
          msg: "Verification hex not found!"
        });
      }
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!"
      });
    }
  });

router.get("/verifysec/:hex", async (req, res) => {
    try {
      const verificationhex = req.params.hex;
      const userHex = await userModal.findOne({
        $and: [
          {
            verificationhex
          },
          {
            smVerified: false
          }
        ]
      });
      if (userHex) {
        await userModal.updateOne(
          {
            _id: userHex._id
          },
          {
            smVerified: true
          }
        );
        res.redirect(`${clientPath}?verified=true`);
      } else {
        res.send({
          code: 404,
          msg: "Verification hex not found!"
        });
      }
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!"
      });
    }
  });

  //post request for forget password
  router.post("/forgetpassword", async (req, res) => {
    try {
      console.log("inside forget password, ", req.body);
      const { newpassword, hex } = req.body;
      const { isValid } = checkIfEmpty(req.body);
      if (isValid) {
        const userData = await userModal.findOne({
          forgetPassHex: hex
        });
        if (userData) {
          const newhashedPassword = await hashPassword(newpassword);
          if (newhashedPassword) {
            await userModal.updateOne(
              {
                email: userData.email
              },
              {
                password: newhashedPassword,
                forgetPassHex: ""
              }
            );
            res.send({
              code: 200,
              msg: "Password updated successfully!"
            });
          }
        } else {
          res.send({
            code: 404,
            msg: "Wrong token"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid input"
        });
      }
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!"
      });
    }
  });

  //post request for logout user
  router.post("/logout", async (req, res) => {
    console.log("sdsddsdsdsd", req.signedCookies);
    // res.clearCookie("isemployer")
    res.clearCookie("token").send({ code: 200, msg: "cookie cleared!" });
  });

  //post request for reset password
  router.post("/resetpassword", async (req, res) => {
    try {
      const { isValid } = checkIfEmpty(req.body);
      const { email } = req.body;
      if (isValid) {
        const userData = await userModal.findOne({
          email
        });
        if (userData) {
          const forgetPassHex = crypto
            .createHmac("sha256", "forgetPasswordHex")
            .update(userData.email)
            .digest("hex");
          await userModal.updateOne(
            {
              email
            },
            {
              forgetPassHex
            },
            {
              upsert: true
            }
          );
          // let transporter = nodemailer.createTransport({
          //     pool: true,
          //     host: SMPTHOST,
          //     port: SMPTPORT,
          //     secure: true,
          //     auth: {
          //       user: SMPTEMAIL,
          //       pass: SMPTPASS
          //     }
          //   });

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
          //   to: userData.email,
          //   subject: "Reset your password",
          //   text: `Please click on this link to reset your password ${clientPath}/forget?hh=${forgetPassHex}`
          // };

          let mailOptions = {
            from: "t.valaucius@gmail.com",
            to: userData.email,
            subject: "Reset your password",
            text: `Please click on this link to reset your password ${clientPath}/forget?hh=${forgetPassHex}`
          };

          transporter.sendMail(mailOptions);

          res.send({
            code: 200,
            msg: "Please check your email for forget password link!"
          });
        } else {
          res.send({
            code: 404,
            msg: "Email not found!"
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid Data"
        });
      }
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!"
      });
    }
  });

  router.post("/getprofile", userAuthCheck, async (req, res) => {
    console.log("req", req.body.tokenData.userid);
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
        balance: 1,
        url: 1
      })
      .populate("workPreference");

    console.log(profile_data);
    if (profile_data) {
      let projectCount = 0;
      if (profile_data.isemployer) {
        projectCount = await jobPostModal.count({
          createdBy: profile_data._id
        });
      } else {
        // projectCount = await psModel.count({
        //   studentId: profile_data._id,
        //   status: {$gte: 3}
        // });

        const tasks = await psModel.find({ studentId: profile_data._id });
        console.log("tasks to count from, ", tasks);
        tasks.forEach(task => {
          if (task.status >= 3) projectCount++;
        });

        console.log("counted tasks, ", projectCount);
      }
      profile_data.photo = profile_data.photo[0];
      console.log("nowww, ", profile_data);
      res.send({ code: 200, profile_data, projectCount });
    } else {
      res.send({ code: 404, msg: "user not found." });
    }
  });

  router.get("/profileById/:_id", async (req, res) => {
    const { _id } = req.params;
    console.log("id from params, ", _id);
    let profile_data = await userModal
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
        balance: 1,
        url: 1,
        public: 1
      })
      .populate("workPreference");
    profile_data.email = "";
    profile_data.phone = "";
    profile_data.secondaryemail = "";
    console.log(profile_data);
    if (profile_data) {
      let projectCount = 0;
      if (profile_data.isemployer) {
        projectCount = await jobPostModal.count({
          createdBy: profile_data._id
        });
      } else {
        projectCount = await psModel.count({
          studentId: profile_data._id,
          status: 4
        });
      }
      // console.log("before profile_data photo error, ", profile_data);
      profile_data.photo = profile_data.photo[0];
      console.log("now, ", profile_data);

      if (!profile_data.isemployer) {
        const reviews = await reviewModel.find({
          student: profile_data._id,
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
          profile_data: profile_data,
          projectCount,
          avgHardSkills: ahr,
          avgSoftSkills: asr,
          reviewCount: reviews.length
        });
      } else {
        res.send({ code: 200, profile_data: profile_data, projectCount });
      }
    } else {
      res.send({ code: 404, msg: "user not found." });
    }
  });

  router.post("/getProfileById", userAuthCheck, async (req, res) => {
    console.log("req", req.body.uid);
    const _id = req.body.uid;
    let profile_data = await userModal.findById(_id, {
      fname: 1,
      lname: 1,
      email: 1,
      phone: 1,
      bio: 1,
      photo: 1
    });
    console.log(profile_data);
    if (profile_data) {
      profile_data.photo = profile_data.photo[0];
      console.log("now, ", profile_data);
      res.send({ code: 200, profile_data });
    } else {
      res.send({ code: 404, msg: "user not found." });
    }
  });

  router.post("/getBlogById", async (req, res) => {
    console.log("req", req.body.uid);
    const _id = req.body.uid;
    let blog_data = await blogModal.findById(_id, {
      title: 1,
      date: 1,
      summary: 1,
      content: 1
    });
    console.log(blog_data);
    if (blog_data) {
      // blog_data.date = format
      console.log("now, ", blog_data);
      res.send({ code: 200, blog_data });
    } else {
      res.send({ code: 404, msg: "blog not found." });
    }
  });

  router.post("/empProjects", async (req, res) => {
    console.log("inside user root emp projects");

    const _id = req.body.userid;
    console.log("with _id, ", _id);
    try {
      const projects = await jobPostModal
        .find({ createdBy: _id })
        .sort({ _id: -1 })
        .limit(6);

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
      console.log(err);
      res.statusMessage = "Some error has cured, please try again";
      res.status(200).json({
        code: 400,
        msg: res.statusMessage
      });
    }
  });

  router.post("/stdProjects", async (req, res) => {
    console.log("inside user route my projects");

    const _id = req.body.userid;
    console.log("with _id, ", _id);
    console.log("1111111111111");
    try {
      const projects = await psModel
        .find({ studentId: _id })
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

      res.status(200).json({
        code: 200,
        projects
      });
    } catch (err) {
      res.statusMessage = "Some error has cured, please try again";
      res.status(200).json({
        code: 400,
        msg: res.statusMessage
      });
    }
  });

  router.post("/getProjectById", async (req, res) => {
    console.log("req", req.body.projectId);
    const _id = req.body.projectId;
    let projectData = await jobPostModal.findById(_id);
    console.log(projectData);
    if (projectData) {
      console.log("now, ", projectData);
      res.send({ code: 200, projectData });
    } else {
      res.send({ code: 404, msg: "project not found." });
    }
  });

  router.post("/deleteFileFromServer", async (req, res) => {
    console.log("req", req.body.filepath);
    try {
      fs.unlinkSync("public/" + req.body.filepath);
      res.send({ code: 200 });
    } catch (err) {
      console.log(err);
      res.send({ code: 400 });
    }
  });

  router.post("/deleteImageFile", userAuthCheck, async (req, res) => {
    const _id = req.body.tokenData.userid;
    console.log("req", req.body.filepath);
    try {
      fs.unlinkSync("public/" + req.body.filepath);
      const userData = await userModal.findById(_id, { photo: 1 });
      let images = userData.photo;
      const index = images.indexOf(req.body.filepath);
      if (index > -1) {
        images.splice(index, 1);
      }
      const oldData = await userModal.findByIdAndUpdate(_id, {photo: images});
      if(oldData)
        res.send({ code: 200 });
        else{
          res.send({code: 400});
        }
    } catch (err) {
      console.log(err);
      res.send({ code: 400 });
    }
  });

  router.post("/deleteVideoFile", userAuthCheck, async (req, res) => {
    const _id = req.body.tokenData.userid;
    console.log("req", req.body.filepath);
    try {
      fs.unlinkSync("public/" + req.body.filepath);
      const userData = await userModal.findById(_id, { video: 1 });
      let videos = userData.video;
      const index = videos.indexOf(req.body.filepath);
      if (index > -1) {
        videos.splice(index, 1);
      }
      const oldData = await userModal.findByIdAndUpdate(_id, {video: videos});
      if(oldData)
        res.send({ code: 200 });
        else{
          res.send({code: 400});
        }
    } catch (err) {
      console.log(err);
      res.send({ code: 400 });
    }
  });

  router.post("/getProjectByIdPopulatedCreatedBy", async (req, res) => {
    console.log("req", req.body.projectId);
    const _id = req.body.projectId;
    let projectData = await jobPostModal.findById(_id).populate("createdBy");
    console.log(projectData);
    if (projectData) {
      console.log("now, ", projectData);
      res.send({ code: 200, projectData });
    } else {
      res.send({ code: 404, msg: "project not found." });
    }
  });

  router.post("/editprofile", userAuthCheck, async (req, res) => {
    console.log("payloadd", req.body);
    const data = req.body.data;
    console.log("data is, ", data);

    try {
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
          if (sData && sData._id != req.body.tokenData.userid) {
            smFlag = true;
          }
          if (!smFlag) {
            console.log("no sm match");
            const hash = crypto
              .createHmac("sha256", "verificationHash")
              .update(email)
              .digest("hex");
            console.log("d", hash);
            const data = req.body.data;
            data.verificationhex = hash;
            console.log("ccc");
            const _id = req.body.tokenData.userid;

            const profile_data = await userModal.findByIdAndUpdate(_id, data);
            console.log(profile_data);
            if (profile_data) {
              const msg = sData
                ? sData._id == _id
                  ? "Profile updated"
                  : "Profile updated, verify secondary email"
                : "Profile updated, verify secondary email";
              res.send({
                code: 200,
                msg,
                profile_data
              });

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
            res.send({ code: 404, msg: "email already registered." });
          }
        } else {
          res.send({ code: 404, msg: "email already registered." });
        }
      } else {
        const _id = req.body.tokenData.userid;
        const data = req.body.data;
        const profile_data = await userModal.findByIdAndUpdate(_id, data);
        console.log(profile_data);
        if (profile_data) {
          res.send({ code: 200, msg: "Profile updated", profile_data });
        } else {
          res.send({ code: 404, msg: "user not found." });
        }
      }
    } catch (err) {
      console.log(err);
      res.send({ code: 404, msg: err });
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

  router.post("/addnewtag", userAuthCheck, async (req, res) => {
    console.log("payload", req.body);
    console.log("reddq", req.body.tokenData.userid);
    try {
      const _id = req.body.tokenData.userid;
      const data = req.body.data;
      console.log("data", data);
      tagModal.insertMany(data, function(err, result) {
        //**req.body is a list of Vehicle objects**
        if (err) {
          res.send({
            code: 400,
            msg: "error occored",
            data: err
          });
        } else {
          res.send({
            code: 200,
            msg: "Tag added successfully",
            data: result
          });
        }
      });
    } catch (e) {
      console.log("err", e);
      res.send({
        code: 406,
        msg: "Some error has occured! : " + e
      });
    }
  });

  router.get("/getalltag", async (req, res) => {
    try {
      const tag_data = await tagModal.find();
      console.log("tags, ", tag_data);
      let resData = {
        suggestions: tag_data
      };

      console.log("res data, ", resData);
      console.log("sending res");
      res.send({ code: 200, resData });
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!"
      });
    }
  });

  router.get("/getblogs", async (req, res) => {
    try {
      const blog_data = await blogModal.find();
      console.log("blogs, ", blog_data);

      // console.log('res data, ', resData)
      console.log("sending res");
      res.send({ code: 200, blog_data });
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!"
      });
    }
  });

  router.get("/jobsdata", async (req, res) => {
    try {
      //  const jobPosts =  await jobPostModal.find({});
      const jobPosts = await jobPostModal
        .find({ status: 0 })
        .sort({ _id: -1 })
        .populate({
          path: "createdBy",
          select: "fname lname photo"
        })
        .populate("candidateProfile");
      const suggestions = await tagModal.find();

      // let newList = [];
      // newList = await jobPosts.map(async job => {
      //   let Difference_In_Time = new Date() - new Date(job.creationDate);
      //   console.log("time diff=", Difference_In_Time);

      //   // To calculate the no. of days between two dates
      //   let Difference_In_Days =
      //     (await Difference_In_Time) / (1000 * 3600 * 24);
      //   console.log("day diff=", Difference_In_Days);
      //   job.creationDate = await Difference_In_Days;
      //   return await job;
      // });

      // console.log("new list, ", await newList);

      res.send({ jobPosts, suggestions });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  });

  router.post("/jobpost", userAuthCheck, async (req, res) => {
    const _id = req.body.tokenData.userid;
    req.body.data.createdBy = _id;
    try {
      console.log("inside jobPost user route");
      const userExists = await userModal.findOne({
        _id: _id
      });
      console.log("userExists", userExists);
      if (userExists.isemployer) {
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
      }
    } catch (error) {
      res.send({
        code: 404,
        msg: "User not exist"
      });
    }

    //verifying if request body data is valid
    // console.log("reddq", req.body.tokenData.userid);
    // console.log("Router working");
  });

  router.get("/latestBlogs", async (req, res) => {
    try {
      const blogs = await blogModal
        .find()
        .sort({ $natural: -1 })
        .limit(3);
      if (!blogs) {
        console.log("no blogs found");
        res.send({ code: 200, blogs: [] });
      } else {
        console.log("top 3, ", blogs);
        res.send({ code: 200, blogs });
      }
    } catch (err) {
      console.log("err in top 3 blogs,", err);
      console.log({ code: 400, msg: err.message });
    }
  });

  router.post("/projectById", async (req, res) => {
    try {
      const _pid = req.body.projectId;
      console.log("req.params, ", req.body);
      console.log("inside projectById, _pid = ", _pid);
      if (!_pid)
        res.status(400).send({
          code: 400,
          msg: "project id not provided",
          project: undefined
        });
      else {
        const project = await jobPostModal.findById(_pid).populate("createdBy");
        console.log("project from id, ", project);
        res.status(200).send({ code: 200, project });
      }
    } catch (err) {
      console.log(err);
      res.status(400).send({ code: 400, msg: "some error occured" });
    }
  });

  router.post;

  return router;
};

module.exports = userRouter;
