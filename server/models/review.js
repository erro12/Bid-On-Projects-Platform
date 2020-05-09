import mongoose from "mongoose";
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: "jobpost" },
  empReviewed: {type: Boolean, default: false},
  stdReviewed: {type: Boolean, default: false},
  empReview: {},
  stdReview: {},
  student: { type: Schema.Types.ObjectId, ref: "user" },
  employer: { type: Schema.Types.ObjectId, ref: "user" }
});

const reviewModel = mongoose.model("review", reviewSchema);
export default reviewModel;
