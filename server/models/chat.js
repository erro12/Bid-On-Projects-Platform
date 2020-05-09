import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    roomId:{
        type: {String},
        required: true
    },
    messages:{
        type: Array,
        default: []
    },
    student: { type: Schema.Types.ObjectId, ref: 'user' },
    employer: { type: Schema.Types.ObjectId, ref: 'user' },
    stdOnline: {type: Boolean, default: false},
    empOnline: {type: Boolean, default: false},
})

const chatModel = mongoose.model('chat',chatSchema);
export default chatModel;