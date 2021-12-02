const schema = require('./schema')
const Profile = schema.Profile

const uploadImage = require('./uploadCloudinary')

/*
    Get the headline for a user

    /headline/:user?
    Payload: none; :user is a username
    Response: { username:user, headline:Happy}
*/
function getHeadline(req, res) {
    let username = req.params.user
    if (!username) {
        // If not specified, get the current loggedInUser
        username = req.username
    }

    Profile.findOne({ username }).exec((err, profile) => {
        if (!profile) {
            res.status(400).send({Msg: "No such user for its headline"})
            return
        }
        let msg = {username: username, headline: profile.headline}
        res.status(200).send(msg)
    })
}

/*
    Update the headline for the logged in user
    
    /headline	PUT
    Payload: { headline: Happy }
    Response: { username: loggedInUser, headline:Happy}
*/
function updateHeadline(req, res) {
    let username = req.username

    let newHeadline = req.body.headline
    if (!newHeadline) {
        res.status(400).send({Msg: "Should supply the new headline"})
        return 
    }

    Profile.updateOne({ username }, {
        headline: newHeadline
    }, function() {
        let msg = {username: username, headline: newHeadline};
        res.status(200).send(msg)
    })
}

/*
    Get the email address for the requested user
    
    /email/:user?	GET   
    Payload: none; :user is a username
    Response: { username: user, email: emailAddress }
*/
function getEmail(req, res) {
    let username = req.params.user
    if (!username) {
        // If not specified, get the current loggedInUser
        username = req.username
    }

    Profile.findOne({ username }).exec((err, profile) => {
        if (!profile) {
            res.status(400).send({Msg: "No such user for its email"})
            return
        }
        let msg = {username: username, email: profile.email}
        res.status(200).send(msg)
    })
}

/*
    Update the email addres for the logged in user
    
    /email	PUT
    Payload: { email: newEmailAddress }
    Response: { username: loggedInUser, email: newEmailAddress }
*/
function updateEmail(req, res) {
    let username = req.username

    let newEmailAddress = req.body.email
    if (!newEmailAddress) {
        res.status(400).send({Msg: "Should supply the new email address"})
        return 
    }

    Profile.updateOne({ username }, {
        email: newEmailAddress
    }, function() {
        let msg = {username: username, email: newEmailAddress};
        res.status(200).send(msg)
    })
}

/*
    Get the phone number for the requested user
    
    /phone/:user?	GET   
    Payload: none; :user is a username
    Response: { username: user, phone: phone }
*/
function getPhone(req, res) {
    let username = req.params.user
    if (!username) {
        // If not specified, get the current loggedInUser
        username = req.username
    }

    Profile.findOne({ username }).exec((err, profile) => {
        if (!profile) {
            res.status(400).send({Msg: "No such user for its phone"})
            return
        }
        let msg = {username: username, phone: profile.phone}
        res.status(200).send(msg)
    })
}

/*
    Update the phone number for the logged in user
    
    /phone	PUT
    Payload: { phone: newPhone }
    Response: { username: loggedInUser, phone: newPhone }
*/
function updatePhone(req, res) {
    let username = req.username

    let newPhone = req.body.phone
    if (!newPhone) {
        res.status(400).send({Msg: "Should supply the new phone number"})
        return 
    }

    Profile.updateOne({ username }, {
        phone: newPhone
    }, function() {
        let msg = {username: username, phone: newPhone};
        res.status(200).send(msg)
    })
}

/*
    Get the zipcode for the requested user
    
    /zipcode/:user?	GET   
    Payload: none; :user is a username
    Response: { username: user, zipcode: zipcode }
*/
function getZipcode(req, res) {
    let username = req.params.user
    if (!username) {
        // If not specified, get the current loggedInUser
        username = req.username
    }

    Profile.findOne({ username }).exec((err, profile) => {
        if (!profile) {
            res.status(400).send({Msg: "No such user for its zipcode"})
            return
        }
        let msg = {username: username, zipcode: profile.zipcode}
        res.status(200).send(msg)
    })
}

/*
    Update the zipcode for the logged in user
    
    /zipcode	PUT
    Payload: { zipcode: newZipcode }
    Response: { username: loggedInUser, zipcode: newZipcode }
*/
function updateZipcode(req, res) {
    let username = req.username

    let newZipcode = req.body.zipcode
    if (!newZipcode) {
        res.status(400).send({Msg: "Should supply the new zipcode"})
        return 
    }

    Profile.updateOne({ username }, {
        zipcode: newZipcode
    }, function() {
        let msg = {username: username, zipcode: newZipcode};
        res.status(200).send(msg)
    })
}

/*
    Get the avatar for the requested user
    
    /avatar/:user?	GET   
    Payload: none; :user is a username
    Response: { username: user, avatar: pictureUrl }
*/
function getAvatar(req, res) {
    let username = req.params.user
    if (!username) {
        // If not specified, get the current loggedInUser
        username = req.username
    }

    Profile.findOne({ username }).exec((err, profile) => {
        if (!profile) {
            res.status(400).send({Msg: "No such user for its avatar"})
            return
        }
        let msg = {username: username, avatar: profile.avatar}
        res.status(200).send(msg)
    })
}

/*
    Update the avatar for the logged in user
    
    /avatar	PUT
    Payload:  TO BE FINISHED
    Response: { username: loggedInUser, avatar: newAvatarUrl }
*/

function updateAvatar(req, res) {
    let username = req.username
    let newAvatarUrl = req.fileurl
    // console.log(req.fileurl)
    // console.log(req.fileid)

    Profile.updateOne({ username }, {
        avatar: newAvatarUrl
    }, function() {
        let msg = {username: username, avatar: req.fileurl};
        res.status(200).send(msg)
    })
}

/*
    Get the date of birth in milliseconds for the requested user
    
    /dob/:user?	GET   
    Payload: none; :user is a username
    Response: { username: user, dob: milliseconds }
*/
function getDoB(req, res) {
    let username = req.params.user
    if (!username) {
        // If not specified, get the current loggedInUser
        username = req.username
    }

    Profile.findOne({ username }).exec((err, profile) => {
        if (!profile) {
            res.status(400).send({Msg: "No such user for its date of birth"})
            return
        }
        let msg = {username: username, dob: profile.dob}
        res.status(200).send(msg)
    })
}

module.exports = (app) => {
    app.get('/headline/:user?', getHeadline);
    app.put('/headline', updateHeadline);

    app.get('/email/:user?', getEmail);
    app.put('/email', updateEmail);

    app.get('/phone/:user?', getPhone);
    app.put('/phone', updatePhone);

    app.get('/zipcode/:user?', getZipcode);
    app.put('/zipcode', updateZipcode);

    app.get('/dob/:user?', getDoB);

    app.get('/avatar/:user?', getAvatar);
    app.put('/avatar', uploadImage('avatar'), updateAvatar);
}