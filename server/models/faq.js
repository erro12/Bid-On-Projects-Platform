import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const faqSchema = new Schema({
    ques:{
        type: {String}
    },
    ans:{
        type: {String}
    }
})

const faqModal = mongoose.model('faq',faqSchema);
export default faqModal;