var mongoose = require('mongoose');  // Allows you to talk to the db
var Loc = mongoose.model('Location'); // Brings in Location model from db

var theEarth = (function() {
    var earthRadius = 6371; // km, miles is 3959

    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
    };

    var getRadsFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    }

    return {
        getDistanceFromRads : getDistanceFromRads,
        getRadsFromDistance : getRadsFromDistance
    };
})();

var meterConversion = (function() {
    var mToKm = function(distance) {
        return parseFloat(distance / 1000);
    };
    var kmToM = function(distance) {
        return parseFloat(distance * 1000);
    };
    return {
        mToKm : mToKm,
        kmToM : kmToM
    };
})();

var buildLocations = function(results) {
    var locations = [];
    results.forEach(function(doc) {
        locations.push({
            distance: meterConversion.mToKm(doc.dis),
            name: doc.obj.name,
            address: doc.obj.address,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            _id: doc.obj._id
        });
    });
    return locations;
};

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.locationsListByDistance = function(req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance);
    // var geoOptions = {
    //     spherical: true,
    //     maxDistance: theEarth.getRadsFromDistance(maxDistance),
    //     limit: 10
    // };
    if (!lng || !lat || !maxDistance) {
        sendJsonResponse(res, 404, {
            "message": "lng, lat, and maxDistance query parameters are required"
        });
        return;
    }
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };
    // Spherical true uses meters instead of radians thus we need to convert
    // km to Meters and back.
    var geoOptions = {
        spherical: true,
        maxDistance: meterConversion.kmToM(maxDistance),
        num: 10
    };
    Loc.geoNear(point, geoOptions, function(err, results, stats) {
        var locations;
        if (err) {
            sendJsonResponse(res, 404, err);
        } else {
            locations = buildLocations(results);
            sendJsonResponse(res, 200, locations)
        }
    });
};

module.exports.locationsCreate = function(req, res) {
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1,
        }, {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2,
        }]
    }, function(err, location) {
        if (err) {
            sendJsonResponse(res, 400, err);
        } else {
            sendJsonResponse(res, 201, location);
        }
    });
};

module.exports.locationsReadOne = function(req, res) {
    if (req.params && req.params.locationid) {
        Loc.findById(req.params.locationid)
            .exec(function(err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, {
                        "message": "locationid not found"
                    });
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 200, location);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationid in request"
        });
    }
};

module.exports.locationsUpdateOne = function(req, res) {
    if(!req.params.locationid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid is required"
        });
        return;
    }
    Loc
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .exec(function(err, location) {
        if (!location) {
            sendJsonResponse(res, 404, {
                "message": "locationid not found"
            });
            return;
        } else if (err) {
            sendJsonResponse(res, 404, err);
            return;
        }
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        location.openingTimes = [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1,
        }, {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2
        }];
        location.save(function(err, location) {
            if (err) {
                sendJsonResponse(res, 404, err);
            } else {
                sendJsonResponse(res, 200, location);
            }
        });
    });
};

module.exports.locationsDeleteOne = function(req, res) {
    var locationid = req.params.locationid;
    if (locationid) {
        Loc.findbyIdAndRemove(locationid)
        .exec(function(err, location) {
            if (err) {
                sendJsonResponse(res, 404, err);
            } else {
                sendJsonResponse(res, 204, null);
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationid"
        });
    }
};