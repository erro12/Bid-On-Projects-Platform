import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const psSchema = new Schema({
    projectId:{ type: Schema.Types.ObjectId, ref: 'jobpost' },
    status: {type: Number, default: 0},
    studentId: { type: Schema.Types.ObjectId, ref: 'user' },
    employerId: { type: Schema.Types.ObjectId, ref: 'user' },
    // price: {type: Number, required: true},
    // time: {type: String, required: true},
    detail: {type: String},
    bidDate: {type: String}
})

const psModel = mongoose.model('projectstatus',psSchema);
export default psModel;