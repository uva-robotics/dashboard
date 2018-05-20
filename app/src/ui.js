var ROS = require('./ros.js');

var selected_topic = document.getElementById('topics');
selected_topic.addEventListener('change', function() {
  var index = selected_topic.selectedIndex;
  var msg_type = $('#msg_type');
  msg_type.val(ROS.types[index]);
  console.log(ROS.types[index], index);
});
