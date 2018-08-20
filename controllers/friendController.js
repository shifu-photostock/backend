const User = require('../models/users.model');

exports.sendRequire = (req, res) => {
    User.requestFriend(req.session.passport.user._id, req.body.reqUser, (err) => {
        if (err) throw err;
        res.sendStatus(200);
    })
};

exports.getFriends = (req, res) => {
    User.getFriends(req.session.passport.user._id, (err, friendship) => {
        if (err) throw err;
        console.log(friendship);
        res.send(friendship);
    })
};

exports.removeFriend = (req, res) => {
    User.findOne({_id: req.session.passport.user._id}, (err, master) => {
        if (err) throw err;
        User.findOne({_id: req.body.reqUser}, (err, user) => {
            if (err) throw err;
            User.removeFriend(master._id, user._id, (err, byeFriend) => {
                if (err) throw err;
                res.sendStatus(200);
            })
        })
    });

};