var FoodInspectionsExtension = {
        columns : {}
    },
    pageMod = require("sdk/page-mod"),
    data = require("sdk/self").data,
    Request = require("sdk/request").Request;
    
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
            
            worker.port.emit('log', "getInspectionData :: response: " + data);
            
            worker.port.emit("inspectionDataReceived", data);
        }
    });
    
    inspectionRequest.get();
}

function getColumns(){
    var columns,
        worker = workers[0];
        columnsRequest = Request({
        url : "http://www.ashanan.com/food_inspections/cgi/windypie/getColumns.py",
        onComplete: function (response) {
            FoodInspectionsExtension.columns = response.json;
            
            worker.port.emit('log', 'getColums : ' + JSON.stringify(response.json));
            worker.port.emit("columnsReceived", response.json);
        }
    });
    
    worker.port.emit('log', "getting cols");
    var response = columnsRequest.get();
    worker.port.emit('log', 'getColums : ' + JSON.stringify(response.json));
}

var food_inspections = pageMod.PageMod({
  include: ['*.yelp.com'],
  contentScriptWhen: 'ready',
  contentScriptFile: [data.url('food_inspections.js'), data.url('jquery-2.0.3.min.js')],   
  contentStyleFile: data.url("styles.css"),
  attachTo: "top",
  onAttach: function(worker) {
    workers.push(worker);
    worker.on('detach', function () {
      detachWorker(this, workers);
    });
    worker.port.emit('log', "setting up");
            
    worker.port.on('show', function() {
      worker.port.emit('getAddress')
    });
    
    worker.port.on('gotAddress', function(address){
        var data = getInspectionData(address);
    });
    
    if(FoodInspectionsExtension.columns != {}){
        getColumns();
    }
  }
});

exports.main = function() {};
