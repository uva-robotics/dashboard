var path = require("path"),
express = require("express"),
fs = require("fs");

var http = require('http');
var https = require('https');
var uuidv4 = require('uuid/v4');


var DIST_DIR = path.join(__dirname, "dist"),
PORT = 3000;

var bodyParser = require('body-parser')

var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static(DIST_DIR));

app.post("/set_widget/", function(req, res) {

  var file = 'test.json';
  var data = JSON.parse(fs.readFileSync(path.join(DIST_DIR, file), 'utf8'));

  var key = req.body.name;
  data[key].x = req.body.x;
  data[key].y = req.body.y;

  data[key].width = req.body.width;
  data[key].height = req.body.height;

  fs.writeFile(path.join(DIST_DIR, file), JSON.stringify(data), function(err) {
    if (err) {
      throw err;
    }
    console.log('complete', data);
  });

  res.send('0');
});

app.post("/create_widget", function(req, res) {
  var file = 'test.json';
  var data = JSON.parse(fs.readFileSync(path.join(DIST_DIR, file), 'utf8'));

  var new_widget = {};
  var key = uuidv4();
  new_widget.name = req.body.name;
  new_widget.topic = req.body.topic;
  new_widget.type = req.body.topic_type;
  new_widget.msg_type = req.body.msg_type;
  new_widget.x = 250;
  new_widget.y = 250;
  data[key] = new_widget;

  fs.writeFile(path.join(DIST_DIR, file), JSON.stringify(data), function(err) {
    if (err) {
      throw err;
    }
    console.log('complete', data);
  });

  var response = {}
  response.key = key;
  response.name = req.body.name;
  response.topic = req.body.topic;
  response.type = req.body.topic_type;
  response.msg_type = req.body.msg_type;
  response.x = 250;
  response.y = 250;
  res.send(response);
});

app.get("/get_widget", function(req, res) {
  var file = 'test.json';
  var data = JSON.parse(fs.readFileSync(path.join(DIST_DIR, file), 'utf8'));
  res.send(data);
});

app.get("*", function (req, res) {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});


var httpServer = http.createServer(app);

httpServer.listen(3000);
