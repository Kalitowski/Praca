const express = require("express");
const session = require("express-session");
const path = require("path");
const routes = require("./routes");
const app = express();
//app.use("/static", express.static('./static/'));
const cors = require("cors");
app.use(cors());
const dbConnection2 = require("./utils/dbConnection2");

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        name: "session",
        secret: "my_secret",
        resave: false,
        
        saveUninitialized: true,
        cookie: {
            maxAge: 3600 * 1000, // 1hr
        },
    })
);


app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

app.use((err, req, res, next) => {
    console.log(err);
    return res.send("Internal Server Error");
});

const server = app.listen(process.env.PORT || 5000, () => {
    const port = server.address().port;
    console.log(`Express is working on port ${port}`);
  });