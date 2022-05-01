const mysql = require('mysql2');


const dbConnection = mysql.createPool({
    host: "eu-cdbr-west-01.cleardb.com",
    user: "be1bf0e882fe5e",
    password: "815991da",
    database: "heroku_fe1cee8e7791753"
});

module.exports = dbConnection.promise();