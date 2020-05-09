import mongoose from "mongoose";
const Schema = mongoose.Schema;

//functions to check min length of data
const checkMinLength = value => value.length >= 10;

//regex to verify the email

const jobPostSchema = new Schema({
  taskDescription: {
    type: String,
    required: [true, "task description is required!"],
    validate: {
      validator: checkMinLength,
      message: props => `${props.path} requires minimum 10 characters`
    }
  },
  jobTitle: {
    type: String
  },
  jobLocation: {
    type: String
  },
  jobValue: {
    type: Number,
    validate: {
      validator: value => value >= 1,
      message: props => `${props.value} Should be minimum 1.`
    }
  },
  taskDeadline: {
    type: String
  },
  // candidateProfile: {
  //   type: String,
  //   required: [true, "Field is required."]
  // },
  candidateProfile: [{ type: Schema.Types.ObjectId, ref: 'tag' }],
  jobBlock: {
    type: String
  },
  numberOfHours: {
    type: Number,
    validate: {
      validator: value => value >= 1,
      message: props => `${props.value} Should be minimum 1.`
    }

  },
  jobType:{type:String},
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
  creationDate: {type: String},
  status: {type: String, default: 0},
  bids: [{ type : Schema.Types.ObjectId, ref: 'projectstatus' }],
  selected: [{ type : Schema.Types.ObjectId, ref: 'projectstatus' }]
});

const jobPostModal = mongoose.model("jobpost", jobPostSchema);
export default jobPostModal;
