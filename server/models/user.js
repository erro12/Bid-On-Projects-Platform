import mongoose from "mongoose";
const Schema = mongoose.Schema;

//functions to check min length of data
const checkMinLength = value => value.length >= 3;

//regex to verify the email
const regexForEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema({
  fname: {
    type: String,
    required: [true, "Name is required!"],
    validate: {
      validator: checkMinLength,
      message: props => `${props.path} requires minimum three characters`
    }
  },
  lname: {
    type: String,
    required: [true, "Name is required!"],
    validate: {
      validator: checkMinLength,
      message: props => `${props.path} requires minimum three characters`
    }
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    validate: {
      validator: value => regexForEmail.test(value),
      message: props => `${props.value} is not a valid email.`
    },
    unique: [true, "Email already exists."]
  },
  secondaryemail: {
    type: String,
    validate: {
      validator: value => regexForEmail.test(value),
      message: props => `${props.value} is not a valid email.`
    },
    unique: [true, "Email already exists."]
  },
  college: {
    type: String
  },
  studyYear: {
    type: String
  },
  academicSubjects: {},
  additionalQualifications: {},
  universityID: {
    type: String
  },
  phone: {
    type: String
  },
  workPreference: [{ type: Schema.Types.ObjectId, ref: "tag" }],
  bio: {
    type: String
  },
  photo: {
    // type: String, default: "uploads\\profileimages\\default.jpg"
    type: Array,
    default: ["uploads/profileimages/default.jpg"]
  },
  video: {
    type: Array,
    default: []
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
    validate: {
      validator: checkMinLength,
      message: props => `${props.path} required minimum three characters`
    }
  },
  address: {
    type: String
  },
  currentSituation: {
    type: String
  },
  isvalid: { type: Boolean, default: false },
smVerified: { type: Boolean, default: false },
  isemployer: { type: Boolean, required: [true, "User type is required!"] },
  verificationhex: {
    type: String,
    required: [true, "Verification hex is required!"]
  },
  forgetPassHex: { type: String },
  location: { type: String, default: "" },
  blocked: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  url: { type: String, default: "" },
  fieldOfStudies: { type: String, default: "" },
  hourlyRate: { type: String, default: "" },
  previousExperience: { type: String, default: "" },
  public: { type: Boolean, default: true }
});

const userModal = mongoose.model("user", userSchema);
export default userModal;
