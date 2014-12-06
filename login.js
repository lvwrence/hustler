var fs = require('fs');
var prompt = require('prompt');
var request = require("request");
var tough = require('tough-cookie');
var FileCookieStore = require("tough-cookie-filestore");
var CookieJar = require('tough-cookie').CookieJar;

// using eval = good code
eval(fs.readFileSync('vendor/jsbn.js').toString());
eval(fs.readFileSync('vendor/rsa.js').toString());

prompt.start();
var credzz = { username: "reformed45", password: "imahugefaggot" };

// jar to store cookies
var j = request.jar(new FileCookieStore("cookies.json"));
var request = request.defaults({jar: j});


function login(credentials, emailauth) {
    var username = credentials["username"];
    var password = credentials["password"];

    // Start off the login process by getting the rsakey and timestamp from steam.
    request.post({
            url: "https://steamcommunity.com/login/getrsakey/", 
            form: {username: username}
        },
        function(error, response, body) {
            var r = JSON.parse(body);
            
            // Do some operations for the next step of the login process.
            var pubKey = RSA.getPublicKey(r["publickey_mod"], r["publickey_exp"]);
            var encryptedPassword = RSA.encrypt(password, pubKey);
            var rsatimestamp = r["timestamp"];
            
            if (emailauth) {
                var loginfriendlyname = Math.random().toString(36).substr(2, 6);
            }

            request.post({
                url: "https://steamcommunity.com/login/dologin/",
                form: {
                  username: username,
                  password: encryptedPassword,
                  rsatimestamp: rsatimestamp,
                  emailauth: emailauth,
                  loginfriendlyname: loginfriendlyname}
            }, function(error, response, body) {
                var r = JSON.parse(body);

                if (r["success"]) {
                    console.log("Logged in successfully! Writing cookie jar to file jar...");
                } else {
                    if (r["emailauth_needed"]) {
                        console.log("Valve sent a token to your email. Please enter it.");
                        prompt.get(["emailauth"], function(err, result) {
                            login(credentials, result.emailauth);
                        });
                    } else if (r["captcha_needed"]) {
                        console.log("A captcha is needed");
                        // Send a request to get the captcha
                        request.get("https://store.steampowered.com/public/captcha.php" + r["captcha_gid"], function(err, res, b) {
                            console.log(body);
                        }) 
                    } else {
                      console.log("An unexcepted error occured. Body of response:");
                      console.log(body);
                    }
                }
            }
        );
    });
}

login(credzz)
// todo: write an ensureLoggedIn (possible use inventory success/failure boolean)
