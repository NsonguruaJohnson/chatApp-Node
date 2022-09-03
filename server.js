require('dotenv').config(); // Allows us to use the environment variables in .env

const ConnectDb = require('./utils/database');

const server = require('./app');

const port = process.env.PORT || 9000;
// console.log(process.env);

// Connect to dbs
ConnectDb();

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
} );
