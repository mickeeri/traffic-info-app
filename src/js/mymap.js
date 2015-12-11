"use strict";

function init(){

    $.ajaxSetup({
        async: false
    });

    TrafficReporter = new TrafficReporter();
}

var TrafficReporter = function(){

    this.map = this.renderMap();
    this.response = this.getAPIResponse();
    this.renderTrafficMessages();
    //this.renderList();
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

TrafficReporter.prototype.renderTrafficMessages = function() {

    var messages = this.response[1];
    var copyright = this.response[0];
    var that = this;

    // Chaning format of date with moment.js.
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

    // Rendering messages in map-markers and list.
    messages.forEach(function (message) {
        // Render markers with leaflet.
        L.marker([message.latitude, message.longitude]).addTo(that.map)
            .bindPopup("<strong>" + message.title + "</strong> (" + message.createddate + ")<br>" +
                message.subcategory + "<br>" + message.description);

        // Render list
        $("<li class='card-panel'><strong>"+message.createddate+" "+message.title+"</strong><br>"+message.description+"</li>").appendTo("#messages");

    });

    $("<small>"+copyright+"</small>").appendTo("#copyright");
};

window.onload = init();