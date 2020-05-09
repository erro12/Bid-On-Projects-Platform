import mongoose from "mongoose";
const Schema = mongoose.Schema;

//functions to check min length of data
const checkMinLength = value => value.length >= 3;

//regex to verify the email
const regexForEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const adminSchema = new Schema({
  email: {
    type: String,
    required: [true, "Email is required."],
    validate: {
      validator: value => regexForEmail.test(value),
      message: props => `${props.value} is not a valid email.`
    },
    unique: [true, "Email already exists."]
  },

  password: {
    type: String,
    required: [true, "Password is required!"],
    validate: {
      validator: checkMinLength,
      message: props => `${props.path} required minimum three characters`
    }
  },
  isvalid: { type: Boolean, default: false },
  verificationhex: {
    type: String,
    required: [true, "Verification hex is required!"]
  },
  forgetPassHex: { type: String }
});

const adminModel = mongoose.model("admin", adminSchema);
export default adminModel;
