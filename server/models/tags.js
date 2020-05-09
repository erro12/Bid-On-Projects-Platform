import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const tagSchema = new Schema({
    name:{
        type: {String}
    }
})

const tagModal = mongoose.model('tag',tagSchema);
export default tagModal;