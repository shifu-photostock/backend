"use strict"

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const config = require('../config/index');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');
const url = require('url');
const UsersModel = require('../models/users.model');
const LikesModel = require('../models/likes.model');

const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');

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
                        author: "",
                        avatar: false,
                        likes: []},
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
        if (req.session.passport === undefined) {
            res.send([]);
        } else {
            res.send(req.session.passport.user._id);
        }
    });

    app.post('/profile/:id/changename', profileController.changename);

    app.post('/profile/:id/changemail', profileController.changemail);

    app.post('/profile/:id/changepassword', profileController.changepassword);


    app.get('/carousel/:num', (req, res) => {
        console.log(JSON.stringify(req.session));
        let q = url.parse(req.url, true);
        let offsetNum = req.params.num;
        let offset = offsetNum * 5;
        let limit = 5;
        if (q.query.value) {
            limit = Number(q.query.value);
        }
        gfs.files.find({'metadata.avatar' : { $ne: true}}).sort({"uploadDate": -1}).skip(offset).limit(limit).toArray(async (err, files) => {
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
                const promises = files.map(async (file) => {

                    file.likes = await LikesModel.find({imageName: file.filename});

                });
                await Promise.all(promises);

                console.log(files);
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
            'metadata.author': req.params.id,
            'metadata.avatar' : { $ne: true}}).sort({"uploadDate": -1}).skip(offset).limit(limit).toArray(async (err, files) => {
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
                const promises = files.map(async (file) => {

                    file.likes = await LikesModel.find({imageName: file.filename});

                });
                await Promise.all(promises);
                res.send({files: files});
            }
        });
    });

    app.get('/getallimages', (req, res) => {
        gfs.files.find({'metadata.avatar' : { $ne: true}}).sort({"uploadDate": -1}).toArray(async (err, files) => {

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
                const promises = files.map(async (file) => {

                    file.likes = await LikesModel.find({imageName: file.filename});

                });
                await Promise.all(promises);
                res.send({files: files});
            }
        });
    });

    app.get('/getaallimages', async (req, res) => {
        // gfs.files.find({'metadata.avatar': {$ne: true}}).sort({"uploadDate": -1}).toArray((err, files) => {
        let files = await gfs.files.find({'metadata.avatar': {$ne: true}}).sort({"uploadDate": -1}).toArray();
            // files.forEach(async (file) => {
            //     await LikesModel.find({imageName: file.filename}, (likes => {
            //
            //         file.vas = likes;
            //     }))
            // });

            const promises = files.map(async (file) => {

                file.likes = await LikesModel.find({imageName: file.filename});

            });
            await Promise.all(promises);
            console.log();
            res.send(files);
        });




            // files.map(file => {LikesModel.find({imageName: file.filename}, async (likes) => {
            //     await console.log(file);
            //     file = likes;
            //
            //     if (file.contentType === 'image/jpeg' || 'image/png') {
            //         file.isImage = true;
            //     } else {
            //         file.isImage = false;
            //     }
            // })
            //
            // });
            //
            // res.send(files);
            // })
            //          })




    // app.get('/getallallimages', (req, res) => {
    //     gfs.files.find(files => {
    //         files.map((file) => {
    //             LikesModel.find({imageName: file.filename}, (likes => {
    //                 file.vas = likes;
    //             }));
    //         })
    //     }).then(files => {
    //         res.send(files);
    //     })
    // });


    // app.get('/getallallimages', (req, res) => {
    //     gfs.files.find().sort({"uploadDate": -1}).toArray((err, files) => {
    //         let newAr = new Array();
    //         if (!files || files.length === 0) {
    //             res.render('index', {files: false});
    //         } else {
    //             files.map(async file => {
    //
    //                 let likes = await LikesModel.find({imageName : file.filename}).lean().exec();
    //                 // LikesModel.find({imageName : file.filename}, (err, likesList) => {
    //                 //     if (err) throw err;
    //                 //     console.log(file);
    //                 //     file.vas = "111";
    //                 // }).then(li)
    //                 if (file.contentType === 'image/jpeg' || 'image/png') {
    //                     file.isImage = "AHAHAHA"
    //                     file.vas = likes;
    //                     newAr.push(file);
    //                     console.log(file);
    //                 } else {
    //                     file.isImage = false;
    //                 }
    //             });

                // files.map(file => {
                //     LikesModel.find({imageName : file.filename}, (err, likesList) => {
                //         if (err) throw err;
                //         console.log(file);
                //         file.vas = "111";
                //     });
                // });
                // console.log((newAr));
                // res.send({newAr});


    //         }
    //         return files;
    //
    //     }).then((err, files) => {
    //         if (err) throw err;
    //         res.send(files);
    //     });
    // });

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

    app.post('/uploadavatar', upload.single('file'), (req, res) => {
        console.log(req.file);
        let author = req.body.author;
        gfs.files.update({_id: req.file.id},
            {$set:
                    {'metadata.author' : author, 'metadata.avatar' : true }},
            (err, file) => {
            console.log(file);
                if (err) throw err;
                UsersModel.findByIdAndUpdate(author, {'local.avatar' : req.file.filename}, (err, user) => {
                    if (err) throw err;
                    console.log('Avatar uploaded successful!')
                })
        });
        console.log(req.body.author);
        res.json({file: req.file});
        // res.redirect('/');
    });

    app.get('/image/:filename', (req, res) => {
        res.cacheControl = {
            maxAge: 30000000
        };
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
        let idToDelete = req.params.id;
        console.log(req.params.id);
        // let ObjectID = mongoose.mongo.BSONPure.ObjectID;
        // console.log(ObjectID(idToDelete));
        gfs.findOne({"_id": idToDelete}, (err, file) => {
            if (err) throw err;
            console.log(file);
            console.log(file.metadata.avatar);
            if(file.metadata.avatar === true) {
                UsersModel.findOneAndUpdate({'local.avatar' : file.filename}, {$set : {'local.avatar' : ""}},
                    (err, user) => {
                    if(err) throw err;
                    console.log('Avatar was deleted');
                    })
            }
        });
        gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
            if (err) {
                return res.status(404).json({err: err});
            }

            res.sendStatus(204);
        });
    });

    app.delete('/images/:filename', (req, res) => {
        let nameToDelete = req.params.filename;
        console.log(req.params.filename);
        // let ObjectID = mongoose.mongo.BSONPure.ObjectID;
        // console.log(ObjectID(idToDelete));
        gfs.findOne({'filename': nameToDelete}, (err, file) => {
            if (err) throw err;
            console.log(file);
            console.log(file.metadata.avatar);
            if(file.metadata.avatar === true) {
                UsersModel.findOneAndUpdate({'local.avatar' : file.filename}, {$set : {'local.avatar' : ""}},
                    (err, user) => {
                        if(err) throw err;
                        console.log('Avatar was deleted');
                    })
            }
        });
        gfs.remove({'filename': req.params.filename, root: 'uploads'}, (err, gridStore) => {
            if (err) {
                return res.status(404).json({err: err});
            }

            res.sendStatus(204);
        });
    });

    //Comments
    app.get('/getallcomments', commentController.getAll);
    app.get('/image/:filename/comment', commentController.getByImage);
    app.post('/image/:filename/comment', isLoggedIn, commentController.addComment);
    app.delete('/comment/:id', isLoggedIn, commentController.deleteComment);
    app.put('/comment/:id', isLoggedIn, commentController.editComment);


    //Authentication
    app.post('/register', passport.authenticate('local-signup'), authController.register);
    app.post('/login', passport.authenticate('local-login'), authController.login);
    app.post('/logout', authController.logout);


    //Likes
    app.post('/image/:filename/like', isLoggedIn, likeController.like);
    app.delete('/image/:filename/like', isLoggedIn, likeController.unlike);
    app.get('/getalllikes', likeController.getAll);
    app.get('/image/:filename/like', likeController.getByImage);

};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.sendStatus(401);
};