let UsersModel = require('../models/users.model');

exports.changename = (req, res) => {
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

                    console.log('Name updated successful! New name is ' + user.local.name);
                    res.sendStatus(200);
                }
            )
        } else {
            res.sendStatus(400);
        }

    });
};

exports.changemail = (req, res) => {
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
};

exports.changepassword = (req, res) => {
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
};

