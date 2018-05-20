import interact from 'interactjs';
import ROSLIB from 'roslib';

var ROS = require('./ros.js');

var editMode = false;

export function loadWidgets() {
  var jqxhr = $.get("get_widget", function(data) {

    $.each(data, function(key, value) {
      createWidget(key, value.name, value.topic, value.type, value.msg_type, value.x, value.y, value.width, value.height);

    });
  }, "json")
  .done(function() {
  })
  .fail(function() {
  })
  .always(function() {
  });
}


export function createWidget(key, name, topic, type, msg_type, x, y, width, height) {

  var template = '';

  if (type == 0) {

    template = `
    <div id="${key}" topic="${topic}" class="draggable dragging-container" draggable="1" style="width: ${width}; height: ${height}">
    <div class="card text-white bg-dark mb-3" style="max-width: 18rem;">
    <div class="card-header"><kbd>${topic}</kbd> (${msg_type})</div>
    <div class="card-body">
    <form class="publishForm">
    <input type="hidden" name="topic" value="${topic}">
    <input type="hidden" name="msg_type" value="${msg_type}">
    <div class="form-group">
    <label for="pub" class="col-form-label">Publish</label>
    <input name="pub" class="form-control" id="pub"></input>
    </div>
    <button type="submit" class="btn btn-primary">Publish</button>
    </form>
    </div>
    </div>
    </div>
    `;
  }
  // subscriber
  else if (type == 1) {
    template = `
    <div id="${key}" topic="${topic}" class="draggable dragging-container" draggable="1" style="width: ${width}; height: ${height}">
    <div class="card text-white bg-dark mb-3" style="max-width: 18rem;">
    <div class="card-header"><kbd>${topic}</kbd> (${msg_type})</div>
    <div class="card-body">
    <p class="card-text output"></p>
    </div>
    </div>
    </div>
    `;
  }
  else {
    template = `
    <div id="${key}" topic="${topic}" class="draggable dragging-container" draggable="1" style="width: ${width}; height: ${height}">
    <div class="card text-white bg-dark mb-3" style="max-width: 18rem;">
    <div class="card-header"><kbd>${topic}</kbd> (${msg_type})</div>
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

  if (type == 1) {

    var listener = new ROSLIB.Topic({
      ros: ROS.ros,
      name: topic,
      messageType: msg_type
    });

    listener.subscribe(function(message) {
      ROS.addMessage(listener.name, message);
    });
  }
}

function setWidget(name, x, y, width, height) {

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


$("#newWidgetButton").on('click', function() {
  ROS.getTopics();
});

$("#newWidgetForm").submit(function(event) {

  event.preventDefault();
  $('#widgetModal').modal('toggle');

  var data = $(this).serialize();
  console.log(data);

  var jqxhr = $.post("create_widget", data).done(function(response) {
    createWidget(response.key, response.name, response.topic, response.type, response.msg_type, response.x, response.y, response.width, response.height);
    // alert( "second success" );
  })
  .fail(function() {
    // alert( "error" );
  })
  .always(function() {
    // alert( "finished" );
  });

});



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
    onmove: resizeMoveListener,
    onend: onDragEndListener,
  })
});


function onDragEndListener (event) {
  var target = event.target,
  name = target.getAttribute('id'),
  x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
  y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
  width = target.style.width,
  height = target.style.height;

  setWidget(name, x, y, width, height);

}

function resizeMoveListener(event) {
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
