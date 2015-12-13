"use strict";

function init(){

    $.ajaxSetup({
        async: false
    });

    TrafficReporter = new TrafficReporter();
}

var TrafficReporter = function(){

    this.response = null;
    var category;
    //this.map = null;
    var that = this;
    this.response = this.getAPIResponse();
    this.markers = L.layerGroup();
    this.map = this.renderMap();

    $(".btn").click(function(){

        if ($(this).hasClass("active")) {
            category = undefined;
            $(this).removeClass("active");
        } else {
            category = that.getCategory($(this).attr("id"));
            $(".btn").removeClass("active");
            $(this).addClass("active");
        }

        // Clears layer containing markers.
        that.map.removeLayer(that.markers);
        that.markers = L.layerGroup();
        that.renderContent(category);
    });

    this.renderContent();

};

TrafficReporter.prototype.renderContent = function(category){



    var messages = this.getMessages(category);
    this.renderTrafficMessages(messages);

};


TrafficReporter.prototype.getMessages = function(category) {

    var messages = [];
    //var that = this;

    if (category !== undefined) {

        this.response[1].forEach(function(message) {
            if (message.category === category) {
                messages.push(message);
            }
        });
    } else {
        messages = this.response[1];
    }

    return messages;
};

TrafficReporter.prototype.getCategory = function(id) {

    var category;

    switch (id) {
        case "cat-road":
            category = 0;
            break;
        case "cat-public":
            category = 1;
            break;
        case "cat-planed":
            category = 2;
            break;
        case "cat-other":
            category = 3;
            break;
        default:
            category = null;
            break;

    }

    return category;
};


TrafficReporter.prototype.renderMap = function() {

    var map = L.map( 'map', {
        center: [62.0, 14.8],
        minZoom: 2,
        zoom: 5
    });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //map.fitBounds(this.markers);

    return map;
};

TrafficReporter.prototype.getAPIResponse = function() {

    var url = "http://api.sr.se/api/v2/traffic/messages?format=json&pagination=false";

    var response = [];

    $.getJSON(url, function(data){

        $.each(data, function (key, val) {

            response.push(val);
        });
    });

    return response;
};

TrafficReporter.prototype.renderTrafficMessages = function(messages) {

    var that = this;



    var copyright = this.response[0];


    // Changing format of date with moment.js.
    messages.forEach(function(message){
        message.createddate = moment(message.createddate).format("YYYY-MM-DD HH:mm");
    });

    // Sorting by datetime.
    messages.sort(function (a, b) {
        if (a.createddate < b.createddate) {
            return 1;
        }
        if (a.createddate > b.createddate) {
            return -1;
        }
        // a must be equal to b
        return 0;
    });

    $("#messages").empty();

    // Rendering messages in map-markers and list.
    messages.forEach(function (message) {

        var category;

        switch (message.category){
            case 0:
                category = "Vägtrafik";
                break;
            case 1:
                category = "Kollektivtrafik";
                break;
            case 2:
                category = "Planerad störning";
                break;
            case 3:
                category = "Övrigt";
                break;
        }


        var marker = L.marker([message.latitude, message.longitude], { title: message.id }).addTo(that.markers).bindPopup("<strong>" + message.title +
            "</strong><br>" + category + " (" + message.subcategory + ")<p class='date'>" + message.createddate + "</p>" + message.description);



        //markers.push(marker);
        var listItem = "<p><strong>"+message.subcategory+" - "+message.title+"</strong></p>" +
            "<p class='chip'>"+category+"</p>" +
            "<p class='date'>"+message.createddate+"</p>" +
            "<p>"+message.description+"</p>";


        // Render list
        $("<li class='message-li'><a href='#' class='card-panel message hoverable' id='"+message.id+"'>"+listItem+"</a></li>").appendTo("#messages");




            //""+message.title+"" + ""+message.title+"" +
            //"<br>"+message.description+"" +
            //"</a></li>").appendTo("#messages");
    });

    this.markers.addTo(this.map);

    // Iterates through markers to find the one with same title as clicked <a>-id.
    // http://jsfiddle.net/abenrob/zkc5m/
    function messageMarkerPopup(id){

        that.map.eachLayer(function(layer){

            if (layer.options.title == id) {
                that.map.setView([layer._latlng.lat, layer._latlng.lng], 7);
                layer.openPopup();
            }
        });
    }

    $(".message").click(function(){
        messageMarkerPopup($(this).attr("id"));
    });

    $("#copyright").empty();
    $("<small>"+copyright+"</small>").appendTo("#copyright");





};

window.onload = init();