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

router.get('/callback', function(req, res, next) {
    let code = req.query.code;
    if(code == undefined) {
        res.render('index', { title: 'Github repsitories of user listener' });
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
                res.render('error', {"message": "Error getting user information.", error: err});
            });
        })
        .catch((err) => {
            console.log('Error getting access token: ' + err);
            res.status(500);
            res.render('error', { "message": "Error getting user information.", error: err });
        });
    }
});

router.get('/repos', function(req, res, next) {
    var imgLink = 'https://avatars2.githubusercontent.com/u/15244872?s=460&v=4'
    var userName = 'Maksim'
    res.render('repositories', 
        { user: userName,
          imgLink: imgLink,
          list: [{name: "1", link: "/1"},
            {name: "2", link: "/2"},
            {name: "3", link: "/3"},
            ]
    });
});

module.exports = router;
