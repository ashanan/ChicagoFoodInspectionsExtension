var pageMod = require("sdk/page-mod"),
    data = require("sdk/self").data,
    Request = require("sdk/request").Request;;

var workers = [];
 
function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

function getInspectionData(address){
    var inspectionRequest = Request({
        url: "http://www.ashanan.com/food_inspections/cgi/windypie/searchByName.py?search=" + address,
        onComplete: function (response) {
            worker.port.emit('log', "response: " + response.json);
        }
    });
    inspectionRequest.get();
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
        
    worker.port.on('show', function() {
      worker.port.emit('getAddress')
    });
    
    worker.port.on('gotAddress', function(address){
        var data = getInspectionData(address);
    });
    
    worker.port.emit("alert", "This message comes from main.js");
  }
});

exports.main = function() {};
