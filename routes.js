const router = require("express").Router();
const { body } = require("express-validator");

//
const dbConnection = require("./utils/dbConnection2");

const { homePage, addDevices, addWorkers, addItems, login, loginPage, quality, findDevice } = require("./controllers/userController");

const ifNotLoggedin = (req, res, next) => {
    if (!req.session.userID) {
        return res.redirect("/login");
    }
    next();
};

const ifLoggedin = (req, res, next) => {
    if (req.session.userID) {
        console.log(res.local.user.position);

        return res.redirect("/");
    }
    next();
};

router.get("/", ifNotLoggedin, homePage);

router.get("/login", ifLoggedin, loginPage);
router.post("/login", ifLoggedin, [body("_login", "zle podane imie?").notEmpty().escape().trim(), body("_password", "złe hasło?").notEmpty().trim()], login);

router.get("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        next(err);
    });
    res.redirect("/login");
});

// worker list - admin

dbConnection.query("SELECT * FROM workerlist", function (err, rows, fields) {
    
    units = rows;

    workers = units;

    router.get("/addWorkers", addWorkers, function (req, res) {
        res.send(workers);
    });
});

//add worker - admin

router.post("/addWorker", (req, res) => {
    worker = {
        first: req.body.first,
        last: req.body.last,
        position: req.body.position,
        password: "nowy1234",
        login: req.body.first + "." + req.body.last,
    };

    const insertQuery = "INSERT INTO workerlist SET ?";
    dbConnection.query(insertQuery, worker, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            dbConnection.query("SELECT * FROM workerlist", function (err, rows, fields) {
                
                units = rows;

                workers = units;

                router.get("/addWorker", function (req, res) {
                    res.send(workers);
                });
            });

            res.redirect("back");
        }
    });
});

//delete worker - admin
router.get("/deleteWorker/:id", function (req, res) {
    dbConnection.query("DELETE FROM `workerlist` WHERE `id`=?", [req.params.id], function (error, results, fields) {
        if (error) throw error;
        workers = workers;

        dbConnection.query("SELECT * FROM workerlist", function (err, rows, fields) {
           
            units = rows;

            workers = units;
            router.get("/addWorker", function (req, res) {
                res.send(workers);
            });
        });

        res.redirect("back");
    });
});

//New password -all

router.post("/newPassword", (req, res) => {
    password = req.body.newPassword;
    userId = req.body.userId;

    dbConnection.query("UPDATE workerlist SET password=? WHERE id=? ", [password, userId], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("back");
        }
    });
});

//find device - all/quality

router.get("/findDevice", findDevice);

router.post("/findDevice", (req, res) => {
    sn = req.body.sn;

    dbConnection.query("SELECT * FROM devicelist WHERE sn=?", [req.body.sn], function (err, rows, fields) {
        if (rows.length !== 1) {
            return res.redirect("/findDevice");
        }
        units = rows;

        showDevice = units;

       

        router.get("findDevice", findDevice, function (req, res) {
            res.send(showDevice);
        });

        // add itemList to device

        dbConnection.query("SELECT * FROM itemlist", function (err, rows, fields) {
           
            units = rows;

            addItemlisToDevice = units;

            router.get("/additemlisttodevice", homePage, function (req, res) {
                res.send(addItemlisToDevice);
            });
            res.redirect("back");
        });
    });

    //add item to device

    router.post("/addItemtoDevice", (req, res) => {
        itemToDevice = {
            sn: req.body.sn,
            name: req.body.name,
            type: req.body.type,
            quantity: req.body.quantity,
            status: "NIE WYDANO",
        };

        variableToUpdateName = itemToDevice.name;
        variableToUpdateType = itemToDevice.type;
        variableToUpdateQuantity = itemToDevice.quantity;

        dbConnection.query("INSERT INTO itemlist SET ?", itemToDevice, (err, result) => {
            if (isNaN(variableToUpdateQuantity)) {
                return res.redirect("/findDevice");
            } else {
                // update item after add item to device

                dbConnection.query("SELECT * FROM itemlist WHERE name=? AND type=?", [variableToUpdateName, variableToUpdateType], function (err, rows, fields) {
                   

                    var oldNumber = rows[0].quantity;
                    var a = parseInt(oldNumber);

                    var b = parseInt(variableToUpdateQuantity);

                    stock = a - b;

                    dbConnection.query("UPDATE itemlist SET quantity=? WHERE name=? AND type=? AND sn='brak'", [stock, variableToUpdateName, variableToUpdateType], (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            dbConnection.query("SELECT * FROM itemlist", function (err, rows, fields) {
                                
                                units = rows;

                                addItemlisToDevice = units;

                                router.get("/additemlisttodevice", function (req, res) {
                                    res.send(addItemlisToDevice);
                                });
                                res.redirect("back");
                            });

                            dbConnection.query("SELECT * FROM itemlist", function (err, rows, fields) {
                                
                                units = rows;

                                items = units;

                                router.get("/findDevice", function (req, res) {
                                    res.send(items);
                                });
                            });
                        }
                    });
                });
            }
        });
    });

    //change status -all
    router.post("/status", (req, res) => {
        status = req.body.status;

        dbConnection.query("UPDATE devicelist SET status=? WHERE sn=? ", [status, sn], function (err, rows, fields) {
            

            dbConnection.query("SELECT * FROM devicelist WHERE sn=?", sn, function (err, rows, fields) {
              
                units = rows;
                //update devicelist after status changes
                dbConnection.query("SELECT * FROM devicelist", function (err, rows, fields) {
                   
                    units = rows;

                    devices = units;

                    router.get("/addDevices", addDevices, function (req, res) {
                        res.send(devices);
                    });
                });

                showDevice = units;

                router.get("/findDevice", function (req, res) {
                    res.send(showDevice);
                });
            });

            res.redirect("back");
        });
    });
});

