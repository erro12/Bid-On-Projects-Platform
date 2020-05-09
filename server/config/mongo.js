import mongoose from 'mongoose';

export const mongoConnect = async () => {
    try {
        await mongoose.connect('mongodb://admin:bowsyfreelancer@3.133.60.237:27017')
        console.log('Connected to Mongo database')
    }
    catch (e) {
        console.log(`Error connecting to mongo database ${e}`)
    }
}