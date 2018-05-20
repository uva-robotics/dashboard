
import './scss/main.scss';
import 'bootstrap';
import ROSLIB from 'roslib';

var widget = require('./widget.js');
var ui = require('./ui.js');



$("#menu-toggle").click(function(e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});


function setPing() {
  setInterval(function() {
    console.log("PING");
  }, 1000);
}

$(document).ready(function() {

  setPing();
  widget.loadWidgets();
});
