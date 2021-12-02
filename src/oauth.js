const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const schema = require('./schema')
const User = schema.User
const Profile = schema.Profile

function generateUniqueAccountName(proposedName) {
    return User.findOne({
        username: proposedName
    }).then(function(user) {
        if (user) {
            proposedName += Math.floor((Math.random() * 100) + 1);
            return generateUniqueAccountName(proposedName); // <== return statement here
        }
        // console.log('proposed name is unique' + proposedName);
        return proposedName;
    }).catch(function(err) {
        console.error(err);
        throw err;
    });
} 

module.exports = (app) => {
    app.enable('trust proxy');
    app.use(session({
        secret: 'doNotGuessTheSecret',
        resave: true,
        saveUninitialized: true,
        cookie:{
            sameSite: 'none',
            secure: true
        }
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
            clientID: '1034567896941-bedfrlrcubgce0qhnbs0n8hcs43fb5hm.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: "/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            // console.log(profile)
            User.findOne({ googleId: profile.id }).exec((err, user) => {
                if (err) 
                    return done(err)
                
                if (!user) {
                    // No user was found, create a new user with values from Google
                    let accName = profile.name.givenName
                    generateUniqueAccountName(accName).then(function (uniqueName){
                        new Profile({
                            username: uniqueName,
                            headline: "",
                            avatar: profile.photos[0].value,
                            following: [],
                        }).save()
    
                        new User({
                            username: uniqueName,
                            email: profile.emails[0].value,
                            googleId: profile.id,
                            googleToken: accessToken
                        }).save(function(err, newUser) {
                            if (err) 
                                console.log(err);
                            return done(err, newUser);
                        });
                    }).catch(function(err) {
                        return done(err)
                    });
                } else {
                    // Found user. Return
                    console.log('Should be something wrong about Callback')
                    return done(err, user);
                }
            })
        })
    );

    // Redirect the user to Google for authentication.  When complete,
    // Google will redirect the user back to the application at
    //     /auth/google/callback
    app.get('/auth/google', passport.authenticate('google',{ scope: [
        'https://www.googleapis.com/auth/plus.login',
        'email', 'profile'
    ]})); // could have a passport auth second arg {scope: 'email'}

    // Google will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get('/auth/google/callback',
        passport.authenticate('google', { 
            successRedirect: 'wx19ricebook.surge.sh/main',
            failureRedirect: 'wx19ricebook.surge.sh' ,
            // successRedirect: 'http://localhost:3001/main', 
            // failureRedirect: '/' 
        }));
}
