const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors')

const oauth = require('./src/oauth')
const auth = require('./src/auth')
const profile = require('./src/profile')
const following = require('./src/following')
const articles = require('./src/articles')

const hello = (req, res) => {
    res.send('Backend for wx19ricebook')
}

var corsOptions = {
    // origin: 'http://localhost:3001',
    origin: 'https://wx19ricebook.surge.sh',
    credentials: true,
    exposedHeaders: ["set-cookie"]
}

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// app.use(cors())
app.use(cors(corsOptions))


app.get('/', hello);

oauth(app)
auth(app)
profile(app)
following(app)
articles(app)

const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    const addr = server.address()
    console.log(`Server listening at http://${addr.address}:${addr.port}`)
})