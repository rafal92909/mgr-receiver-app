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

//////////////////////////////////////////////////////////////////////////////////// loggers
router.get('/get-loggers', function (req, res, next) {
    DescFrame.distinct('ID.VALUE', function(err, ids) { 
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            });
        }
        res.status(201).json({
            message: 'Success',
            obj: ids
        });
    });
});

//////////////////////////////////////////////////////////////////////////////////// data frames
router.get('/get-data-frames', function (req, res, next) {    
    let itemId = req.query.itemId;
    DescFrame.find({'ID.VALUE': itemId }).sort({ _id: -1}).limit(1).exec( function(err, descFrame) { 
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            });
        }        

        let idColName = descFrame[0]._doc.ID.KEY;
        DataFrame.find({ [idColName]: itemId }).sort({ _id: -1}).limit(10).exec(function(err, dataFrames) { 
            if (err) {
                return res.status(500).json({
                    title: 'An error occured',
                    error: err
                });
            }
            res.status(201).json({
                message: 'Success',
                obj: [descFrame, dataFrames]
            });
        });
    });



});

module.exports = router;