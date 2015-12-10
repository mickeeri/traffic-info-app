"use strict";

function init(){

    $.ajaxSetup({
        async: false
    });

    TrafficReporter = new TrafficReporter();
}

var TrafficReporter = function(){

    this.map = this.createMap();
    this.response = this.getAPIResponse();
    this.renderMarkers();
    this.renderList();
};


TrafficReporter.prototype.createMap = function() {

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

TrafficReporter.prototype.renderMarkers = function() {

    var messages = this.response[1];
    var that = this;

    messages.forEach(function (message) {
        // http://stackoverflow.com/questions/206384/format-a-microsoft-json-date
        var date = new Date(parseInt(message.createddate.substr(6)));
        //date = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate();
        date = moment(date).format("HH:mm YYYY-MM-DD");

        console.log(date);

        L.marker([message.latitude, message.longitude]).addTo(that.map)
            .bindPopup("<strong>" + message.title + "</strong> (" + date + ")<br>" +
                message.subcategory + "<br>" + message.description);
    });
};

window.onload = init();