const User = require('../user/models/user');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const emailUsernameFilter = require('../../utils/emailUsernameFilter');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

module.exports = {
    registerUser: async (req, res) => {
        const errors = {};
        const { firstName, lastName, email, userName, password, passwordConfirm }  = req.body;

        try {
            // if user with same email or username  exists, fail
            {
                if (await User.findOne({ email })) {
                errors.email = 'Email already exists.';
                }
                if (await User.findOne( {userName} )) {
                    errors.username = 'Username already exists. Choose another username.';
                }
            }

            if (!_.isEmpty(errors)) {
                res.status(400).json({
                    status: 'fail',
                    message: 'Account cannot be created',
                    data: {
                        errors,
                    }
                });
            }
            
            const user = await User.create({
                firstName,
                lastName,
                userName,
                email,
                password,
                passwordConfirm
            });

            const token = signToken(user._id);

            if (user) {
                res.status(201).json({
                    status: 'success',
                    message: 'User account created successfully',
                    data: {
                        token,
                        user
                    }
                });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'fail',
                message: 'Something went wrong',
                error, // This will be modified(Not good to send error log to client)
                // error: error.message
            });
        }
    },

    loginUser: async (req, res) => {
        const { email, password } = req.body;
        
        try {  
            const filter = emailUsernameFilter(email);            
            const user = await User.findOne(filter).select('+password');

            if (!user || !await user.comparePassword(password, user.password)) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Invalid credentials'
                });
            }

            const token = signToken(user._id);

            res.status(200).json({
                status: 'User logged in successfully',
                data: {
                    token,
                    user
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'fail',
                message: 'Something went wrong',
                error, // This will be modified(Not good to send error log to client)
                // error: error.message
            });
        }
        
    },

    protectRoute: async (req, res) => {
        try {
            // 1. Get the token and check if it exists
            let token = req.headers['Authorization'] || req.headers.authorization;
            if (token == undefined) {
                return res.status(422).json({
                    status: 'fail',
                    message: 'Auth token is not supplied'
                });
            }

            if (token.startsWith('Bearer')) token = token.split(' ')[1];

             // 2. Verify token
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_EXPIRES_IN);
                console.log(decoded);
                if (!decoded) {
                    return res.status(422).json({
                        status: 'fail',
                        message: 'Token is not valid'
                    });
                }

                // 3. Check if user still exists
                const { id } = decoded;
                const freshUser = await User.findById(id);
                if (!freshUser) {
                    return res.status(422).json({
                        status: 'fail',
                        message: 'Account does not exist'
                    });
                }
                
                // Grant access to protected route
                req.user = freshUser;

                next();
            }
    
        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'fail',
                message: 'Something went wrong',
                error, // This will be modified(Not good to send error log to client)
                // error: error.message
            });
        }
    },

    protect: async (req, res) => {
        try {
            // 1. Get the token and check if it exists

            let token;
            if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
            ) {
            token = req.headers.authorization.split(' ')[1];
            //   console.log(token);
            }
            // console.log(token);
            if (!token) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'You are not logged in! Please log in to get access'
                });
            }

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);

            // 3. Check if user still exists
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'The user belonging to this token no longer exists'
                });
            }

            // 4. Check if user changed password after the jwt token was issued
            if (freshUser.changedPasswordAfter(decoded.iat)) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'User recently changed password! Please log in again'
                });
            }

            // Grant access to protected route
            req.user = freshUser;
            next();

        } catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'fail',
                message: 'Something went wrong',
                error, // This will be modified(Not good to send error log to client)
                // error: error.message
            });
        }
    }
}