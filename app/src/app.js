
import './scss/main.scss';
import 'bootstrap';
import ROSLIB from 'roslib';
import interact from 'interactjs';


var editMode = false;

$("#menu-toggle").click(function(e) {
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
});


var ros = new ROSLIB.Ros({
  url : 'ws://localhost:9090'
});

// Create the main viewer.
var viewer = new ROS3D.Viewer({
  divID : 'urdf',
  width : 800,
  height : 600,
  antialias : true
});
// Add a grid.
viewer.addObject(new ROS3D.Grid());

var tfClient = new ROSLIB.TFClient({
  ros : ros,
  angularThres : 0.01,
  transThres : 0.01,
  rate : 10.0
});

var urdfClient = new ROS3D.UrdfClient({
  ros : ros,
  tfClient : tfClient,
  path : 'http://localhost:5000/',
  rootObject : viewer.scene,
  loader : ROS3D.COLLADA_LOADER_2
});


function addMessage(name, data) {

  var panel = document.getElementById(name);
  var output_div = panel.getElementsByClassName("output")[0];

  output_div.innerHTML += data + "</br>";
}


function setRosStatus(status) {
  if (status) {
    document.getElementById("ros-status").innerHTML = '<i class="fa fa-server green" aria-hidden="true"></i>';
  }
  else {
    document.getElementById("ros-status").innerHTML = '<i class="fa fa-server red" aria-hidden="true"></i>';
  }
}



ros.on('connection', function() {
  setRosStatus(true);
});

ros.on('error', function(error) {
  setRosStatus(false);
});

ros.on('close', function() {
  console.log('Connection to websocket server closed.');
});


function setPing() {
  setInterval(function(){
    console.log("PING");
  }, 1000);
}


function setWindow(name, x, y, width, height) {

  var data = new Object();
  data.name = name;
  data.x = x;
  data.y = y;
  data.width = width;
  data.height = height;

  var jqxhr = $.post("set_widget", data, function(response) {
  })
  .done(function() {
    // alert( "second success" );
  })
  .fail(function() {
    // alert( "error" );
  })
  .always(function() {
    // alert( "finished" );
  });
}

function onDragEndListener (event) {

  console.log("EV", event.target.style.width, event.target.style.height);
  var target = event.target,
  name = target.getAttribute('id'),
  x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
  y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
  width = target.style.width,
  height = target.style.height;

  setWindow(name, x, y, width, height);

}

function dragMoveListener (event) {
  var target = event.target,
  // keep the dragged position in the data-x/data-y attributes
  x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
  y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

  // translate the element
  target.style.webkitTransform =
  target.style.transform =
  'translate(' + x + 'px, ' + y + 'px)';

  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

function publishForm(event) {
  console.log("PUBLISHED")
  event.preventDefault();
}

$("#newWidgetForm").submit(function(event) {

  event.preventDefault();
  $('#widgetModal').modal('toggle');

  var data = $(this).serialize();
  console.log(data);

  var jqxhr = $.post("create_widget", data).done(function(response) {
    console.log(response);
    createWidget(response.key, response.name, response.type, response.msg_type, response.x, response.y, response.width, response.height);
    // alert( "second success" );
  })
  .fail(function() {
    // alert( "error" );
  })
  .always(function() {
    // alert( "finished" );
  });

});

function createWidget(key, name, type, msg_type, x, y, width, height) {

  var template = '';

  if (type == 0) {

    template = `
    <div id="${key}" class="draggable dragging-container" draggable="1" style="width: ${width}; height: ${height}">
    <div class="card text-white bg-dark mb-3" style="max-width: 18rem;">
    <div class="card-header"><kbd>${key}</kbd> (${msg_type})</div>
    <div class="card-body">
    <form class="publishForm" topic="${key}" onsubmit="publishForm()">
    <div class="form-group">
    <label for="publish" class="col-form-label">Publish</label>
    <input name="publish" class="form-control" id="publish"></input>
    </div>
    <button type="submit" class="btn btn-primary">Add</button>
    </form>
    </div>
    </div>
    </div>
    `;
  }
  // subscriber
  else if (type == 1) {
    template = `
    <div id="${key}" class="draggable dragging-container" draggable="1" style="width: ${width}; height: ${height}">
    <div class="card text-white bg-dark mb-3" style="max-width: 18rem;">
    <div class="card-header"><kbd>${key}</kbd> (${msg_type})</div>
    <div class="card-body">
    <p class="card-text output"></p>
    </div>
    </div>
    </div>
    `;
  }
  else {
    template = `
    <div id="${key}" class="draggable dragging-container" draggable="1" style="width: ${width}; height: ${height}">
    <div class="card text-white bg-dark mb-3" style="max-width: 18rem;">
    <div class="card-header"><kbd>${key}</kbd> (${msg_type})</div>
    <div class="card-body">
    <p class="card-text output"></p>
    </div>
    </div>
    </div>
    `;
  }


  var widgets = document.getElementById("widgets");
  widgets.insertAdjacentHTML('beforeend', template);

  var panel = document.getElementById(key);

  panel.style.webkitTransform = panel.style.transform =
  'translate(' + x + 'px,' + y + 'px)';

  panel.setAttribute('data-x', x);
  panel.setAttribute('data-y', y);

  var listener = new ROSLIB.Topic({
    ros: ros,
    name: key,
    messageType: msg_type
  });

  listener.subscribe(function(message) {
    console.log('Received message on ' + listener.name + ': ' + message.data);

    addMessage(listener.name, message.data);
    // listener.unsubscribe();
  });

}

$("#editMode").on('click', function(event) {

  editMode = !editMode;

  if (editMode) {
    $(this).removeClass("btn-success");
    $(this).addClass("btn-danger");
  }
  else {
    $(this).removeClass("btn-danger");
    $(this).addClass("btn-success");
  }

  interact('.draggable').draggable({
    enabled: editMode,
    inertia: true,
    restrict: {
      restriction: "parent",
      endOnly: true,
      // elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    autoScroll: true,
    onmove: dragMoveListener,
    onend: onDragEndListener,
  }).resizable({
    enabled: editMode,
    edges: { left: true, right: true, bottom: true, top: true },
    onend: onDragEndListener,
  })
  .on('resizemove', function (event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0),
    y = (parseFloat(target.getAttribute('data-y')) || 0);

    // update the element's style
    target.style.width  = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.webkitTransform = target.style.transform =
    'translate(' + x + 'px,' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

  });
});

$(document).ready(function() {


  setPing();
  var jqxhr = $.get("get_widget", function(data) {

    $.each(data, function(key, value) {
      createWidget(key, value.name, value.type, value.msg_type, value.x, value.y, value.width, value.height);

    });


  }, "json")
  .done(function() {
  })
  .fail(function() {
  })
  .always(function() {
  });


});
