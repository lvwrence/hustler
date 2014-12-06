var fs = require('fs');
var request = require("request");
var FileCookieStore = require('tough-cookie-filestore');

var j = request.jar(new FileCookieStore('cookies.json'));

var Item = require('./schemas').Item;

// USE BIND!!!! LOL

function update_inventory() {
  // get cookie jar from file

  var url = "http://steamcommunity.com/id/lawrencewu/inventory/";
  
  request({url: url, jar: j}, function(error, response, body) {
    var re = /var g_rgAppContextData.*/;
    eval(body.match(re)[0]);
    var data = g_rgAppContextData;

    var applength = Object.keys(data).length;
    var appcounter = 0;

    for (var appid in data) {
      // gotta find items for those games now
      // http://steamcommunity.com/id/lawrencewu/inventory/json/appid/context
      // e.g.
      // http://steamcommunity.com/id/lawrencewu/inventory/json/753/7/
      var contexts = data[appid]['rgContexts'];

      var contextlength = Object.keys(contexts).length;
      var contextcounter = 0;

      for (var context in contexts) {
          var jsonurl = url + 'json/' + appid + '/' + context;

          request({url: jsonurl, jar: j}, function(contextid, err, resp, bod) {
            var data = JSON.parse(bod);
            var item_dict = data["rgInventory"];
            var desc_dict = data["rgDescriptions"];
            var items = [];

            var itemlength = Object.keys(item_dict).length;
            var itemcounter = 0;


            for (var id in item_dict) {
              var item = new Item();

              var classid = item_dict[id]['classid'];
              var instanceid = item_dict[id]['instanceid'];
              var amount = item_dict[id]['amount'];

              item.id = id;
              item.contextid = contextid;
              item.classid = classid;
              item.instanceid = instanceid;
              item.amount = amount;

              var descKey = classid + '_' + instanceid;

              var name = desc_dict[descKey]['name'];
              var app_id = desc_dict[descKey]['appid'];
              var marketable = desc_dict[descKey]['marketable'];

              item.appid = app_id;
              item.name = name;
              item.marketable = marketable;

              item.save(function(err, reply) {
                  if (err) return console.error(err);
                  //counter++;
                  //if (counter == length) {
                      //mongoose.connection.close();
                  //}
                });
            }
        }.bind(undefined, context));
      }
    }
  });
}


// calls back with an array of Items.
function get_items(url, callback) {
  request({url: url, jar: j}, function(error, response, body) {
    var data = JSON.parse(body);
    var item_dict = data["rgInventory"];
    var desc_dict = data["rgDescriptions"];
    var items = [];

    for (var id in item_dict) {
      var item = new Item();

      var classid = item_dict[id]['classid'];
      var instanceid = item_dict[id]['instanceid'];
      var amount = item_dict[id]['amount'];

      item.id = id;
      item.classid = classid;
      item.instanceid = instanceid;
      item.amount = amount;

      var descKey = classid + '_' + instanceid;


      var name = desc_dict[descKey]['name'];
      var marketable = desc_dict[descKey]['marketable'];

      item.name = name;
      item.marketable = marketable;
      items.push(item);
    }

    callback(items);
  });
}


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hustler');

var db = mongoose.connection;

db.once('open', function() {

    update_inventory();
/*
    get_items("http://steamcommunity.com/id/lawrencewu/inventory/json/730/2/", function(items) {

      var length = items.length;

      // go through list, saving to db, then closing when counter reaches end
      var counter = 0;
      for (var i = 0; i < length; i++) {
        items[i].save(function(err, reply) {
          if (err) return console.error(err);

          counter++;
          if (counter == length) {
              mongoose.connection.close();
          }
        });
      }
    });
    */
});


