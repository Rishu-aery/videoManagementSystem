import connectDb from "./db/db-config.js";

// console.log("env------------");

connectDb()
.then()
.catch((err) => {
    console.log("MONGODB Connection Failed: ", err);
    
})


