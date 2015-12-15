"use strict";

function init(){

    $.ajaxSetup({
        async: false
    });

    TrafficReporter = new TrafficReporter();
}

var TrafficReporter = function(){



    var category;
    var that = this;
    this.getAPIResponse();
    this.response;
    this.markers = L.layerGroup();
    this.map = this.renderMap();


    $(".btn").click(function(){

        // Makes button change color if active.
        if ($(this).hasClass("active")) {
            category = undefined;
            $(this).removeClass("active");
        } else {
            category = that.getCategory($(this).attr("id"));
            $(".btn").removeClass("active");
            $(this).addClass("active");
        }

        // Clears layer containing markers, then creates new layer.

        // Render content with category.
        that.renderContent(category);
        that.setUpdateInterval(category);
    });

    this.renderContent();
    this.setUpdateInterval();

};

TrafficReporter.prototype.setUpdateInterval = function(category){

    var that = this;

    setInterval(function () {
        localStorage.clear();
        that.getAPIResponse();
        that.renderContent(category);
    }, 500000);

};

TrafficReporter.prototype.renderContent = function(category){

    this.map.removeLayer(this.markers);
    this.markers = L.layerGroup();
    var messages = this.getMessages(category);
    this.renderTrafficMessages(messages);
};


TrafficReporter.prototype.getMessages = function(category) {

    var messages = [];

    if (category !== undefined) {
        // Filtrates messages based on chosen category.
        this.response.messages.forEach(function(message) {
            if (message.category === category) {
                messages.push(message);
            }
        });
    } else {
        // User has not chosen category. Return all messages.
        messages = this.response.messages;
    }

    return messages;
};

// Returns category based on a-tag id.
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

// Rendering map with leaflet and Open street map.
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

// Calling and getting response from API.
TrafficReporter.prototype.getAPIResponse = function() {

    // http://stackoverflow.com/questions/13853016/jquery-getjson-how-to-avoid-requesting-the-json-file-on-every-refresh-caching

    var url = "http://api.sr.se/api/v2/traffic/messages?format=json&pagination=false";

    var response = localStorage.getItem("response");

    var that = this;

    if (!response) {

        $.getJSON(url, function(data) {
            response = data;
            localStorage.setItem("response", JSON.stringify(response));

        }).fail(function(){
            $("<div class='api-error'>Trafikmeddelanden kunde inte hämtas</div>").insertBefore("#map-container");
            return false;
        });

    } else {
        response = JSON.parse(response);
    }

    this.response = response;
};

// Method in charge of creating marker and list item for each traffic message.
TrafficReporter.prototype.renderTrafficMessages = function(messages) {

    var that = this;
    var copyright = this.response;

    // Changing format of date with moment.js.
    messages.forEach(function(message){
        message.createddate = moment(message.createddate).format("YYYY-MM-DD HH:mm");
    });

    // Sorting by date and time.
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

    // Clears message div to avoid duplicates after choosing category.
    $("#messages").empty();

    // Rendering messages in map-markers and list.
    messages.forEach(function (message) {

        var category;
        var priority;

        // Assigning category based on number.
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

        switch (message.priority) {
            case 1:
                priority = "Myckel allvarlig händelse";
                break;
            case 2:
                priority = "Stor händelse";
                break;
            case 3:
                priority = "Störning";
                break;
            case 4:
                priority = "Information";
                break;
            case 5:
                priority = "Mindre störning";
                break;
        }

        var iconURL;

        switch (message.priority){
            case 1:
                iconURL = "icons/marker-icon-darkred.png";
                break;
            case 2:
                iconURL = "icons/marker-icon-red.png";
                break;
            case 3:
                iconURL = "icons/marker-icon-orange.png";
                break;
            case 4:
                iconURL = "icons/marker-icon-default.png";
                break;
            case 5:
                iconURL = "icons/marker-icon-yellow.png";
                break;
            default:
                iconURL = "icons/marker-icon-default.png"
        }


        var CustomIcon = L.Icon.Default.extend({
           options: {
               iconUrl: iconURL
           }
        });

        var customIcon = new CustomIcon();

        // Adding marker to marker layer.
        var marker = L.marker([message.latitude, message.longitude], { title: message.id, icon: customIcon }).addTo(that.markers).bindPopup(
            "<strong>"+message.title+"</strong> (" + message.subcategory + ")" +
            "<p>"+priority+"</p><p class='date'>" + message.createddate + "</p>" + message.description);


        var listItem = "<p><strong>"+message.subcategory+" - "+message.title+"</strong></p>" +
            "<p class='chip'>"+category+"</p>" +
            "<p class='date'>"+message.createddate+"</p>" +
            "<p>"+message.description+"</p>";

        // Render list
        $("<li class='message-li'><a href='#' class='card-panel message hoverable' id='"+message.id+"'>"+listItem+"</a>" +
            "</li>").appendTo("#messages");

    });

    this.markers.addTo(this.map);

    // Iterates through markers to find the one with same title as clicked <a> id.
    // http://jsfiddle.net/abenrob/zkc5m/
    function messageMarkerPopup(id){

        that.map.eachLayer(function(layer){

            if (layer.options !== undefined && layer.options.title == id) {
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