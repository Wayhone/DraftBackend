const schema = require('./schema')
const User = schema.User
const Profile = schema.Profile

/*
    Get the list of users being followed by the requested user
    
    /following/:user?	
    GET	
    Payload: none;  :user is a username
    Response: { username: :user, following: [ usernames ]}	  
*/
function getFollowing(req, res) {
    let username = req.params.user
    if (!username)
        username = req.username
    
    Profile.findOne({ username }).exec((err, profile) => {
        if (!profile) {
            res.status(400).send({Msg: "No such user for its headline"})
            return
        }

        let followingList = profile.following
        let msg = {username: username, following: followingList};
        res.status(200).send(msg)
    })
}

/*
    Add :user to the following list for the logged in user

    /following/:user	
    PUT	
    Payload: none;  :user is a username	
    Response: { username: loggedInUser, following: [ usernames ]}
*/
function followUser(req, res) {
    let toFollow = req.params.user
    let username = req.username
    if (!toFollow) {
        res.status(400).send({Msg: "Should supply the username"})
        return
    }

    // Whether the user to follow is valid
    User.findOne({ username: toFollow }).exec((err, user) => {
        if (!user) {
            res.status(400).send({Msg: "No such user"})
            return
        }

        Profile.findOne({ username }).exec((err, profile) => {
            if (!profile) {
                res.status(400).send({Msg: "No logged in user"})
                return
            }
    
            let followingList = profile.following
            if (followingList.includes(toFollow)) {
                res.status(400).send({Msg: "Already following"})
                return
            }
            followingList.push(toFollow)
            Profile.updateOne({ username }, {
                following: followingList
            }, function() {
                let msg = {username: username, following: followingList};
                res.status(200).send(msg)
            })
        })
    })
}

/* 
    Remove :user to the following list for the logged in user

    /following/:user	
    DELETE	
    Payload: none;    :user is a username
    Response: { username: loggedInUser, following: [ usernames ]}
*/
function unfollowUser(req, res) {
    let toUnfollow = req.params.user
    let username = req.username
    if (!toUnfollow) {
        res.status(400).send({Msg: "Should supply the username"})
        return
    }
    
    Profile.findOne({ username }).exec((err, profile) => {
        if (!profile) {
            res.status(400).send({Msg: "No profile for the logged in user"})
            return
        }

        let followingList = profile.following.filter(each => each !== toUnfollow)
        Profile.updateOne({ username }, {
            following: followingList
        }, function() {
            let msg = {username: username, following: followingList};
            res.status(200).send(msg)
        })
    })
}

module.exports = (app) => {
    app.get('/following/:user?', getFollowing);
    app.put('/following/:user', followUser);
    app.delete('/following/:user', unfollowUser);
}