var _ = require('lodash'),
    express = require('express'),
    bodyParser = require('body-parser'),
    moment = require('moment-timezone');
var app = express();
var data = require('./init_data.json').data;

// Parse application/json
app.use(bodyParser.json());

// Stub data
var locale = 'Asia/Dubai';

// Probably not the safest way to handle CORS
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

// Wrapper to send data with max latency of 1 second
function send(response, data) {
    setTimeout(function() {
        response.send(JSON.stringify(data));
    }, Math.floor(Math.random() * 1000));
}

// End-point to get booked nights
// * start and end are integers (seconds since Unix epoch)
app.get('/reserve/:start/:end', function(request, response) {
    var start = parseInt(request.params.start);
    var end = parseInt(request.params.end);

    if (isNaN(start) || isNaN(end)) {
        response.status(400);
        response.send('Bad Request');
        return;
    }

    var reserved = _.filter(data, function(night) {
        var nightTime = night['time'];
        return nightTime >= start && nightTime <= end;
    });

    send(response, {
        reserved: reserved
    });
});

// End-point to change
app.post('/reserve', function(request, response) {
    var body = request.body;
    var date = body.time;

    if (isNaN(date)) {
        response.status(400);
        response.send('Date is NaN');
        return;
    } else {
        var reserved = body.reserved;
        var name = body.tennantName;

        date = moment
            .unix(date)
            .tz(locale)
            .startOf('day')
            .unix();
        friendlyTime = moment
            .unix(date)
            .tz(locale)
            .startOf('day')
            .format('YYYY-MM-DD HH:mm')

        var tennantData = {
            tennantName: name,
            time: date,
            //friendlyTime: friendlyTime
        };

        var isReserved = _.filter(data, function(night) {
            var nightTime = night['time'];
            // Check if passed timestamp is of same day, since reservations are for complete day
            return moment.unix(date).isSame(moment.unix(nightTime), 'day');
        }).length;

        console.log(isReserved);

        if (reserved && isReserved) {
            response.status(400);
            response.send('Slot already reserved');
            return;
        }

        if (!reserved && !isReserved) {
            response.status(400);
            response.send('Slot not found');
            return;
        }

        if (reserved) {
            data.push(tennantData);
        } else {
            _.remove(data, currentObject => {
                // Check if passed timestamp is of same day, since reservations are for complete day
                return moment
                    .unix(tennantData.time)
                    .isSame(moment.unix(currentObject.time), 'day');
            });
        }

        console.log(data);

        send(response, {
            success: true
        });
    }
});

// Get server time
app.get('/now', function(request, response) {
    // Since UNIX timestamp would be the same for server and client browser,
    // returning the exact time of server. In this case fixed it to dubai instead of local.
    send(response, {
        time: moment(new Date()).unix(),
        // friendlyTime: moment()
        //     .tz(locale)
        //     .format('YYYY-MM-DD HH:mm'),
        timeZone: locale
    });
});

var port = 3000;
console.info('API server listening at http://localhost:' + port);
app.listen(port);