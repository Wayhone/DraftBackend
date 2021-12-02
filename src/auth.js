const md5 = require('md5')

const schema = require('./schema')
const User = schema.User
const Profile = schema.Profile

// let sessionUser = {};
let cookieKey = "sid";

if (!process.env.REDIS_URL) {
    console.error('*******************************************************************************\n')
    console.error('You must set the REDIS_URL environment variable for Redis to function\n')
    console.error('\texport REDIS_URL="redis:// get value from heroku"\n')
    console.error('*******************************************************************************')
    process.exit(1)
}


const redis = require('redis').createClient(process.env.REDIS_URL);

// method: POST
// payload: { username, email, dob, zipcode, password } + {dispname, phone}
// response: { username: username, result: 'success' }
function register(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let dob = req.body.dob;
    let zipcode = req.body.zipcode;
    
    let phone = req.body.phone;
    // let dispname = req.body.dispname;

    // supply username, password, and...
    if (!username || !password || !email || !dob || !zipcode || !phone) {
        res.status(400).send({Msg: "Should supply the needed information to register"})
        return 
    }

    // Check if the username has been registered
    User.findOne({ username }).exec((err, user) => {
        if (user) {
            res.status(400).send({Msg: "This username has been registered"})
            return
        }

        // Create a new user and his/her profile
        let salt = username + new Date().getTime();
        let hash = md5(salt + password)

        new Profile({
            username,
            // dispname,
            headline: "",
            email,
            phone,
            dob,
            zipcode,
            avatar: "",
            following: [],
        }).save()

        new User({
            username,
            salt,
            hash
        }).save(function(err) {
            if (err) 
                console.log(err);
            let msg = {username: username, result: 'success'};
            res.status(200).send(msg)
        }) 
    });
}

// method: POST
// payload: { username: user, password: password }
// response: { username: user, result: "success"}
function login(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    // supply username and password
    if (!username || !password) {
        res.status(400).send({Msg: "Should supply the needed information to login"})
        return 
    }

    // Check if the username has been registered
    User.findOne({ username }).exec((err, user) => {
        if (!user) {
            res.status(400).send({Msg: "No such user"})
            return
        }

        // Create hash using md5, user salt and request password, check if hash matches user hash
        let hash = md5(user.salt + password);
        if (hash === user.hash) {
            // Create session id, redis store "sessions" hash from session id to user.
            let sid = md5(user.hash + user.salt); 

            // Adding cookie for session id
            res.cookie(cookieKey, sid, { 
                maxAge: 3600 * 1000, 
                httpOnly: true,
                secure: true,
                sameSite: "none", 
            });

            // sessionUser[sid] = username
            // Move the in-memory session map to a Redis store
            redis.hmset('sessions', sid, username);
            // redis.hmget('sessions', sid, function(err, object) {
            //     console.log(object);
            // });
            // redis.hgetall('sessions', function(err, object) {
            //     console.log('All users: ', object);
            // });

            let msg = {username: username, result: 'success'};
            res.status(200).send(msg)
        }
        else {
            res.status(401).send({Msg: "Wrong Password"})   
        }
    });
}

// method: PUT
// payload: none
// response: OK
function logout(req, res) {
    if (req.isAuthenticated()) {
        // console.log('Google Log Out')
        req.logout()
        res.status(200).send({result: "Log out sucessfully"})
    } else {
        let sid = req.cookies[cookieKey]
        // delete sessionUser[sid]
        redis.hdel('sessions', sid)
        res.clearCookie(cookieKey)
        res.status(200).send({result: "Log out sucessfully"})
    }
}

