var express = require('express');
var router = express.Router();
var Yelp = require('../model/yelp.js');
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Yelp Sheet' });
});
/* Get yelp search result data and send it to frontend*/
router.get('/yelpsearch',function(req,res){
  var zipCode = req.query.location,
      searchFor = req.query.term;
  yelpAjax(zipCode,searchFor);
  function yelpAjax(zipCode, searchFor){
    Yelp(zipCode,searchFor,function(error, data){
      res.json(data)
    })
  }
});
module.exports = router;
