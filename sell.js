var fs = require('fs');
var request = require("request");
var FileCookieStore = require('tough-cookie-filestore');
var j = request.jar(new FileCookieStore('cookies.json'));

// item is mongodb item
function sell(item) {
  /*
  Request URL:https://steamcommunity.com/market/sellitem/
  form {
        sessionid:ODc2NDQ5MTQ1
        appid:440
        contextid:2
        assetid:852225808
        amount:1
        price:100
  }
  */
  var url = "https://steamcommunity.com/market/sellitem/";

  // get sessionid cookie
  var cookies = j.getCookies(url);
  var sessionid = null;
	console.log(cookies);
  for (var i = 0; i < cookies.length; i++) {
    if (cookies[i].key == "sessionid") {
      sessionid = decodeURIComponent(cookies[i].value);
    }
  }
  var appid = item.appid;
  var contextid = item.contextid;
  var assetid = item.id;
  var amount = 1;
  var price = 100;

  var form = {
    sessionid: sessionid,
    appid: appid,
    contextid: contextid,
    assetid: assetid,
    amount: amount,
    price: price
  };

  var contentlength = JSON.stringify(form).length;

  request({method: 'POST', url: url, jar: j, 
    headers: 
    {
      'Referer': 'http://steamcommunity.com/id/lawrencewu/inventory/'},
    form: form
    },

    function(error, response, body) {
      // check if statusCode is 502
      if (response.statusCode == 502) {
        // account locked
      }
        console.log(body);
  });
}

// database stuff
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hustler');
var db = mongoose.connection;
var Item = require('./schemas').Item;

db.once('open', function() {
  Item.find({marketable: true}, function(err, items) {
    sell(items[0]);
  });
});
