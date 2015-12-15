"use strict";
function init(){
    TrafficReporter = new TrafficReporter();
}

var TrafficReporter = function(){

    this.response;
    this.markers;
    this.map;
    this.category;
    this.markers = new L.layerGroup;

    var that = this;

    this.renderMap();

     // If user selects category: set category, clear layers and list and get messages again.
    $(".btn").click(function(){
        that.setCategory(this);
        $("#messages").empty();
        $("#copyright").empty();
        that.markers.clearLayers();
        that.getResponse();
    });

    this.getResponse();

    var intervalDelay = 100000;

    if (localStorage.getItem("response") !== null) {

        var timestamp = JSON.parse(localStorage.getItem("response")).timestamp;
        console.log(timestamp);
        var now = Date.now();
        console.log(now);

        var elapsed = now - timestamp;

        console.log(elapsed);

        if (elapsed >= intervalDelay) {
            console.log("updating with timestamp");
            reload();
        }
    }


    // Makes new request and redraws messages every 10 minutes.
    setInterval(function () {
        reload();
    }, intervalDelay);

    function reload() {
        console.log("updating");
        localStorage.clear();
        $("#messages").empty();
        $("#copyright").empty();
        that.markers.clearLayers();
        that.getResponse();
    }
};

TrafficReporter.prototype.renderMap = function() {

    this.map = L.map( 'map', {
        center: [62.0, 14.8],
        minZoom: 2,
        zoom: 5
    });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

};

TrafficReporter.prototype.setCategory = function(button) {

    var that = this;

    // Makes button change color if active.
    if ($(button).hasClass("active")) {
        // If user clicks category that is already active, render all categories.
        that.category = undefined;
        $(button).removeClass("active");
    } else {
        // Get id of clicked a-tag.
        var id = $(button).attr("id");

        switch (id) {
            case "cat-road":
                that.category = 0;
                break;
            case "cat-public":
                that.category = 1;
                break;
            case "cat-planed":
                that.category = 2;
                break;
            case "cat-other":
                that.category = 3;
                break;
            default:
                that.category = undefined;
                break;

        }

        $(".btn").removeClass("active");
        $(button).addClass("active");
    }
};


TrafficReporter.prototype.getResponse = function() {

    var srAPI = "http://api.sr.se/api/v2/traffic/messages?format=json&pagination=false";
    var that = this;
    var copyright;
    var storageKey = "response";

    var storedResponse = localStorage.getItem(storageKey);

    if (true) {
        $.ajaxSetup({ cache: true });
        $.getJSON(srAPI, function(data){

            // Create timestamp to see when object was saved to locale storage.
            data.timestamp = new Date().getTime().toString();

            // Save response in local storage.
            localStorage.setItem(storageKey, JSON.stringify(data));
            renderMessages(data);

        }).fail(function(){
            $("<div class='api-error'>Trafikmeddelanden kunde inte hämtas</div>").insertBefore("#map-container");
            return false;
        });
    } else {
        renderMessages(JSON.parse(storedResponse));
    }

    function renderMessages(response) {

        var messages = response.messages;
        var copyright = response.copyright;

        $("<small>"+copyright+"</small>").appendTo("#copyright");


        messages = sortMessages(messages);

        // If category-button is clicked the messages is to be filtrated.
        if (that.category !== undefined) {
            messages = filtrateMessages(messages);
        }

        messages.forEach(function(message) {

            var category = getCategoryAsString(message);
            var priority = getPriorityAsString(message);

            renderListItem(message, category, priority);
            createMarker(message, category, priority);

        });

        that.markers.addTo(that.map);

        $(".message").click(function(){
            messageMarkerPopup($(this).attr("id"));
        });

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
    }

    function sortMessages(messages) {

        messages.forEach(function(message){
            // Changing format of date with moment.js.
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

        return messages;
    }

    function filtrateMessages(messages){
        var filtratedMessages = [];

        messages.forEach(function(message) {

            if (message.category === that.category) {
                filtratedMessages.push(message);
            }
        });

        return filtratedMessages;
    }

    function renderListItem(message, category, priority) {

        var listItem = "<p><strong>"+message.subcategory+" - "+message.title+"</strong></p>" +
            "<p class='chip'>"+category+"</p>" +
            "<p class='date'>"+message.createddate+"</p>" +
            "<p>"+message.description+"</p>";

        // Render list
        $("<li class='message-li'><a href='#' class='card-panel message hoverable' id='"+message.id+"'>"+listItem+"</a>" +
            "</li>").appendTo("#messages");
    }

    function getPriorityAsString(priority) {

        var priorityString;

        switch (priority) {
            case 1:
                priorityString = "Myckel allvarlig händelse";
                break;
            case 2:
                priorityString = "Stor händelse";
                break;
            case 3:
                priorityString = "Störning";
                break;
            case 4:
                priorityString = "Information";
                break;
            case 5:
                priorityString = "Mindre störning";
                break;
        }

        return priorityString;
    }

    function getCategoryAsString(message) {

        var categoryString;

        // Assigning category based on number.
        switch (message.category){
            case 0:
                categoryString = "Vägtrafik";
                break;
            case 1:
                categoryString = "Kollektivtrafik";
                break;
            case 2:
                categoryString = "Planerad störning";
                break;
            case 3:
                categoryString = "Övrigt";
                break;
        }

        return categoryString;
    }

    function createMarker(message, category, priority){

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

        var marker = L.marker([message.latitude, message.longitude], { title: message.id, icon: customIcon }).addTo(that.markers).bindPopup("<strong>" + message.title +
            "</strong><br>" + category + " (" + message.subcategory + ")<p class='date'>" + message.createddate + "</p>" + message.description);
    }
};























window.onload = init();