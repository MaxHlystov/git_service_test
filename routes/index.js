var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var client_id = process.env.GITHUB_CLIENT;
    var callback = req.getUrl("github/callback");
    res.render('index', { title: 'Your github repsitories' })
    //res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${callback}`);
});

module.exports = router;