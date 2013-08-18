function Inspection(rawData, columns){
    this.inspectionDate = rawData[columns['inspection_date']];
    this.name = rawData[columns['aka_name']];
    this.risk = rawData[columns['risk']].substr(5);
    this.violations = rawData[columns['violations']];
    this.address = rawData[columns['address']];
}
    
Inspection.prototype.formattedDate = function(){
    var date = new Date(this.inspectionDate),
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

var FoodInspectionsExtension = {
    columns : {},
    ratingsCount : 0,
    inspections : [],
    initialize : function(data){
        for(var i = 0;i < data.length;i++){
            this.inspections.push(new Inspection(data[i], this.columns));
        }
    }
};

self.port.on("log", function(msg){
    console.log(msg);
});

self.port.on("columnsReceived", function(columns) {
    FoodInspectionsExtension.columns = columns;
    console.log("cols: " + JSON.stringify(columns));
    
    var rating_element = $('#bizRating');
    console.log('bizrating: ' + $('#bizRating'));
    if(rating_element && FoodInspectionsExtension.ratingsCount == 0){   
        FoodInspectionsExtension.ratingsCount++;
        rating_element.after('<div id="food_inspections_ext"><span id="food_inspections_ext--no_results_message">No food inspection results were found.</span>'
                            + '<a class="food_inspections_ext--toggle_results" href="#">Show inspection results</a>'
                            + '<table id="food_inspections_ext--results"><tr class="food_inspections_ext--header">'
                            + '<th>Inspection Date</th><th>Name</th><th>Risk</th><th>Violations</th><th>Address</th></tr></table></div>');
                            
        $('.food_inspections_ext--toggle_results').click(function(){
            $("#food_inspections_ext--results").toggle();
            return false;
        });
    
        self.port.emit("show");
    }    
});

self.port.on("getAddress", function(){
    var address_element = document.getElementsByTagName("address")[0],
        address_nodes,
        item_properties,
        address_string,
        tries = 0;
        
    while(address_element == undefined && tries < 30){
        address_element = document.getElementsByTagName("address")[0];
        tries++;
    }
    
    address_nodes = address_element.children
    console.log("getting address");
      
    for(i = 0;i < address_nodes.length;i++){
        if(address_nodes[i].itemProp){
            item_properties = address_nodes[i].itemProp;
            if(item_properties){
                for(j = 0;j < item_properties.length;j++){
                    if(item_properties[j] == "streetAddress"){
                        address_string = address_nodes[i].innerHTML;
                    }
                }
            }
        }
    }
    console.log('end getAddress: ' + address_string);
    self.port.emit("gotAddress", address_string);
});

self.port.on("inspectionDataReceived", function(data){
    var results = $("#food_inspections_ext--results"),
        inspection,
        latestInspection,
        latestInspectionList;
        
    console.log('inspectionDataReceived :' + JSON.stringify(data));
    
    FoodInspectionsExtension.initialize(data);
    
    if(FoodInspectionsExtension.inspections.length > 0){
        $(".food_inspections_ext--toggle_results").show();
        latestInspection = FoodInspectionsExtension.inspections[0];
        latestInspectionList = '<ul><li>Most recent inspection: ' + latestInspection.formattedDate() + '</li>'
                               + '<li>Risk: ' + latestInspection.risk + '</li></ul>';
        $('#food_inspections_ext').prepend(latestInspectionList);
    
        for(var i = 0;i < FoodInspectionsExtension.inspections.length;i++){
            inspection = FoodInspectionsExtension.inspections[i];
            results.append("<tr> <td>" + inspection.formattedDate() + "</td> <td>" + inspection.name + "</td> <td>" 
                            + inspection.risk + "</td>  <td>" + inspection.violations + "</td> <td>" + inspection.address
                            + "</td> </tr>");
        }
    }
    else{
        $('#food_inspections_ext--no_results_message').show();
    }
});