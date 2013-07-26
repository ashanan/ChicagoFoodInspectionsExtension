self.port.on("log", function(msg){
    console.log(msg);
});

self.port.on("alert", function(msg) {
    var rating_element = document.getElementById("bizRating");
    if(rating_element){                
        rating_element.insertAdjacentHTML('beforeEnd', "<div>" + msg + "</div>");
    
        self.port.emit("show");
    }
    
});

self.port.on("getAddress", function(){
    var address_element = document.getElementsByTagName("address")[0],
        address_nodes = address_element.children,
        item_properties,
        address_string;
      
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