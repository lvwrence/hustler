var request = require("request");
var FileCookieStore = require('tough-cookie-filestore');
var Account = require("./schemas").Account;

// worker is a mongodb account.
// PRECONDITION: worker is valid account
// questions: where do we put jar?
function work(worker) {
    while (1) {
      if (not logged in) {
        log in and store cookies with user in database
      } else {
        check inventory and update db
        check balance and update db
        check history of trades and update db (optional)

        get all marketable items and try to sell them
        where sell is:
            get market price for item
            list for one cent below market price
      }
    }
}

// run test on own account
db.once('open', function() {
  //if (reformed45 doesnt exist in db) {
    //create account and save it
  //}
  Account.count({username: 'reformed45'}, function(err, count) {
    if (!count) {
      var account = new Account();
      account.save(function(err, reply) {
        if (err) return console.error(err);

        start_reformed();
      });
    } else {
      start_reformed45();
    }
  });
});

function start_reformed45() {
  Account.findOne({username: 'reformed45'}, function(err, reformed45) {
    work(reformed45);
  });
}
