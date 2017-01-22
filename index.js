var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://yevayu:jYuv2nTQvSeAV38EduMZ8bkAdGKSHjaugRPPZAQ9MUDJPJ1QsOpXXkhGmkaY8Z8nqFW2diQTDO1BFtpr98aAIQ==@yevayu.documents.azure.com:10250/?ssl=true'
var fs = require('fs');
var config = require('./config.json');

var filesToConvert = config.filesToConvert;
var arr = [];

for (fileName in filesToConvert) {
  var name = './' + filesToConvert[fileName];
  var doc = fs.readFileSync(name, 'utf8');

  var item = {};
  var splitted = doc.split('');
  var counter = 0;
  var quoteOpen = false;
  var bracketOpen = false;
  var tempArr = [];
  var str = '';

  for (var i = 0; i < splitted.length; ++i) {
    var c = splitted[i];
    if ( c === ',' && !quoteOpen && !bracketOpen ) {
      if (counter%3 == 0) {
        str = str.trim();
        item.offense = str;
        str = '';
        counter++;
      } else if (counter%3 == 1) {
        str = str.trim();
        item.penalty = str;
        str = '';
        counter++;
      }
      continue;
    } else if ( c === '\"' && quoteOpen ) {
      quoteOpen = false;
      continue;
    } else if ( c === '\"' && !quoteOpen ) {
      quoteOpen = true;
      continue;
    } else if ( c === '|' && bracketOpen ) {
      str = str.toLowerCase().trim();
      tempArr.push(str);
      str = '';
      continue;
    } else if ( c === '\"' && !quoteOpen) {
      quoteOpen = true;
      continue;
    } else if ( c === '\"' && quoteOpen) {
      quoteOpen = false;
      continue;
    } else if ( c === '[' ) {
      bracketOpen = true;
      continue;
    } else if ( c === ']' ) {
      str = str.toLowerCase().trim();
      tempArr.push(str);
      str = '';
      item.category = tempArr;
      tempArr = [];
      arr.push(item);
      item = {};
      counter++;
      bracketOpen = false;
      continue;
    }
    str += c;
  }
}

MongoClient.connect(url, function(err, db) {
  console.log("Success!");
  insert(db, function(err, data) {
    db.close();
  });
  db.close();
});

var insert = function(db, callback) {
  var collection = db.collection('Law');
  collection.insertMany(arr, function(err, data) {
    // assert.equal(err, null);
    // assert.equal(3, data.n);
    // assert.equal(3, result.ops.length);
    if (err) {
      console.log("Ah shit");
    }
    console.log(data);
    callback(data);
  });
}
