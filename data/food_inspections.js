self.port.on("alert", function(msg) {
    var rating_element = document.getElementById("bizRating");
    if(rating_element){
        alert(msg);
        alert("el: " + rating_element);
                
        // add the newly created element and its content into the DOM
        console.log(rating_element);
        rating_element.insertAdjacentHTML('beforeEnd', "<div>" + msg + "</div>");
    }
    
    self.port.emit("show", "from f_i.js");
});

self.port.on("getAddress", function(){
    var address_element = document.getElementsByTagName("address")[0];
    
});