window.onload = function() {


    var map = L.map( 'map', {
        center: [62.0, 14.8],
        minZoom: 2,
        zoom: 5
    });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //L.marker([56.04457, 12.69563]).addTo(map)
    //    .bindPopup('Här bor jag')
    //    .openPopup();
    //
    var popup = L.popup();

    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    }

    map.on('click', onMapClick);


    var srAPI = "http://api.sr.se/api/v2/traffic/messages?format=json&indent=true";

    $.getJSON(srAPI, function(data){
        var items = [];
        $.each(data, function (key, val) {

            items.push(val);
        });

        var messages = items[1];

        console.log(messages[1]);


        //var popup = L.popup();

        $.each(messages, function (key, message) {

            var lat = message.latitude;
            var long = message.longitude;
            var subcat = message.subcategory;
            var title = message.title;
            var description = message.description;

            L.marker([lat, long]).addTo(map)
                .bindPopup("<strong>" + title + "</strong>" + "<br>" + subcat + "<br>" + description);
        });


        // console.log(items);
    });
};
