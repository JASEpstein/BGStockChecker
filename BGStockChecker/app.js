var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mustacheExpress = require('mustache-express');
const cron = require('node-cron');
const axios = require('axios');
// var HTMLParser = require('node-html-parser');
const cheerio = require('cheerio');
const fs = require('fs');

const frontEndVars = require('./data/frontEndVariables.json');

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

const url = 'https://www.gamenerdz.com/deal-of-the-day'

const scrapeStatus = false;

// CRON JOB CODE
// Schedule tasks to be run on the server.
// Runs every 5 mins from 11am to 1pm
const scrapeCron = cron.schedule('*/5 11-13 * * *', function() {    
    //Axios Fetch code
    axios.get(url)
    .then((response) => {
        let $ = cheerio.load(response.data);
        
        let gameTitle = $('h4.card-title a').text();
        console.log(gameTitle);

        let cartText = $('.cart_btn').text();   
        console.log(cartText);

        let outOfStockBtn = $('.out_stock_btn').text();
        
        if(outOfStockBtn){
            console.log(outOfStockBtn.length);
        } 

    })
    .then((cartText, outOfStockBtn, gameTitle) => {
        if(outOfStockBtn || cartText !== "Add to Cart"){
            //If product is OOS - stops checking the listing
            scrapeCron.stop();
            //Writes to JSON to update the front end
            //Need to update the write function to log the data: game title and time it was marked OOS
            //OK - Create an object with all relevant DOM data, push that onto the JSON, then run all the logic checking the object.
            fs.writeFile(frontEndVars.stockStatus, "Out of Stock",(err) => {
                if(err) throw err;
                console.log(`${frontEndVars.stockStatus}! -- stockStatus var written to JSON`);
            })
        } else if(cartText === "Add to Cart"){
            //If product is still in stock
            if(frontEndVars.gameName !== gameTitle){
                fs.writeFile(frontEndVars.gameName, gameTitle, (err) => {
                    if(err) throw err;
                    console.log(`${frontEndVars.gameName} -- gameName var written to JSON`);
                });
            }
            console.log(frontEndVars);

        } else if(!outOfStockBtn && !cartText){
            console.log("Product not on page");
        }

    })
});


const restartCron = cron.schedule('* 0 * * *', function(scrapeStatus){
    scrapeStatus = false;
    scrapeCron.start();
})

restartCron();

// function stopScrape (scrapeStatus) {
//     if(scrapeStatus == true){
//         scrapeCron.stop();
//     }
// }



module.exports = app;
