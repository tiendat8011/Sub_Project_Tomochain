const express = require('express');
const connectDB = require('./config/db');
var cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

//import routes
const authRoutes = require('./routes/auth');
const { db } = require('./models/User');

// Connect Database
connectDB();


// cors
app.use(cors({ origin: true, credentials: true }));

app.use(bodyParser.json());

// Init Middleware
app.use(express.json({ extended: false }));

//routes middleware
app.use('/api', authRoutes);


app.get('/', (req, res) => res.send('Hello world!'));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running on port ${port}`));