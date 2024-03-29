const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/userdb');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('users', userSchema);
const registrationSchema = z.object({
    username: z.string(5),
    email: z.string().email(),
    password: z.string().min(6)
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/templates/index.html');
});

app.post('/register', async (req, res) => {
    try {
        
        const validatedData = registrationSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const newUser = new User({
            username: validatedData.username,
            email: validatedData.email,
            password:hashedPassword
        });
        console.log(newUser);
        await newUser.save();
        res.sendFile(__dirname + '/templates/home.html');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});