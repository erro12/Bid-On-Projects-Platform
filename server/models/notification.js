import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    message:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    task: { type: Schema.Types.ObjectId, ref: 'jobpost', required: true },
    application: { type: Schema.Types.ObjectId, ref: 'projectstatus' },
    student: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    employer: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    forStudent:{
        type: Boolean, required: true
    },
    empRead:{type: Boolean, default: false},
    stdRead:{type: Boolean, default: false},
    
})

const notificationModel = mongoose.model('notification',notificationSchema);
export default notificationModel;