var express = require('express');
var request = require('request');


function getAccessToken (githubClient, githubSecret, githubUserCode) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'https://github.com/login/oauth/access_token',
            json: {
                'client_id': githubClient,
                'client_secret': githubSecret,
                'code': githubUserCode,
            },
        };
        request.post(
            options,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("Received access token: " + body);
                    resolve(body['access_token']);
                }
                reject(error);
            });
    });
}

function createGithubRequester(url, appName) {
    return (accessToken) => {
        return new Promise(function(resolve, reject) {
            var options = {
                url: url,
                json: true,
                headers: {
                    'Authorization': 'token ' + accessToken,
                    'User-Agent': appName,
                },
            };
            request.get(
                options,
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log("Get url " + url + " data.");
                        resolve(body);
                    }
                    reject(error || body);
                });
        });
    };
}


// Export functions
var github = {
    "getAccessToken": getAccessToken,
    "getUserInfo": createGithubRequester('https://api.github.com/user', process.env.GITHUB_APP),
    "getUserRepositories": createGithubRequester('https://api.github.com/user/repos', process.env.GITHUB_APP),
};


module.exports = github;
