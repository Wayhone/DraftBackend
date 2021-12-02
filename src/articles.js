const schema = require('./schema')
const uploadImage = require('./uploadCloudinary')
const Profile = schema.Profile
const Article = schema.Article

/*
    A requested article, all requested articles by a user, or array of articles in the loggedInUser's feed
    
    /articles/:id?	
    GET	
    Payload: none;    If specified, :id is a post id or username	
    Response: { articles: [ { _id: 1, author: loggedInUser, ... }, { ... } ] }	
*/
function getArticles(req, res) {
    let username, postId
    if (req.params.id) {
        // Username can not start with a digit
        if (req.params.id[0] >= '0' && req.params.id[0] <= '9')
            postId = req.params.id //, console.log('getArticles: receiving id')
        else
            username = req.params.id //, console.log('getArticles: receiving username')
    }

    if (postId) {
        // Post id specified
        Article.find({ id: postId }).exec((err, articles) => {
            if (!articles) {
                res.status(400).send({Msg: "No such article"})
                return
            }
            res.status(200).send({articles: articles})
        })
    } else if (username) {
        // Username specified
        Article.find({ author: username }).exec((err, articles) => {
            res.status(200).send({articles: articles})
        })
    } else {
        // Nothing specified, return the user's and his/her following users' articles
        let username = req.username
        Profile.findOne({ username }).exec((err, profile) => {
            let users = [username, ...profile.following]
            Article.find({ author: {$in: users} }).sort({ date: -1 }).exec((err, articles) => {
                res.status(200).send({articles: articles})
            })
        })
    }
}

/*
    Update the article :id with a new text if commentId is not supplied. 
    Forbidden if the user does not own the article. 
    If commentId is supplied, then update the requested comment on the article, if owned. 
    If commentId is -1, then a new comment is posted with the text message.

    /articles/:id	
    PUT
    Payload: { text: message, commentId: optional };  :id is a post id
    Response: { articles: [{ _id: 1, author: loggedInUser, ..., comments: [ ... ] }]
*/
function updateArticle(req, res) {
    let username = req.username

    let postId = req.params.id
    if (!postId) {
        res.status(400).send({Msg: "Should supply the post id"})
        return 
    }

    let text = req.body.text
    if (!text) {
        res.status(400).send({Msg: "Should supply the new article"})
        return 
    }

    let commentId = req.body.commentId
    if (!commentId) {
        // Update the article of author: username
        Article.findOneAndUpdate({ id: postId, author: username }, {
            body: text
        }, { returnOriginal: false }).exec((err, article) => {
            // console.log(article)
            res.status(200).send({articles: [article]})
        })
    } else {
        if (commentId === -1) {
            // a new comment is posted with the text message.
            Article.findOne({ id: postId }).exec((err, article) => {
                let newCommentId = article.comments.length + 1
                Article.findOneAndUpdate({ id: postId }, {
                    $push: { comments: {
                        commentId: newCommentId,
                        author: username,
                        text: text,
                    } }
                }, { returnOriginal: false }).exec((err, article) => {
                    res.status(200).send({articles: [article]})
                })
            })
        } else {
            // update the requested comment on the article, if owned.
            console.log(username, ' ', commentId)
            Article.findOneAndUpdate({ 
                id: postId, 
                // 'comments.commentId': commentId, 
                // 'comments.author': username 
                comments: {
                    $elemMatch: {
                        commentId: commentId,
                        author: username
                    }
                }
            }, {
                $set: { 
                    'comments.$.text': text
                }
            }, { returnOriginal: false }).exec((err, article) => {
                res.status(200).send({articles: [article]})
            })
        }
    }
}

/*
    Add a new article for the logged in user, date and id are determined by server.
    
    /article	
    POST
    Payload: { text: message } + { title, image } image is optional 
    Response: { articles: [{ _id: 1, author: loggedInUser, ..., comments: [] } ]}
*/
function postArticle(req, res) {
    let username = req.username
    let postUrl
    if (req.fileurl)
        postUrl = req.fileurl
    else
        postUrl = ''

    let text = req.body.text
    let title = req.body.title
    if (!text || !title) {
        res.status(400).send({Msg: "Should supply the new article text"})
        return 
    }

    Article.find().count((err, count) => {
        new Article({
            id: count + 1,
            author: username,
            title: title,
            body: text,
            image: postUrl,
            comments: []
        }).save((err, article) => {
            // res.status(200).send({articles: [article]})
            Article.find({ author: username }).exec((err, articles) => {
                res.status(200).send({articles: articles})
            })
        })
    })
}

module.exports = (app) => {
    app.get('/articles/:id?', getArticles);
    app.put('/articles/:id', updateArticle);
    // app.post('/article', postArticle)
    app.post('/article', uploadImage('postImage'), postArticle)
}