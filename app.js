const express = require('express');

const authRouter = require('./app/auth/route')

const app = express();

// For body request parsing
app.use(express.json());

app.get('/api/v1', (req, res) => {
    res.status(200).json({
        message: 'Chat App Engine is now running',
        time: new Date(Date.now()),
        // RequestTime: new Date().toISOString(),
    });

    // console.log(req.headers.authorization);
    // console.log(req.headers['authorization']);
    // console.log(req.headers.bearer);
});

app.use('/api/v1/auth', authRouter);

module.exports = app;