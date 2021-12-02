require('./database')
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  salt: String,
  hash: String,

  googleId: String,
  googleToken: String
})

const profileSchema = new mongoose.Schema({
  username: String,
  // dispname: String,
  headline: String,
  email: String,
  phone: String,
  dob: String,
  zipcode: String,
  avatar: String,
  following: [String],
})

const articleSchema = new mongoose.Schema({
  id: Number,
  author: String,
  title: String,
  body: String,
  image: String,
  date: {
    type: Date,
    default: Date.now
  },
  comments: [{
    commentId: Number,
    author: String,
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
})



module.exports.User = mongoose.model('user', userSchema)
module.exports.Profile = mongoose.model('profile', profileSchema)
module.exports.Article = mongoose.model('article', articleSchema)