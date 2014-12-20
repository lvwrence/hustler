var fs = require("fs");
var prompt = require("prompt");
var request = require("request");
var cheerio = require("cheerio");


prompt.start();

function register(accountname, password, email) {
  "use strict";
  getCaptchaId(getCaptcha);

  prompt.get(['captchagid', 'captcha'], function(err, result) {
    attemptRegister(accountname, password, email, result.captchagid, result.captcha);
  });
}

/**
 * Retrieves an example captcha.
 */
function getCaptchaId(callback) {
  "use strict";
  request.get("https://store.steampowered.com/join/",
    function(error, response, body) {
      var $ = cheerio.load(body);
      var captchagid = $("#captchagid").val();
      callback(captchagid);
    });
}

/**
 * Gets and inserts image into folder /captchas
 */
function getCaptcha(id) {
  "use strict";
  var url = "https://store.steampowered.com/public/captcha.php?gid=" + id;

  var file = fs.createWriteStream("captchas/" + id + ".png");
  request(url).pipe(file);
}

function attemptRegister(accountname, password, email, captchagid, captcha_text) {
  "use strict";

  request.post({
    url: "https://store.steampowered.com/join/createaccount/",
    form: {
      accountname: accountname,
      password: password,
      email: email,
      challenge_question: "FavoriteTeam",
      secret_answer: "asdlfkkadsf",
      captchagid: captchagid,
      captcha_text: captcha_text,
      i_agree: 1,
      ticket: "",
      count: 9
    }
  }, function(error, response, body) {
    if (body.bSuccess) {
      // save account details into database
      console.log("SUCCESS");
    } else {
      switch (body.details) {
        case "captcha data bad!":
          console.log("retry registering, captcha was bad");
          break;
        case "account details mising!":
          console.log("account details missing");
          break;
        default:
          console.log("some error occurred.");
          console.log(body);
      }
    }
  });

}

register("23fh98hv", "3yg08nc4", "340nghfd@g38h.com");
