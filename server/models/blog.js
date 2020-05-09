import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title:{
        type: {String}
    },
    date:{
        type: {String}
    },
    summary:{
        type: {String}
    },
    content:{
        type: {String}
    }
})

const blogModal = mongoose.model('blog',blogSchema);
export default blogModal;
