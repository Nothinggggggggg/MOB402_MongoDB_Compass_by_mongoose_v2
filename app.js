const express = require("express");
const expressHbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const employeeRouter = require("./routes/employee_router");

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`The Web server on port ${port}`);
});

// #config HBS
app.engine(
  "hbs",
  expressHbs.engine({
    extname: "hbs",
    helpers: {
      increase: (value, options) => {
        return parseInt(value) + 1;
      },
      decrease: (value, options) => {
        return parseInt(value) - 1;
      },
      shortText: (value, maximum, options) => {
        if (value?.length > maximum) {
          return value.substring(0, maximum) + "...";
        } else {
          return value;
        }
      },
    },
  })
);
app.set("view engine", "hbs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/employees", employeeRouter.router);

// #connect to MongoDB Compass by mongoose
const username = "thailmph27046";
const password = "leemanhthai";
const cluster = "mycluster";
const dbName = "Example";
const uri = `mongodb+srv://${username}:${password}@${cluster}.myjppwj.mongodb.net/${dbName}`;

mongoose.connect(uri);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "Fail: Connect error"));
db.once("open", () => {
  console.log("Connected successfully");
});

// #routes
app.get("/", (req, res) => {
  res.redirect("/employees/list/1");
});
