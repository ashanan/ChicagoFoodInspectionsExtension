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
            var data = response.json,
                worker = workers[0];
                
            worker.port.emit('log', "response: " + data);
            
            worker.port.emit("inspectionDataReceived", data);
        }
    });
    inspectionRequest.get();
}

function getColumns(){
    var columns,
        columnsRequest = Request({
        url : "http://ashanan/com/cgi/windypie/getColumns.py",
        onComplete: function (response) {
            columns = response;
        }
    });
    
    return columns;
}

var food_inspections = pageMod.PageMod({
  include: ['*.yelp.com'],
  contentScriptWhen: 'ready',
  contentScriptFile: [data.url('food_inspections.js'), data.url('jquery-2.0.3.min.js')], 
  onAttach: function(worker) {
    workers.push(worker);
    worker.on('detach', function () {
      detachWorker(this, workers);
    });
    
    columns = getColumns();
            
    worker.port.on('show', function() {
      worker.port.emit('getAddress')
    });
    
    worker.port.on('gotAddress', function(address){
        var data = getInspectionData(address);
    });
    
    worker.port.emit("columnsReceived", columns);
  }
});

exports.main = function() {};
