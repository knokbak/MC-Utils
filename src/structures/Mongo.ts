import mongoose from "mongoose";
import config from "../config";

export = async () => {
  await mongoose.connect(config.db.mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  });
  return mongoose;
};
