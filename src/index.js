import connectDb from "./db/db-config.js";
import { app } from "./app.js";
import { PORT } from "./config/server-config.js";

// console.log("env------------");

connectDb()
.then(() => {
    app.listen(PORT, () => {
        console.log("Server started at port: ", PORT);
    });
})
.catch((err) => {
    console.log("MONGODB Connection Failed: ", err);
})


