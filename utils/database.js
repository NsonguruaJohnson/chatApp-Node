const mongoose = require('mongoose');

const DB = process.env.DATABASE_LOCAL;

const connectDb = async () => {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            autoCreate: true,
        });
        console.log("MongoDb connected ...")

    } catch (err) {
        console.log('Databse connection failed');
        console.log(err);
        console.log(err.message);

        // Exit with failure
        process.exit(1);
    }
}

module.exports = connectDb;
