/**
 * Created by tianhengzhou on 11/13/15.
 * This module is for pulling data via yelp API.
 * The reason for this module is to avoid exposing yelp API key and secret.
 * The basic logic is similar to the method using them on frontend.*/
var OAuth = require('oauth');
var options = {
    oauth_consumer_key: 'O4cat_6EjYDixZ1jg7hGBg',
    oauth_token: 'yH5HRMh6cWdCxY7_7FvkWThXibIupYRt',
    oauth_consumer_secret: 'te6rel-DmOu0YNRK3nLqcQZi2NI',
    oauth_token_secret: 'tJQbM1MaSIoNF35bgg1_IoTnNpQ',
    version: '1.0'
};

function Yelp(location,term,callback) {
    this.location = location;
    this.term = term;
    var baseUrl = 'https://api.yelp.com/v2/search/?';
/* The url is use to request business info via Yelp API.*/
    var completeUrl = baseUrl+'location='+location+'&'+'term='+term;
    var oauth = new OAuth.OAuth(
        null,
        null,
        options.oauth_consumer_key,
        options.oauth_consumer_secret,
        options.version,
        null,
        'HMAC-SHA1'
    );
    oauth.get(
        completeUrl,
        options.oauth_token,
        options.oauth_token_secret,
        function(e,data){
            if (e){
                callback(e)
            }
            callback(null,data);
        }
    )
}
module.exports = Yelp;