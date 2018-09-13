var express = require('express');
var github = require("../models/github");

var router = express.Router();

function convertRepos(repos) {
    let reposList = [];
    const reposCount = repos.length;
    for(let i=0; i<reposCount; ++i)
        reposList.push({
            name: repos[i].name,
            link: repos[i].html_url });
    return reposList;
}

function showRepos(req, res, user, repos) {
    let reposList = convertRepos(repos);
    res.render('repositories', 
            { user: user["login"],
              imgLink: user["avatar_url"],
              list: reposList,
        })
}

router.get('/', function(req, res, next) {
    var client_id = process.env.GITHUB_CLIENT;
    var callback = req.getUrl("/github/callback");
    console.log(`Client id: ${client_id}; callback: ${callback}`);
    if(client_id === undefined) {
        res.render('error', {
            message: "Env variable GITHUB_CLIENT was not specified.", 
            error: { status: "Error",
                     stack: "" }})
    }
    else {
        res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${callback}`);
    }
});

router.get('/callback', function(req, res, next) {
    let code = req.query.code;
    if(code == undefined) {
        res.render('error', { message: 'Error retrieving user code from github',
                              error: { status: "Error", stack: req.url } });
    }
    else {
        console.log('Respond from github.com with a code ' + code);
        github.getAccessToken(
            process.env.GITHUB_CLIENT, 
            process.env.GITHUB_SECRET, 
            code)
        .then((accessToken) => {
            console.log('It has get access token ' + accessToken);
            Promise.all([
                github.getUserInfo(accessToken),
                github.getUserRepositories(accessToken)])
            .then(function(values) {
                console.log("Receive user and repos data.");
                showRepos(req, res, values[0], values[1]);
            })
            .catch((err) => {
                console.log('Error getting access token: ' + err);
                res.status(500);
                res.render('error', {"message": "Error getting user information.", "error": err});
            });
        })
        .catch((err) => {
            console.log('Error getting access token: ' + err);
            res.status(500);
            res.render('error', { "message": "Error getting user information.", "error": err });
        });
    }
});


module.exports = router;
