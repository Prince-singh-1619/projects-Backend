const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')    
const jwt = require('jsonwebtoken')   
const bodyParser = require('body-parser')   
const dotenv = require('dotenv')
dotenv.config()
const app = express()

const DATABASE_URL = process.env.DATABASE_URL
//connect to MongoDB
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() =>{
    console.log("Connected to MongoDB")
})
.catch((error) =>{
    console.log("Error connecting to MongoDB: ", error)
})

app.use(bodyParser.json())

//importing db models
const User = require('./models/User')
const BlogPost = require('./models/BlogPost')
const Comment = require('./models/Comment')
const secretKey = 'your-secret-key'

app.get('/', (req, res) =>{
    res.send('Welcome to the blog app')
})


//user registration and authentication ------------------------------------------------
app.post('/api/users/register', async(req, res) =>{
    const {username, email, password} = req.body

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    const user = new User({
        username, 
        email, 
        password: hashedPassword,
    })

    user.save()
    .then(user => {
        const token = jwt.sign({userId: user._id}, secretKey, {expiresIn: '1h'})
        res.json({token, user})
    })
    .catch(err => res.status(400).json(err))
})

app.post('/api/users/login', async(req, res) =>{
    const {email, password} = req.body

    const user = await User.findOne({email})  
    if(!user){
        return res.status(400).json({mesage: 'User not found'})
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if(!validPassword){
        return res.status(400).json({message: 'Invalid password'})
    }

    const token = jwt.sign({userId: user._id}, secretKey, {expiresIn: '1h'})
    res.json({token, user})
})


//middleware to authenticate user ------------------------------------------------
function authenticateUser(req, res, next){
    let token = req.header("Authorization")
    if(!token){
        return res.status(401).json({message: 'Unauthorized, token is missing'})
    }
    token = token.splice(" ")[1]
   
    try{
        const verified = jwt.verify(token, secretKey)
        req.user = verified
        next()
    }
    catch(error){
        res.status(400).json({message: 'Invalid token'})
    }
}


//blogpost schema and CRUD operations ------------------------------------------------
app.post('/api/blogposts', authenticateUser, (req, res) =>{
    const {title, content, tags} = req.body
    
    const blogPost = new BlogPost({title, content, tags, author: req.user.userId})
    blogPost.save()
    
    .then(blogPost => res.json(blogPost))
    .catch(err => res.status(400).json(err))
})

app.get('/api/blogposts', (req, res) =>{
    const query = req.query //filter blogposts
    BlogPost.find(query).populate("author") //populate author data
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json(err))
})

app.get('/api/blogposts/:id', (req, res) =>{
    BlogPost.findById(req.params.id).populate("autor")  //populate user data
    .then(post => res.json(post))
    .catch(err => res.status(400).json(err))
})

app.patch('/api/blogposts/:id', authenticateUser, (req, res) =>{
    BlogPost.findByIdAndUpdate(req.params.id, req.body, {new:true})
    .then(post => res.json(post))
    .catch(err => res.status(400).json(err))
})

app.delete('/api/blogposts/:id', authenticateUser, (req, res) =>{
    BlogPost.findByIdAndRemove(req.params.id)
    .then(() => res.json(post))
    .catch(err => res.status(400).json(err))
})


//comment schema and CRUD operations ------------------------------------------------
app.post('/api/comments', authenticateUser, (req, res) => {
    const { text, blogPost } = req.body;
    const comment = new Comment({ commenter: req.user.userId , text, blogPost });
    comment.save()
    .then(comment => res.json(comment))
    .catch(err => res.status(400).json(err));
});
    
app.get('/api/comments', (req, res) => {
    Comment.find().populate("blogPost") //populate blog post
    .then(comments => res.json(comments))
    .catch(err => res.status(400).json(err));
});
    
app.get('/api/comments/:id', (req, res) => {
    Comment.findById(req.params.id).populate("blogPost") //populate blog post
    .then(comment => res.json(comment))
    .catch(err => res.status(400).json(err));
});
    
app.put('/api/comments/:id', authenticateUser, (req, res) => {
    Comment.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(comment => res.json(comment))
    .catch(err => res.status(400).json(err));
});
    
app.delete('/api/comments/:id', authenticateUser, (req, res) => {
    Comment.findByIdAndRemove(req.params.id)
    .then(() => res.json({ message: 'Comment deleted' }))
    .catch(err => res.status(400).json(err));
});


const PORT = process.env.PORT || 3000
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})