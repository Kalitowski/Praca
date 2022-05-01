const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const dbConnection = require("../utils/dbConnection");

const mysql = require("mysql2");

// Home Page
exports.homePage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `workerlist` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect("/logout");
    }

    res.render("home", {
        user: row[0],
    });
};

// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login");
};

// Login User Page
exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render("login", {
            error: errors.array()[0].msg,
        });
    }

    try {
        const [row] = await dbConnection.execute("SELECT * FROM `workerlist` WHERE `login`=?", [body._login]);

        if (row.length != 1) {
            return res.render("login", {
                error: "Błędny login lub hasło.",
            });
        }

        if (body._password == row[0].password) {
            req.session.userID = row[0].id;
            return res.redirect("/");
        }

        res.render("login", {
            error: "Błędne hasło.",
        });
    } catch (e) {
        next(e);
    }
};

// addDevice Page
exports.addDevices = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `workerlist` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect("/logout");
    }

    res.render("addDevices", {
        user: row[0],
    });
};
//addWorker Page
exports.addWorkers = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `workerlist` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect("/logout");
    }

    res.render("addWorkers", {
        user: row[0],
    });
};
//addWorker Page
exports.addItems = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `workerlist` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect("/logout");
    }

    res.render("addItems", {
        user: row[0],
    });
};

//findDevice
exports.findDevice = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `workerlist` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect("/logout");
    }

    res.render("findDevice", {
        user: row[0],
    });
};

//quality Page
exports.quality = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `workerlist` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect("/logout");
    }

    res.render("quality", {
        user: row[0],
    });
};
