var express = require('express');
var router = express.Router();


router.post('/', function (req, res, next) {
    console.log('dashboard');
    res.status(201).json({
        message: 'dashboard'
    });
});


module.exports = router;