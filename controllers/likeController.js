const Like = require('../models/likes.model');

exports.getAll = (req, res) => {
    Like.find((err, likes) => {
        if (err) throw err;
        res.send(likes);
    })
};

exports.getByImage = (req, res) => {
    Like.find({'imageName': req.params.filename}, (err, likes) => {
        if (err) throw err;
        res.send(likes);
    })
};

exports.like = (req, res) => {
    let newLike = new Like;

    newLike.authorId = req.session.passport.user._id;
    newLike.imageName = req.params.filename;

    newLike.save((err) => {
        if (err) throw err;
        res.send(newLike);
    })
};

exports.unlike = (req, res) => {
    Like.findOneAndRemove({'imageName': req.params.filename}, (err) => {
        if (err) throw err;
        res.sendStatus(200);
    })
};