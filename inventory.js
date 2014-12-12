/*
 * inventory.js
 *
 * Functions for grabbing an account's inventory.
 *
 * TODO:
 *  - have updateInventory() take in a user account
 *  - use mongodb user accounts to fetch cookies
 *  - refactor stuff out into own functions
 */

var request = require("request");
var Item = require("./schemas").Item;

function updateInventory(callback) {
  "use strict";
  var jar = getCookieJar();
  var url = getInventoryUrl();

  // set default cookie jar of request
  request = request.defaults({jar:jar});

  // send initial request to main inventory page
  request(url, function(error, response, body) {
    var data = getData(body);
    var endpoints = getEndpoints(data);

    //var endpointNumber = Object.keys(endpoints).length;
    var endpointCount = 0;
    for (var i = 0; i < endpoints.length; i++) {
      queryEndpoint(endpoints[i], function() {
        endpointCount++;
        if (endpointCount === endpoints.length) {
          callback();
        }
      });
    }
  });
}

// TODO: rewrite without using eval
// parses and gets steam
function getData(body) {
  "use strict";
  var re = /var g_rgAppContextData.*/;
  var line = body.match(re)[0];

  var data = JSON.parse(line.substring(25, line.length - 1));

  return data;
}

// gets cookie jar to use for request
function getCookieJar() {
  "use strict";
  var FileCookieStore = require("tough-cookie-filestore");
  var j = request.jar(new FileCookieStore("cookies.json"));
  return j;
}

// TODO: use account to build URL
function getInventoryUrl() {
  "use strict";
  return "http://steamcommunity.com/id/lawrencewu/inventory/";
}

// given data obtained from parsed source code, gather inventory endpoints
function getEndpoints(data) {
  "use strict";

  var arr = [];

  // for every game (e.g. counter-strike, dota)...
  for (var appId in data) {
    if (data.hasOwnProperty(appId)) {
      var contexts = data[appId].rgContexts;

      // look through each context (e.g. coupons, gifts)...
      for (var contextId in contexts) {
        if (contexts.hasOwnProperty(contextId)) {

          // build the json endpoint
          var endpoint = buildInventoryEndpoint(appId, contextId);
          arr.push(endpoint);
        }
      }
    }
  }

  return arr;
}

// builds an inventory json api endpoint with the following format:
// http://steamcommunity.com/id/lawrencewu/inventory/json/<appid>/<context>
function buildInventoryEndpoint(appid, contextid) {
  "use strict";
  var url = getInventoryUrl();

  var jsonurl = url + "json" + "/" + appid + "/" + contextid;
  return jsonurl;
}

function queryEndpoint(url, callback) {
  "use strict";
  request(url, function(error, response, body) {
    var data = JSON.parse(body);

    var items = data.rgInventory;
    var descriptions = data.rgDescriptions;

    var itemNumber = Object.keys(items).length;
    var itemCount = 0;

    if (itemNumber === 0) { callback(); }

    for (var id in items) {
      if (items.hasOwnProperty(id)) {
        var item = buildItem(items, descriptions, id);

        item.save(function(err) {
          if (err) { return console.error(err); }

          itemCount++;
          if (itemCount === itemNumber) {
            callback();
          }
        });
      }
    }
  });
}

function buildItem(items, descriptions, id) {
  "use strict";
  var item = new Item();
  var classId = items[id].classid;
  var instanceId = items[id].instanceid;

  item.id = id;
  item.contextId = 44;
  item.classId = classId;
  item.instanceId = instanceId;
  item.amount = items[id].amount;

  var descriptionKey = buildDescriptionKey(classId, instanceId);

  item.name = descriptions[descriptionKey].name;
  item.appId = descriptions[descriptionKey].appid;
  item.marketable = descriptions[descriptionKey].marketable;

  return item;
}

// the description key
function buildDescriptionKey(classid, instanceid) {
  "use strict";
  return classid + "_" + instanceid;
}


var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/hustler");
var db = mongoose.connection;
db.once("open", function() {
  "use strict";
  updateInventory(function() {
    console.log("done");
    mongoose.connection.close();
  });
});
