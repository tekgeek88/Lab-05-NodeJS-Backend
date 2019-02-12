//express is the framework we're going to use to handle requests
const express = require('express');

//retrieve the router pobject from express
var router = express.Router();

//add a get route to the router. 
router.get("/", (req, res) => {
    setTimeout(() => {
        res.send({
            message: "Thanks for GET waiting"
        });
    }, 1000);
});

//add a post route to the router.
router.post("/", (req, res) => {
    setTimeout(() => {
        res.send({
            message: "Thanks for POST waiting"
        });
    }, 1000);
});

module.exports = router;