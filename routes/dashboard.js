var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var fs = require("fs");
var mongoose = require('mongoose');
var DescFrame = require('../models/desc-frame');
var DataFrame = require('../models/data-frame');
var InfiniteLoop = require('infinite-loop');

var ilArray = [];
var ioArray = [];

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


// db.getCollection('dataframes').update({ [idColName]: itemId, [dateColName]: { $lte: '2017-10-29 00:10:43'}}, { $set: { read: true }})

//////////////////////////////////////////////////////////////////////////////////// data frames
router.get('/get-data-frames', function (req, res, next) {    
    let itemId = req.query.itemId;
    let port = req.query.iterator;
    fs.readFile("./myconfig.json", function (err, data) {
        if (err) {
            return res.status(500).json({
                title: 'Cannot read the config file.',
                error: { message: err.message }
            });
        }
        try {
            data = JSON.parse(data);
            let data_frame_interval = data.data_frame_interval;
            DescFrame.find({'ID.VALUE': itemId }).sort({ _id: -1}).limit(1).exec( function(err, descFrame) { 
                if (err) {
                    return res.status(500).json({
                        title: 'An error occured',
                        error: err
                    });
                }        
                if (descFrame.length > 0) {
                    let idColName = descFrame[0]._doc.ID.KEY;
                    let dateColName = descFrame[0]._doc.DATE.KEY;
                    DataFrame.find({ [idColName]: itemId }).sort({ _id: -1}).limit(10).exec(function(err, dataFrames) { 
                        if (err) {
                            return res.status(500).json({
                                title: 'An error occured',
                                error: err
                            });
                        }
            
                        if (dataFrames.length > 0) {
                            let date = dataFrames[0]._doc[dateColName];
                            DataFrame.updateMany({ [idColName]: itemId, read: false, [dateColName]: { $lte: date}}, { $set: { read: true }}).exec(function(err, upd) { 
                                if (err) {
                                    return res.status(500).json({
                                        title: 'An error occured',
                                        error: err
                                    });
                                }
                                startConnection(itemId, port, idColName, dateColName, data_frame_interval);
                                res.status(201).json({
                                    message: 'Success',
                                    obj: [descFrame, dataFrames]
                                });
                            });   
                        } else {
                            startConnection(itemId, port);
                            res.status(201).json({
                                message: 'Success',
                                obj: [descFrame, dataFrames]
                            });
                        }
                        
                    });
                } else {
                    startConnection(itemId, port);
                    res.status(201).json({
                        message: 'Success',
                        obj: [descFrame, null]
                    });
                }
                
            });
        } catch (e) {
            return res.status(500).json({
                title: 'Cannot read the config file.',
                error: { message: e.message }
            });
        }
    })




});

function startConnection(itemId, portPart, idColName, dateColName, data_frame_interval) {
    let port = "500" + portPart;

    if (ilArray[itemId] != null) { // element istnieje - stop i usun element
        ilArray[itemId].stop();
        ilArray[itemId] = null;        
    }
    let io;
    if (ioArray[itemId] == null) {
        let http = require('http').Server(express);
        io = require('socket.io')(http);
        
        io.on('connection', (socket) => {
            console.log('connected to socket ' + port);
        
            socket.on('disconnect', function () {
                console.log('disconnected from socked ' + port);
            });
        
            socket.on('add-message', (message) => {
                io.emit('message', { type: 'new-message', data: message });
            });
        });
        
        http.listen(port, () => {
            console.log('started on port ' + port);
        });

        ioArray[itemId] = io;
    } else {
        io = ioArray[itemId];
    }

    let il = new InfiniteLoop;
    il.add(ilGetData, itemId, idColName, dateColName, io);
    il.setInterval(data_frame_interval);
    il.onError(function (error) {
        console.log(error);
    });
    il.run();
    ilArray[itemId] = il;

}

function ilGetData(itemId, idColName, dateColName, io) {
    
    DataFrame.find({ [idColName]: itemId, read: false }).exec(function(err, dataFrames) { 
        if (err) {
            io.emit('message', { type: 'new-message', data: null });
        } else {
            if (dataFrames.length > 0) {
                let date = dataFrames[dataFrames.length - 1]._doc[dateColName];
                DataFrame.updateMany({ [idColName]: itemId, read: false, [dateColName]: { $lte: date}}, { $set: { read: true }}).exec(function(err, upd) { 
                    if (err) {
                        io.emit('message', { type: 'new-message', data: null });
                    } else {
                        io.emit('message', { type: 'new-message', data: dataFrames });
                    }                
                });
            } else {
                io.emit('message', { type: 'new-message', data: null });
            }
        }
    });    
}

module.exports = router;