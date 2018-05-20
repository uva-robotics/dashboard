import ROSLIB from 'roslib';

export var topics, types;

export var ros = new ROSLIB.Ros({
  url : 'ws://192.168.1.11:9090'
});

ros.on('connection', function() {
  setRosStatus(true);
});

ros.on('error', function(error) {
  setRosStatus(false);
});

ros.on('close', function() {
  console.log('Connection to websocket server closed.');
});


export function setRosStatus(status) {
  if (status) {
    document.getElementById("ros-status").innerHTML = '<i class="fa fa-server green" aria-hidden="true"></i>';
  }
  else {
    document.getElementById("ros-status").innerHTML = '<i class="fa fa-server red" aria-hidden="true"></i>';
  }
}

export function addMessage(name, data) {
  // name = name.replace(/'/g, "\\'");
  var topics = $("[topic=" + name.substr(1) + "]");

  for (var i = 0; i < topics.length; i++) {
    var output_div = topics[i].find(".output")[0];
    console.log(output_div);
    output_div.html += JSON.stringify(data) + "</br>";
  }


}


export function getTopics() {

  var topicsClient = new ROSLIB.Service({
    ros : ros,
    name : '/rosapi/topics',
    serviceType : 'rosapi/Topics'
  });

  var request = new ROSLIB.ServiceRequest();

  topicsClient.callService(request, function(result) {

    topics = result.topics;
    types = result.types;

    var topic_select =  document.getElementById('topics');
    topic_select.innerHTML = ''; // clean.
    for (var i = 0; i < topics.length; i++) {
      var option = document.createElement("option");
      option.value = topics[i];
      option.text = topics[i];
      topic_select.appendChild(option);
    }
  });
};



$(document).on('submit','.publishForm', function(event) {
  event.preventDefault();

  var data = {};
  $(this).serializeArray().map(function(x){data[x.name] = x.value;});

  var publish_topic = new ROSLIB.Topic({
    ros : ros,
    name : data.topic,
    messageType : data.msg_type
  });

  var pub_data = {}
  pub_data.data = data.pub;
  publish_topic.publish(pub_data);
});



// Create the main viewer.

/*var viewer = new ROS3D.Viewer({
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
*/
