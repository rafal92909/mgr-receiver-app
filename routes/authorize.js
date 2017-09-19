var express = require('express');
var router = express.Router();
//var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var fs = require("fs");

router.post('/login', function (req, res, next) {
    fs.readFile("./myconfig.json", function(err, data) {
        if (err) {
            return res.status(500).json({
                title: 'Cannot read the config file.',
                error: { message: err.message }
            });
        }
        try {
            data = JSON.parse(data);
            if (data.pin !== req.body.pin) {
                return res.status(500).json({
                    title: 'Invalid login credentials.',
                    error: { message: 'Wrong pin code.' }
                });
            }
            var token = jwt.sign({ authorization: 'success' }, data.secret_string, { expiresIn: data.session_time });
            res.status(200).json({
                message: 'Successfully logged in.',
                token: token
            });
        } catch (e) {
            return res.status(500).json({
                title: 'Cannot read the config file.',
                error: { message: e.message }
            });
        }
    });
});

module.exports = router;
