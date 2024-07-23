const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
    name: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    }
});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
    const { name, latitude, longitude } = req.body;
    const user = new User({
        name,
        location: {
            type: 'Point',
            coordinates: [longitude, latitude]
        }
    });
    await user.save();
    res.send('User registered successfully!');
});

app.get('/nearby-users', async (req, res) => {
    const { latitude, longitude, distance } = req.query;
    const users = await User.find({
        location: {
            $near: {
                $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                $maxDistance: distance
            }
        }
    });
    res.json(users);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

