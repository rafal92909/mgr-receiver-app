var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var fs = require("fs");
var mongoose = require('mongoose');
var DescFrame = require('../models/desc-frame');
var DataFrame = require('../models/data-frame');


router.use('/', function (req, res, next) {
    if (req.url == "/") {
        return res.render('index');
    } else {
        fs.readFile("./myconfig.json", function (err, data) {
            if (err) {
                return res.status(500).json({
                    title: 'Cannot read the config file.',
                    error: { message: err.message }
                });
            }
            try {
                data = JSON.parse(data);
                jwt.verify(req.query.token, data.secret_string, function (err, decoded) {
                    if (err) {
                        return res.status(401).json({
                            title: 'Not Authenticated',
                            error: err
                        });
                    }
                    next();
                });
            } catch (e) {
                return res.status(500).json({
                    title: 'Cannot read the config file.',
                    error: { message: e.message }
                });
            }
        });
    }
});



// db.getCollection('dataframes').aggregate([ { $match: { "ID": "123456" }},
// {$group: {
//     _id: {
//         year : { $year : "$timestamp" },        
//         month : { $month : "$timestamp" },        
//         day : { $dayOfMonth : "$timestamp" },
//     },             
//      record_id: {$last: '$_id'}
// }},
// {$project: {
//      "_id": "$_id",                                    
//      "record_id": "$record_id",     
//   }},
// {$sort: {
//     'timestamp': -1
// }}
// ])