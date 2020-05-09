import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const milestoneSchema = new Schema({
    date:{
        type: String
    },
    amount:{
        type: Number,
        default: 0
    },
    target:{
        type: String,
        required: true
    },
    paid:{type: Boolean, default: false},
    task: { type: Schema.Types.ObjectId, ref: 'jobpost', required: true },
})

const milestoneModel = mongoose.model('milestone',milestoneSchema);
export default milestoneModel;