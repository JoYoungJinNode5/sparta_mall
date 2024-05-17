import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connect = () => {
  mongoose
    .connect(
      "mongodb+srv://sparta-user:<password>@express-mongo.ncd0rot.mongodb.net/?retryWrites=true&w=majority&appName=express-mongo",
      {
        dbName: "sparta_mall",
      }
    )
    .then(() => console.log("MongoDB 연결에 성공하였습니다."))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB 연결 에러", err);
});

export default connect;
