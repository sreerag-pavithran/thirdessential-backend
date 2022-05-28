const mongoose = require("mongoose");

// Connecting to MongoDB Cluster
mongoose
  .connect(process.env.DBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✔   MongoDB Connected  ✔"))
  .catch((error) =>
    console.log("❌   Error occured connecting MongoDB  ❌", error)
  );
