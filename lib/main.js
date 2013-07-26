var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;

var workers = [];
 
function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

var food_inspections = pageMod.PageMod({
  include: ['*.yelp.com'],
  contentScriptWhen: 'ready',
  contentScriptFile: [data.url('food_inspections.js')], 
  onAttach: function(worker) {
    workers.push(worker);
    worker.on('detach', function () {
      detachWorker(this, workers);
    });
    worker.port.on('show', function(data) {
      worker.port.emit('getAddress', data)
    });
    
    worker.port.emit("alert", "This message comes from main.js");
  }
});

exports.main = function() {};
