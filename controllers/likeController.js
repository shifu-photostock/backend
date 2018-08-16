const Like = require('../models/likes.model');
const User = require('../models/users.model');

exports.getAll = (req, res) => {
    Like.find((err, likes) => {
        if (err) throw err;
        res.send(likes);
    })
};

exports.getByImage = async (req, res) => {
    let likes = await  Like.find({'imageName': req.params.filename}).lean().exec();
    const promises = likes.map(async (like) => {

        const user = await User.findOne({_id: like.authorId});
        like.author = user.local.name;

    });
    await Promise.all(promises);
    res.send(likes);
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
    Like.findOneAndRemove({'imageName': req.params.filename, 'authorId': req.session.passport.user._id}, (err) => {
        if (err) throw err;
        res.sendStatus(200);
    })
};