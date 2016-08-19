////////////////////////////////////////////////////////
// Defined database connection string and used it to  //
// open mongoose connection                           //
////////////////////////////////////////////////////////
var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/Loc8r'
mongoose.connect(dbURI);
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});

//////////////////////////////////////////////////////////////////////////
// Listen for Mongoose connection events and output statuses to console //
//////////////////////////////////////////////////////////////////////////
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

////////////////////////////////////////////////////
// Reusable function to close Mongoose connection //
////////////////////////////////////////////////////
var gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

//////////////////////////////////////////////////////////////////
// Listen to Node processes for termination or restart signals, //
// and call gracefulShutdown function when appropriate passing  //
// a continuation callback.                                     //
//////////////////////////////////////////////////////////////////
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});

process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app shutdown', function() {
        process.exit(0);
    });
});

require('./locations');