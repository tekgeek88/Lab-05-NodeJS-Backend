//express is the framework we're going to use to handle requests
const express = require('express');

//Create connection to Heroku Database
let db = require('../utilities/utils').db;

let getHash = require('../utilities/utils').getHash;

var router = express.Router();

// Use a validator to check the users credentials
var expressValidator = require('express-validator');
router.use(expressValidator());

const bodyParser = require("body-parser");
//This allows parsing of the body of POST requests, that are encoded in JSON
router.use(bodyParser.json());

//Pull in the JWT module along with out asecret key
let jwt = require('jsonwebtoken');
let config = {
    secret: process.env.JSON_WEB_TOKEN
};

router.post('/', (req, res) => {
    let email = req.body['email'];
    let theirPw = req.body['password'];
    let wasSuccessful = false;

    

    // Validate their email and make sure it has an @ sign and its not blank
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    // Make sure the password is not blank
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false});

    // Check for validation errors
    let errors = req.validationErrors();
    if (errors) {
        return res.status(200).send({
            success: false,
            message: errors
        });
    } else {
        //Using the 'one' method means that only one row should be returned
        db.one('SELECT Password, Salt, Verification FROM Members WHERE Email=$1', [email])
        .then(row => { //If successful, run function passed into .then()          
            let salt = row['salt'];
            //Retrieve our copy of the password
            let ourSaltedHash = row['password']; 
            
            //Combined their password with our salt, then hash
            let theirSaltedHash = getHash(theirPw, salt); 

            //Did our salted hash match their salted hash?
            let wasCorrectPw = ourSaltedHash === theirSaltedHash; 

            if (wasCorrectPw) {

                // If the password was correct check to see if they are verified
                let isVerified = row['verification'];
                if (!isVerified) {
                    // If this fails the wait screen doesn't go away
                    // return res.status(401).send({ success: false,
                    return res.send({ success: false,
                                      msg: 'Your account has not been verified.'
                                    }); 
                } else {
                    //credentials match. get a new JWT
                    let token = jwt.sign({username: email},
                        config.secret,
                        { 
                            expiresIn: '24h' // expires in 24 hours
                        }
                    );
                    //package and send the results
                    res.json({
                        success: true,
                        message: 'Authentication successful!',
                        token: token
                    });
                }

            } else {
                //credentials dod not match
                res.send({
                    success: false,
                    msg: 'Invalid email or password'
                });
            }
        })
        //More than one row shouldn't be found, since table has constraint on it
        .catch((err) => {
            //If anything happened, it wasn't successful
            res.send({
                success: false,
                message: err
            });
        });
    }
});

module.exports = router;