// item to device issue

router.post("/issueItem", (req, res) => {
    itemid = req.body.itemid;

    dbConnection.query("UPDATE itemlist SET status='WYDANO' WHERE id=? ", itemid, function (err, rows, fields) {
      

        dbConnection.query("SELECT * FROM itemlist", function (err, rows, fields) {
          
            units = rows;

            addItemlisToDevice = units;

            router.get("/additemlisttodevice", function (req, res) {
                res.send(addItemlisToDevice);
            });
            res.redirect("back");
        });
    });
});
//device list - warehouse

dbConnection.query("SELECT * FROM devicelist", function (err, rows, fields) {
    
    units = rows;

    devices = units;

    router.get("/addDevices", addDevices, function (req, res) {
        res.send(devices);
    });
});

// add device -warehouse
router.post("/addDevice", (req, res) => {
    device = {
        sn: req.body.sn,
        type: req.body.type,
        status: "NOWY",
        description: req.body.description,
    };

    dbConnection.query("INSERT INTO devicelist SET ?", device, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            dbConnection.query("SELECT * FROM devicelist", function (err, rows, fields) {
               
                units = rows;

                devices = units;

                router.get("/", function (req, res) {
                    res.send(devices);
                });
            });

            res.redirect("back");
        }
    });
});
//delete device - warehouse
router.get("/deleteDevice/:id", function (req, res) {
    var id = req.params.id;

    dbConnection.query("DELETE FROM `devicelist` WHERE `id`=?", [req.params.id], function (error, results, fields) {
      

        dbConnection.query("SELECT * FROM devicelist", function (err, rows, fields) {
          
            units = rows;

            devices = units;
            router.get("/", function (req, res) {
                res.send(devices);
            });
        });
        res.redirect("back");
    });
});

//item list - warehouse

dbConnection.query("SELECT * FROM itemlist", function (err, rows, fields) {
   
    units = rows;

    items = units;

    router.get("/additems", addItems, function (req, res) {
        res.send(items);
    });
});

// update item -warehouse
router.post("/updateItem", (req, res) => {
    dbConnection.query("SELECT * FROM itemlist WHERE name=? AND type=?", [req.body.name, req.body.type], function (err, rows, fields) {
  

        var oldNumber = rows[0].quantity;
        var a = parseInt(oldNumber);
        var newNumber = req.body.quantity;
        var b = parseInt(newNumber);

        stock = a + b;

        dbConnection.query("UPDATE itemlist SET quantity=? WHERE name=? AND type=? AND sn='brak'", [stock, req.body.name, req.body.type], (err, result) => {
            if (isNaN(stock)) {
                return res.redirect("/addItems");
            } else {
                dbConnection.query("SELECT * FROM itemlist", function (err, rows, fields) {
                    units = rows;

                    items = units;

                    router.get("/", function (req, res) {
                        res.send(items);
                    });
                });

                res.redirect("back");
            }
        });
    });
});
//delete item -warehouse
router.get("/deleteItem/:id", function (req, res) {
    dbConnection.query("DELETE FROM `itemlist` WHERE `id`=?"[req.params.id], function (err, results, fields) {
      

        dbConnection.query("SELECT * FROM itemlist", function (err, rows, fields) {
            
            units = rows;

            items = units;
            router.get("/", function (req, res) {
                res.send(items);
            });
        });

        res.redirect("back");
    });
});
//quality

router.get("/quality", quality);

router.post("/showDeviceforQuality", (req, res) => {
    sn = req.body.sn;

    dbConnection.query("SELECT * FROM devicelist WHERE sn=?", sn, function (err, rows, fields) {
        if (rows.length !== 1) {
            return res.redirect("/quality");
     
  }
  refresh = true;
        units = rows;

        showDeviceforQuality = units;
        


        router.get("/quality", quality, function (req, res) {
            res.send(showDeviceforQuality);
        });

        //change status for quality
        router.post("/statusforQuality", (req, res) => {
            status = req.body.status;
            test1 = req.body.test1;
            test2 = req.body.test2;
            test3 = req.body.test3;

            if (test1 && test2 && test3 == "on") {
                dbConnection.query("UPDATE devicelist SET status=? WHERE sn=? ", [status, sn], function (err, rows, fields) {
                    

                    dbConnection.query("SELECT * FROM devicelist WHERE sn=?", sn, function (err, rows, fields) {
                       
                      
                        units = rows;

                        showDeviceforQuality = units;

                        router.get("/", function (req, res) {
                            res.send(showDeviceforQuality);
                        });
                    });

                    res.redirect("back");
                });
            } else {
                res.redirect("back");
            }
        });
        if (refresh) {
            res.redirect("back");
        }
    });
});

module.exports = router;
