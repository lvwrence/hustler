
var request = require('request');
var cheerio = require('cheerio');
var url = 'http://steamcommunity.com/market/';

main();

//buyItem(0);
//login();
function main() {

    // if !loggedIn
    //      logIn
    setInterval(getNewListings, 50);

}

function Listing(name, href, id, price)
{
    this.name = name;
    this.href = href;
    this.id = id;
    this.price = price;
}

function login() {
    var loginUrl = "https://steamcommunity.com/login/home/?goto=market%2F";
    request(loginUrl, function(error, response, body) {
        if (!error) {
            //console.log(response.request.uri.href);
        }

    });
}

function getNewListings() {
    request(url, function(error, response, body) {
        if (!error) {
            $ = cheerio.load(body);
            $("div.market_recent_listing_row").each(function(index, element) {
                if (index >= 10 && index < 20) {
                    // get info of newly listed items
                    var name = $(this).find("span.market_listing_item_name").text();
                    var href = $(this).find("a.market_listing_item_name_link").attr("href");
                    var price = $(this).find("span.market_listing_price_with_fee").text().trim();
                    var id = $(this).attr('id');
                    var listing = new Listing(name, href, id, price);
                    analyzeListing(listing);
                }
            });
        }
    });
}

function analyzeListing(listing) {
    request(listing["href"], function(error, response, body) {
        if (!error) {
            // get item trade data 
            var regex = /var line1(.*)$/m;
            var line1 = body.match(regex)[0].slice(10);
            // recent_data contains latest trading info 
            var recent_data = eval(line1).slice(-1)[0];
            //should do some checking that info is fresh, item is traded >3 times or something
            if (shouldBuy(listing["price"], recent_data[1])) {
                console.log("listing #" + listing["id"] + ": " + listing["name"] + " selling for " + listing["price"] + " at " + floorPrice(recent_data[1]));
                //buyItem(listing["id"]);
            }

        }
    });
}

function buyItem(listingId) {
    var url = 'https://steamcommunity.com/market/buylisting/' + listingId
    request.post(url,
            {form: {yo: "hey"}},
            function(error, response, body) {
                console.log(body);
            });
}

function convertToUSD(price) {
    //add conversion later, just do USD transactions for now
}

function shouldBuy(price, marketPrice) {
    //function is something like amt / 1.15
    if (/USD/.test(price)) {
        // get floor of price to nearest cent, we want a upper guarantee
        var floorMarketPrice = floorPrice(marketPrice);
        var sellingPrice = price.match(/\d+\.?\d+/)[0];
        if (sellingPrice < floorMarketPrice / 1.15 && floorMarketPrice > 0.10) {
            return true;
        }
    } else {
        return false;
    }
}

function floorPrice(price) {
    return Math.floor(100 * price) / 100;
}
