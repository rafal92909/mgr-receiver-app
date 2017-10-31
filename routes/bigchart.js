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


router.get('/get-data', function (req, res, next) {
    let itemId = req.query.itemId;
    let startdate = req.query.startdate;
    startdate = Math.floor(startdate);
    let stopdate = req.query.stopdate;
    stopdate = Math.ceil(stopdate);
    let range = stopdate - startdate;



    DescFrame.find({ 'ID.VALUE': itemId }).sort({ _id: -1 }).limit(1).exec(function (err, descFrame) {
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            });
        }
        if (descFrame.length > 0) {
            let idColName = descFrame[0]._doc.ID.KEY;
            let dateColName = descFrame[0]._doc.DATE.KEY;

            if (startdate == 0 && stopdate == 0) {
                // 0 - 0 - znaczy maks - pobierz min i max z bazy i ustal range i wykonaaj odpowiedni aggregate

                DataFrame.aggregate(
                    [{ $match: { [idColName]: itemId } },
                    {
                        $group: {
                            _id: null,
                            min: { $min: "$timestamp" },
                            max: { $max: "$timestamp" }
                        }
                    }
                    ]
                ).exec(function (err, dataFrames) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occured',
                            error: err
                        });
                    }
                    if (dataFrames.length == 0) {
                        range = 9999999999999;
                        stopdate = 9999999999999;
                    } else {
                        var minD = dataFrames[0].min;
                        var maxD = dataFrames[0].max;

                        startdate = minD.getTime();
                        stopdate = maxD.getTime();
                        range = stopdate - startdate;
                    }
                    aggregate(startdate, stopdate, range, idColName, dateColName, itemId, res);
                });
            } else {
                // sprawdzac jaki jest range pomiedzy start i stop - pobierac wg szablonu zaproponowanego przez highcharts
                aggregate(startdate, stopdate, range, idColName, dateColName, itemId, res);
            }


        } else {
            res.status(201).json({
                message: 'Success',
                obj: null
            });
        }

    });


});

function aggregate(startdate, stopdate, range, idColName, dateColName, itemId, res) {
    let startD = getDateTime(new Date(startdate));
    let stopD = getDateTime(new Date(stopdate));
    // zakres mniejszy niz 1 dzień - laduj wszystko
    if (range < 24 * 3600 * 1000) {
        DataFrame.find({ [dateColName]: { $gte: startD, $lte: stopD } }).exec(function (err, dataFrames) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occured',
                    error: err
                });
            }
    
            res.status(201).json({
                message: 'Success',
                obj: dataFrames
            });
        });
    } else {
        // zakres mniejszy niz 2 dni - laduj co minute
        if (range < 2 * 24 * 3600 * 1000) {
            DataFrame.aggregate(
                [{ $match: { [idColName]: itemId, [dateColName]: { $gte: startD, $lte: stopD } } },
                {
                    $group: {
                        _id: {
                            year: { $year: "$timestamp" },
                            month: { $month: "$timestamp" },
                            day: { $dayOfMonth: "$timestamp" },
                            hour: { $hour: "$timestamp" },
                            minute: { $minute: "$timestamp" }
                        },
                        record_id: { $first: "$_id" }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
                ]
            ).exec(function (err, dataFrames) {
                getDataCallback(err, dataFrames, res)
            });

        } else {
            // zakres mniejszy niz miesiac - laduj co godzine
            if (range < 31 * 24 * 3600 * 1000) {
                DataFrame.aggregate(
                    [{ $match: { [idColName]: itemId, [dateColName]: { $gte: startD, $lte: stopD } } },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$timestamp" },
                                month: { $month: "$timestamp" },
                                day: { $dayOfMonth: "$timestamp" },
                                hour: { $hour: "$timestamp" }
                            },
                            record_id: { $first: "$_id" }
                        }
                    },
                    {
                        $sort: {
                            _id: 1
                        }
                    }
                    ]
                ).exec(function (err, dataFrames) {
                    getDataCallback(err, dataFrames, res)
                });

            } else {
                // zakres mniejszy niz rok - laduj co dzien
                if (range < 13 * 31 * 24 * 3600 * 1000) {
                    DataFrame.aggregate(
                        [{ $match: { [idColName]: itemId, [dateColName]: { $gte: startD, $lte: stopD } } },
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$timestamp" },
                                    month: { $month: "$timestamp" },
                                    day: { $dayOfMonth: "$timestamp" }
                                },
                                record_id: { $first: "$_id" }
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        }
                        ]
                    ).exec(function (err, dataFrames) {
                        getDataCallback(err, dataFrames, res)
                    });

                } else {
                    // zakres wiekszy niz rok - laduj co miesiac
                    DataFrame.aggregate(
                        [{ $match: { [idColName]: itemId, [dateColName]: { $gte: startD, $lte: stopD } } },
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$timestamp" },
                                    month: { $month: "$timestamp" }
                                },
                                record_id: { $first: "$_id" }
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        }
                        ]
                    ).exec(function (err, dataFrames) {
                        getDataCallback(err, dataFrames, res)
                    });
                }
            }
        }
    }

}

function getDataCallback(err, dataFrames, res) {
    if (err) {
        return res.status(500).json({
            title: 'An error occured',
            error: err
        });
    }
    var dfIDs;
    dfIDs = dataFrames.map(function (df) {
        return df.record_id;
    });

    // pobierz rekordy z DataFrame, o podanych id
    DataFrame.find({ _id: { $in: dfIDs } }).exec(function (err, dataFrames) {
        if (err) {
            return res.status(500).json({
                title: 'An error occured',
                error: err
            });
        }

        res.status(201).json({
            message: 'Success',
            obj: dataFrames
        });
    });
}

function getDateTime(date) {
    let time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, second: '2-digit' });
    let yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();

    mm = (mm > 9 ? '' : '0') + mm;
    dd = (dd > 9 ? '' : '0') + dd;

    return yyyy + '-' + mm + '-' + dd + ' ' + time;
}

// db.getCollection('dataframes').aggregate([ { $match: { "ID": "123456" }},
// {$group: {
//     _id: {
//         year : { $year : "$timestamp" },        
//         month : { $month : "$timestamp" },                            
//         day : { $dayOfMonth : "$timestamp" },    
//         hour : { $hour : "$timestamp" },    
//         minute : { $minute : "$timestamp" },    
//         second : { $second : "$timestamp" }                    
//     },             
//      record_id: {$first: '$_id'}
// }},
// {$project: {
//      "_id": "$_id",                                    
//      "record_id": "$record_id",     
//   }},
// {$sort: {
//     _id: 1
// }}
// ])

module.exports = router;