// method: PUT
// payload: { password: newPassword }
// response: { username: loggedInUser, result: 'success' }
function updatPassword(req, res) {
    let newPassword = req.body.password
    if (!newPassword) {
        res.status(400).send({Msg: "Should supply the new password"})
        return 
    }

    // let sid = req.cookies[cookieKey]
    // let username = sessionUser[sid];
    let username = req.username
     // Check if the username exists
    User.findOne({ username }).exec((err, user) => {
        if (!user) {
            res.status(400).send({Msg: "No such user"})
            return
        }

        // Create hash using md5, user salt and request password
        let newHash = md5(user.salt + newPassword);
        User.updateOne({ username }, {
            hash: newHash
        }, function() {
            let msg = {username: username, result: 'success'};
            res.status(200).send(msg)
        })
    });
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        // console.log(req.user.username)
        req.username = req.user.username
        next()
        return
    }

    // likely didn't install cookie parser
    if (!req.cookies) {
        res.status(401).send({Msg: "No cookie parser"})
        return
    }

    let sid = req.cookies[cookieKey];

    // no sid for cookie key
    if (!sid) {
        res.status(401).send({Msg: "No sid for cookieKey"})
        return
    }

    // let username = sessionUser[sid];
    redis.hmget('sessions', sid, function(err, object) {
        let username = object[0]

        // no username mapped to sid
        if (username) {
            req.username = username;
            next();
        }
        else {
            res.status(401).send({Msg: "No username mapped to sid " + sid})
            return
        }
    });
}

// method: GET
// payload: none
// response: { username: username, identity: type }
function accountType(req, res) {
    let username = req.username
    User.findOne({ username }).exec((err, user) => {
        console.log(user)
        if (user.googleId && user.googleId !== '') {
            if (user.salt && user.salt !== '') {
                res.status(200).send({username: username, identity: 'both'})
            } else {
                res.status(200).send({username: username, identity: 'google'})
            }
        } else {
            if (user.salt && user.salt !== '') {
                res.status(200).send({username: username, identity: 'site'})
            } else {
                res.status(400).send({Msg: 'No logged in info'})
            }
        }
    })
}

// method: PUT
// payload: { username: siteUser, password: sitePassword }
// response: { username: siteUser, result: "success"}
function linkAccount(req, res) {
    if (req.isAuthenticated()) {
        let googleName = req.username
        let username = req.body.username;
        let password = req.body.password;

        // supply username and password
        if (!username || !password) {
            res.status(400).send({Msg: "Should supply the needed information to login"})
            return 
        }

        User.findOne({ username }).exec((err, user) => {
            if (!user) {
                res.status(400).send({Msg: "No such user"})
                return
            }
            let hash = md5(user.salt + password);
            if (hash === user.hash) {
                // Find the user with the google username and delete it.
                User.findOneAndDelete({ username: googleName }).exec((err, delUser) => {
                    console.log(delUser)
                    User.updateOne({ username: username }, {
                        googleId: delUser.googleId,
                        googleToken: delUser.googleToken
                    }).exec((err, user) => {
                        // Re-Login
                        req.logout()
                        let sid = md5(user.hash + user.salt); 
                        res.cookie(cookieKey, sid, { 
                            maxAge: 3600 * 1000, 
                            httpOnly: true,
                            secure: true,
                            sameSite: "none",
                        });
                        redis.hmset('sessions', sid, username);

                        let msg = {username: username, result: 'success'};
                        res.status(200).send(msg)
                    })
                })

                // Merge the following
                Profile.findOneAndDelete({ username: googleName }).exec((err, delProfile) => {
                    let toMergeFollowing = delProfile.following
                    console.log(toMergeFollowing)
                    Profile.findOne({ username }).exec((err, profile) => {
                        let followingList = profile.following
                        // Avoid repeat follow
                        toMergeFollowing.forEach(toFollow => {
                            if (followingList.includes(toFollow) === false) {
                                followingList.push(toFollow)
                            }
                        });

                        Profile.updateOne({ username }, {
                            following: followingList
                        })
                    })
                })
            }
            else {
                res.status(401).send({Msg: "Wrong Password"})   
            }
        });

    } else {
        res.status(400).send({Msg: "Link Account is only available to Google Account"})
    }
}

// method: PUT
// payload: {}
// response: { username: siteUser, result: "success"}
function unlinkAccount(req, res) {
    let username = req.username
    User.updateOne({ username: username }, {
        $unset: {
            googleId: "",
            googleToken: ""
        }
    }).exec((err, user) => {
        let msg = {username: username, result: 'success'};
        res.status(200).send(msg)
    })
}

module.exports = (app) => {
    app.post('/login', login);
    app.post('/register', register);
    app.use(isLoggedIn);
    app.put('/logout', logout);
    app.put('/password', updatPassword);

    app.get('/account', accountType);
    app.put('/account', linkAccount);
    app.put('/unlink', unlinkAccount);
}

