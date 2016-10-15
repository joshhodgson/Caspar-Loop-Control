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

  //Socket funtions below
  //Play loop function
  socket.on('play', function(payload) {
    console.log("Playing " + payload.file);
    ccg.play("1-2", payload.file, {
      "loop": true
    });
  });

  //Stop all loops
  socket.on('stop', function() {
    ccg.clear("1-2");
  });

  //Shows the offair clock
  socket.on('offAir', function() {
  	ccg.clear("1-2");
  	ccg.sendCommand("CG 1-1 ADD 1 offair-clock 1");
  	console.log("Offair Log");
  });

  //Start the RTMP decoder
  socket.on('startDecoder', function(rtmpLink) {
    ccg.clear("1-3");
    ccg.play("1-3", rtmpLink);
    console.log("RTMP Playing");
  });

  //Stop the RTMP decoder
  socket.on('stopDecoder', function() {
    ccg.clear("1-3");
    console.log("RTMP Stopped");
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
