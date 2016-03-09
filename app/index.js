var version = "0.0.1";
var config = require("./config.json");
var express = require('express');
var socket = require('socket.io');
var app = express();
var server = app.listen(config.webui.port);
var io = socket.listen(server);

app.set('view engine', 'ejs');

var CasparCG = require('caspar-cg');

var ccg = new CasparCG({
  host: config.caspar.host,
  port: config.caspar.port,
  debug: config.caspar.debug
});

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('play', function(payload) {
    console.log("Playing " + payload.file);
    ccg.play("1-1", payload.file, {
      "loop": true
    });
  });
  socket.on('stop', function() {
    ccg.clear("1-1");
  });
});

function getFiles() {
  ccg.getMediaFiles(function(err, serverInfo) {
    if (config.caspar.debug) {
      console.log(serverInfo);
    }
    files = serverInfo;
  });
}

var files = ["Not yet connected"];
ccg.connect(function() {
  files = ["Connected, please try again"];
  getFiles();
});


app.get('/', function(req, res) {
  res.render('pages/home', {
    "version": version,
    "files": files
  });
  getFiles();
});
