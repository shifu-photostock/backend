let Comment = require('../models/comments.model');

exports.getAll = async (req, res) => {
    let comments = await Comment.find().lean().exec();
    res.send(comments);
};

exports.getByImage = async (req, res) => {
    let comments = await Comment.find({'imageName': req.params.filename}).lean().exec();
    res.send(comments);
};


exports.addComment = (req, res) => {

    let newComment = new Comment;

    newComment.authorId = req.session.passport.user._id;
    newComment.imageName = req.params.filename;
    newComment.content = req.body.comment;


    newComment.save((err) => {
        if (err) throw err;

        res.send(newComment);
    });
};

exports.deleteComment = (req, res) => {

    Comment.findOne({_id: req.params.id}, (err, comment) => {

        if (!comment) {
            res.send('There is no comment with this ID');
            return;
        }

        if (comment && req.session.passport.user._id === comment.authorId) {
            Comment.findOneAndRemove({_id: req.params.id}, (err) => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.send('It\'s not your comment');
        }
    })
};

exports.editComment = (req, res) => {

    Comment.findOne({_id: req.params.id}, (err, comment) => {
        let newComment = req.body.newcomment;
        if (!comment) {
            res.send('There is no comment with this ID');
            return;
        }

        if (comment && req.session.passport.user._id === comment.authorId) {
            Comment.findOneAndUpdate({_id: req.params.id}, {content : newComment}, (err) => {
                if (err) throw err;
                res.sendStatus(200);
            });
        } else {
            res.send('It\'s not your comment');
        }
    })
};
