exports.login = (req, res) => {
  res.send({user: req.user});
};

exports.register = (req, res) => {
  res.send({user: req.user})
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        console.log('Here!');
        if (err) throw err;
        res.sendStatus(200);
    })
};