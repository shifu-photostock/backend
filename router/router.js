"use strict"

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const config = require('../config/index');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const url = require('url');
const UsersModel = require('../models/users.model');

//////////////////
//DATABASE SETUP//
//////////////////

const dbURI = "mongodb://" +
    encodeURIComponent(config.db.username) + ":" +
    encodeURIComponent(config.db.password) + "@" +
    config.db.host + ":" +
    config.db.port + "/" +
    config.db.name;

const storage = new GridFsStorage({
    url: dbURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    metadata: {
                        orName: file.originalname,
                        author: ""},
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

let gfs;

const conn = mongoose.createConnection(dbURI);

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

const Grid = require('gridfs-stream');


//////////////
//API ROUTES//
//////////////

module.exports = (app, passport) => {

    app.get('/', (req, res) => {
        console.log('THAT!!! ' + req.session);
        res.send(req.session);
    });

    app.post('/profile/:id/changename', (req, res) => {
        let newName = req.body.newname;
        console.log(newName);
        UsersModel.find({'local.name': newName}, (err, results) => {
            if (err)
                throw err;
            console.log(results === undefined);
            if (results[0] === undefined) {
                UsersModel.findByIdAndUpdate(
                    req.params.id,
                    {'local.name': newName}, (err, user) => {
                        if (err)
                            throw err;

                        console.log('Name updated successful!');
                        res.sendStatus(200);
                    }
                )
            } else {
                res.sendStatus(400);
            }

        });
    });

    app.post('/profile/:id/changemail', (req, res) => {
        let newMail = req.body.newmail;
        newMail = newMail.toLowerCase();
        console.log(newMail);
        UsersModel.find({'local.email': newMail}, (err, results) => {
            if (err)
                throw err;
            console.log(results === undefined);
            if (results[0] === undefined) {
                console.log("Botv lfkmit");
                UsersModel.findByIdAndUpdate(
                    req.params.id,
                    {'local.email': newMail}, (err, user) => {
                        if (err)
                            throw err;

                        console.log('Mail updated successul!');
                        res.sendStatus(200);
                    }
                )
            } else {
                res.sendStatus(400);
            }

        });
    });

    app.post('/profile/:id/changepassword', (req, res) => {
        let oldPassword = req.body.oldpassword;
        let newPassword = req.body.newpassword;
        console.log(req.params.id);
        let id = req.params.id;
        UsersModel.findOne({_id : id}, (err, user) => {
            if (err)
                throw err;

            if (user.validPassword(oldPassword)) {
                UsersModel.findByIdAndUpdate(
                    req.params.id,
                    {'local.password': user.generateHash(newPassword)}, (err, user) => {
                        if (err)
                            throw err;

                        console.log('PAssword updated successul!');
                        res.sendStatus(200);
                    })
            } else {
                res.sendStatus(400);
            }
        })
    });


    app.get('/carousel/:num', (req, res) => {
        console.log(JSON.stringify(req.session));
        let q = url.parse(req.url, true);
        let offsetNum = req.params.num;
        let offset = offsetNum * 5;
        let limit = 5;
        if (q.query.value) {
            limit = Number(q.query.value);
        }
        gfs.files.find().skip(offset).limit(limit).toArray((err, files) => {
            console.log(files);
            if (!files || files.length === 0) {
                res.sendStatus(404);
            } else {
                files.map(file => {
                    if (
                        file.contentType === 'image/jpeg' ||
                        file.contentType === 'image/png'
                    ) {
                        file.isImage = true;
                    } else {
                        file.isImage = false;
                    }
                });
                res.send({files: files});
            }
        });
    });

    app.get('/profile/:id/carousel/:num', (req, res) => {
        let q = url.parse(req.url, true);
        let offsetNum = req.params.num;
        let offset = offsetNum * 5;
        let limit = 5;
        if (q.query.value) {
            limit = Number(q.query.value);
        }
        gfs.files.find({
            'metadata.author': req.params.id
        }).skip(offset).limit(limit).toArray((err, files) => {
            console.log(files);
            if (!files || files.length === 0) {
                res.sendStatus(404);
            } else {
                files.map(file => {
                    if (
                        file.contentType === 'image/jpeg' ||
                        file.contentType === 'image/png'
                    ) {
                        file.isImage = true;
                    } else {
                        file.isImage = false;
                    }
                });
                res.send({files: files});
            }
        });
    });

    app.get('/getallimages', (req, res) => {
        gfs.files.find().toArray((err, files) => {

            if (!files || files.length === 0) {
                res.render('index', {files: false});
            } else {
                files.map(file => {
                    if (file.contentType === 'image/jpeg' || 'image/png') {
                        file.isImage = true;
                    } else {
                        file.isImage = false;
                    }
                });
                res.send({files: files});
            }
        });
    });


    app.post('/upload', upload.single('file'), (req, res) => {
        console.log(req.file.id);
        gfs.files.update({_id: req.file.id}, {$set: {'metadata.author' : req.body.author}}, (err, file) => {
            if (err) throw err;
        console.log('Succes!');
        });
        console.log(req.body.author);
        res.json({file: req.file});
        // res.redirect('/');
    });

    app.get('/image/:filename', (req, res) => {
        gfs.files.findOne({filename: req.params.filename}, (err, file) => {

            if (!file || file.length === 0) {
                return res.status(404).json({
                    err: 'No file exists'
                });
            }

            if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            } else {
                res.status(404).json({
                    err: 'Not an image'
                });
            }
        });
    });

    app.get('/getallusers', async (req, res) => {
            let users = await UsersModel.find().lean().exec();
            res.send(users);
        }
    );

    app.post('/findbyname', (req, res) => {
        UsersModel.findOne({'local.name' : req.body.name}, (err, user) => {
            if (err)
                throw err;

            res.send(user);
        })

    });

    app.post('/findbychar', (req, res) => {
        let charsToFind = req.body.chars;
        let regexpToFind = new RegExp('^' + charsToFind, 'i');
        console.log(regexpToFind);
        UsersModel.find({'local.name': regexpToFind}, (err, users) => {
            if (err)
                throw err;

            res.send(users);
        })
    });

    app.get('/profile/:id', async (req, res) => {
        let user = await UsersModel.find({_id: req.params.id}).lean().exec();
        res.send(user);
    });

    app.get('/profile/:id/getallimages', (req, res) => {
        console.log(req.params.id);
        gfs.files.find(
            {'metadata.author': req.params.id}
        ).toArray((err, files) => {

            if (!files || files.length === 0) {
                res.render('index', {files: false});
            } else {
                files.map(file => {
                    if (file.contentType === 'image/jpeg' || 'image/png') {
                        file.isImage = true;
                    } else {
                        file.isImage = false;
                    }
                });
                res.send({files: files});
            }
        });
    });

    app.delete('/files/:id', (req, res) => {
        gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
            if (err) {
                return res.status(404).json({err: err});
            }

            res.sendStatus(204);
        });
    });

    app.post('/login', passport.authenticate('local-login'),
        function (req, res) {
            res.send({user: req.user});
        });


    app.post('/register', passport.authenticate('local-signup'),
        function (req, res) {
            res.send({user: req.user});
        });


    app.post('/logout', (req, res) => {
        console.log(req.session);
        console.log("WIN WIN" + req.user);
        req.session.destroy(function (err) {
            res.sendStatus(200); //Inside a callback… bulletproof!
        })
    });


};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.sendStatus(401);
}