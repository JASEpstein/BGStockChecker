var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mustacheExpress = require('mustache-express');
const cron = require('node-cron');
const axios = require('axios');
// var HTMLParser = require('node-html-parser');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const getDOM = async () => {
    try {
            return await axios.get('https://www.gamenerdz.com/deal-of-the-day')
        } catch (error) {
            console.error(error)
        }
}
const readDOM = async () => {
    const DOM = await getDOM()

    const parsedDOM = HTMLParser.parse(DOM
        // , {
        // blockTextElements: {
        //     script: true,	// keep text content when parsing
        //     noscript: true,	// keep text content when parsing
        //     style: true,		// keep text content when parsing
        //     pre: true			// keep text content when parsing
        // }
        // }
        );
    if (parsedDOM) {
        // console.log(DOM);
        console.log(parsedDOM);
    }
}   
readDOM();


// CRON JOB CODE
// Schedule tasks to be run on the server.
// cron.schedule('* * * * *', function() {
//     console.log('DING DONG its six oclock PM!');

// });

module.exports = app;
