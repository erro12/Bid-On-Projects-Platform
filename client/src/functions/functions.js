import mixpanel from "mixpanel-browser";
import { userInstance } from "../axios/axiosconfig";
import fs from "fs";

mixpanel.init("e5e1dee9084287277c80676f6b9ea106");

const mapMonth = {
  1: "Jan",
  2: "Feb",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "Aug",
  9: "Sept",
  10: "Oct",
  11: "Nov",
  12: "Dec"
};

export const trackActivity = (activity, data) => {
  console.log("about to tract activity, ", activity);
  console.log("adding data, ", data);
  if (activity) mixpanel.track(activity, data);
  else {
    console.log("can't tract nothing");
  }
};

export const resetTracking = () => {
  mixpanel.reset();
};

export const identifyTracking = user_id => {
  mixpanel.identify(user_id);
};

export const aliasTracking = user_id => {
  mixpanel.alias(user_id);
};

export const setPeopleToTrack = user_data => {
  mixpanel.people.set(user_data);
};

export const validateData = data => {
  let isValid = true;
  data.forEach(el => {
    if (!el) {
      isValid = false;
    }
  });
  return isValid;
};

export const formatDate = date => {
  const dateObj = new Date(date);
  console.log("before format, ", dateObj);
  const prettyDate =
    dateObj.getDate() +
    " " +
    mapMonth[dateObj.getMonth() + 1] +
    " " +
    dateObj.getFullYear();
  console.log("after format, ", prettyDate);
  return prettyDate;
};

export const differenceInDays = async (date1, date2) => {
  console.log("inside function");
  console.log("date1=", date1);
  console.log("date2=", date2);
  // To calculate the time difference of two dates
  let Difference_In_Time = date2.getTime() - date1.getTime();
  console.log("time diff=", Difference_In_Time);

  // To calculate the no. of days between two dates
  let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
  console.log("day diff=", Difference_In_Days);

  return Difference_In_Days;
};

export const deleteImageFile = async filepath => {
  try {
    console.log("will delete file, ", filepath);
    console.log("only name, ", filepath.replace(/^.*[\\\/]/, ""));
    if (filepath.replace(/^.*[\\\/]/, "") === "default.jpg") {
      console.log("won't be deleting default dp");
      return true;
    } else {
      // fs.unlinkSync("http://3.133.60.237:3001/" + filepath);
      const res = await userInstance.post("/deleteImageFile", {
        filepath
      });
      if (res.data.code === 200) {
        console.log("deleted file");
        return true;
      } else {
        console.log("error in backend");
        return false;
      }
    }
  } catch (err) {
    console.log("error in deleting file, ", err);
    return false;
  }
};

export const deleteVideoFile = async filepath => {
  try {
    console.log("will delete file, ", filepath);
    console.log("only name, ", filepath.replace(/^.*[\\\/]/, ""));
    if (filepath.replace(/^.*[\\\/]/, "") === "default.jpg") {
      console.log("won't be deleting default dp");
      return true;
    } else {
      // fs.unlinkSync("http://3.133.60.237:3001/" + filepath);
      const res = await userInstance.post("/deleteVideoFile", {
        filepath
      });
      if (res.data.code === 200) {
        console.log("deleted file");
        return true;
      } else {
        console.log("error in backend");
        return false;
      }
    }
  } catch (err) {
    console.log("error in deleting file, ", err);
    return false;
  }
};

export const deleteFileFromServer = async filepath => {
  try {
    console.log("will delete file, ", filepath);
    console.log("only name, ", filepath.replace(/^.*[\\\/]/, ""));
    if (filepath.replace(/^.*[\\\/]/, "") === "default.jpg") {
      console.log("won't be deleting default dp");
      return true;
    } else {
      // fs.unlinkSync("http://3.133.60.237:3001/" + filepath);
      const res = await userInstance.post("/deleteFileFromServer", {
        filepath
      });
      if (res.data.code === 200) {
        console.log("deleted file");
        return true;
      } else {
        console.log("error in backend");
        return false;
      }
    }
  } catch (err) {
    console.log("error in deleting file, ", err);
    return false;
  }
};

export const isauth = () => {
  let isauth = false;
  const cookie = document.cookie;
  // //console.log(cookie)
  if (/token/.test(document.cookie) && cookie) {
    isauth = true;
  }
  return isauth;
};

export const isadminAuth = () => {
  let isauth = false;
  const cookie = document.cookie;
  ////console.log(cookie)
  if (/adminToken/.test(document.cookie) && cookie) {
    isauth = true;
  }
  return isauth;
};

export const isloggedin = async () => {
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

export const isemployer = () => {
  // let isemployer=false
  // const cookie = document.cookie;
  // if (/isemployer/.test(document.cookie) && cookie) {
  //     var value = "; " + document.cookie;
  //     var parts = value.split("; " + 'isemployer' + "=");
  //     if (parts.length == 2)
  //     isemployer=parts.pop().split(";").shift();
  // }
  // ////console.log('employer returning, ', isemployer)
  // return isemployer

  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf("isemployer") == 0) {
      ////console.log('found cookie, ', c);
      let emp = c.substring("isemployer", c.length).split("=")[1] == "true";
      ////console.log(emp, " and ")
      return emp;
    }
  }
  return false;
};

export const isstudent = () => {
  // let isemployer=false
  // const cookie = document.cookie;
  // if (/isemployer/.test(document.cookie) && cookie) {
  //     var value = "; " + document.cookie;
  //     var parts = value.split("; " + 'isemployer' + "=");
  //     if (parts.length == 2)
  //     isemployer=parts.pop().split(";").shift();
  // }
  // //console.log('employer returning, ', isemployer)
  // return isemployer

  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf("isemployer") == 0) {
      //console.log('found cookie, ', c);
      let emp = c.substring("isemployer", c.length).split("=")[1] == "false";
      //console.log(emp, " and ")
      return emp;
    }
  }
  return false;
};
