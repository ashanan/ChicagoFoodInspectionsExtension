var FoodInspectionsExtension = {};
FoodInspectionsExtension.columns = {};
FoodInspectionsExtension.ratingsCount = 0;


function formatDateString(dateString){
    console.log('formatDateString: ' + dateString)
    var date = new Date(dateString);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November",     "December" ];
    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

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
        rating_element.after('<div id="food_inspections_ext"><table id="food_inspections_ext--results"><tr class="food_inspections_ext--header">'
                            + '<th>Inspection Date</th><th>Name</th><th>Risk</th><th>Violations</th><th>Address</th></tr></table></div>');
    
        self.port.emit("show");
    }    
});

self.port.on("getAddress", function(){
    var address_element = document.getElementsByTagName("address")[0],
        address_nodes = address_element.children,
        item_properties,
        address_string;
        
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
        columns = FoodInspectionsExtension.columns;
        
    console.log('inspectionDataReceived :' + JSON.stringify(data));

    for(var i = 0;i < data.length;i++){
        results.append("<tr> <td>" + formatDateString(data[i][columns['inspection_date']]) + "</td> <td>" + data[i][columns['aka_name']] + "</td> <td>" 
                        + data[i][columns['risk']] + "</td>  <td>" + data[i][columns['violations']] + "</td> <td>" + data[i][columns['address']] 
                        + "</td> </tr>");
    }
});