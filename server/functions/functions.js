//imports
import { userJwtKey, adminJwtKey } from "../config/keys";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pathDirectory from "path";
import notificationModel from "../models/notification";

//checking if request body is valid
export const checkIfEmpty = requestBody => {
  const values = Object.values(requestBody);
  let isEmpty = values.filter(el => !el);
  return {
    isValid: isEmpty.length > 0 ? false : true
  };
};

//signing jwt token
export const signJwt = userid => {
  let token;
  try {
    const tokenData = {
      userid
    };
    token = jwt.sign(tokenData, userJwtKey, {
      expiresIn: "100h"
    });
  } catch (e) {
    token = null;
  }
  return token;
};

export const differenceInDays = async (date1, date2) => {
  console.log("inside function");
  console.log("date1=", date1);
  console.log("date2=", date2);
  // To calculate the time difference of two dates
  let Difference_In_Time = date2.getTime() - date1.getTime();
  console.log("time diff=", Difference_In_Time);

  // To calculate the no. of days between two dates
  let Difference_In_Days = (await Difference_In_Time) / (1000 * 3600 * 24);
  console.log("day diff=", Difference_In_Days);

  return await Difference_In_Days;
};

//password hashing
export const hashPassword = password => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      resolve(hashedPassword);
    } catch (e) {
      reject(false);
    }
  });
};

//verify password hash
export const verifyHash = (password, passwordHash) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isPasswordValid = await bcrypt.compare(password, passwordHash);
      resolve(isPasswordValid);
    } catch (e) {
      reject(false);
    }
  });
};

//verify jwt token
export const verifyJwt = token => {
  return new Promise(async (resolve, reject) => {
    try {
      const isTokenValid = await jwt.verify(token, userJwtKey);
      if (isTokenValid) {
        resolve(isTokenValid);
      }
    } catch (e) {
      reject(false);
    }
  });
};

//signing jwt token for admin
export const signJwtAdmin = adminId => {
  let token;
  try {
    const tokenData = {
      adminId
    };
    token = jwt.sign(tokenData, adminJwtKey, {
      expiresIn: "100h"
    });
  } catch (e) {
    token = null;
  }
  return token;
};

export const verifyJwtAdmin = token => {
  return new Promise(async (resolve, reject) => {
    try {
      const isTokenValid = await jwt.verify(token, adminJwtKey);
      if (isTokenValid) {
        resolve(isTokenValid);
      }
    } catch (e) {
      reject(false);
    }
  });
};

export const checkFileType = (file, cb) => {
  console.log("checking image size and ext");
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  console.log("1, ");
  // Check ext
  const extname = filetypes.test(
    pathDirectory.extname(file.originalname).toLowerCase()
  );
  console.log("2, ", extname);
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  console.log("3, ", mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
};

export const checkFileTypePDF = (file, cb) => {
  console.log("checking pdf size and ext");
  // Allowed ext
  const filetypes = /pdf|jpeg|jpg|png|docs|txt/;
  console.log("1, ");
  // Check ext
  const extname = filetypes.test(
    pathDirectory.extname(file.originalname).toLowerCase()
  );
  console.log("2, ", extname);
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  console.log("3, ", mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images or pdf Only!");
  }
};

export const checkFileTypeV = (file, cb) => {
  // Allowed ext
  const filetypes = /mp4/;
  // Check ext
  const extname = filetypes.test(
    pathDirectory.extname(file.originalname).toLowerCase()
  );
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Videos Only!");
  }
};

export const newNotification = async (
  msg,
  type,
  _jid,
  _pid,
  _sid,
  _eid,
  forStudent,
  empRead,
  stdRead
) => {
  const notification = {
    message: msg,
    type,               //"chat", "task or "payment"
    task: _jid,
    application: _pid,
    student: _sid,
    employer: _eid,
    forStudent,
    empRead,
    stdRead
  };

  const nfData = await new notificationModel(notification);
  console.log("saving new notification, ", nfData);
  const savedNF = await nfData.save();
  console.log("saved new notification, ", savedNF);
};
