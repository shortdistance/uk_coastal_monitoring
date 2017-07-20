/**
 * Created by leizhang on 17/7/10.
 */

/*sensor station information*/
var station_json = {
    station: [{type: 'Regional monitoring', name: 'Bideford Bay'},
        {type: 'Regional monitoring', name: 'Boscombe'},
        {type: 'Regional monitoring', name: 'Bracklesham Bay'},
        {type: 'Regional monitoring', name: 'Chesil'},
        {type: 'Regional monitoring', name: 'Cleveleys'},
        {type: 'Regional monitoring', name: 'Dawlish'},
        {type: 'Regional monitoring', name: 'Deal Pier'},
        {type: 'Regional monitoring', name: 'Folkestone'},
        {type: 'Regional monitoring', name: 'Goodwin Sands'},
        {type: 'Regional monitoring', name: 'Hayling Island'},
        {type: 'Regional monitoring', name: 'Herne Bay'},
        {type: 'Regional monitoring', name: 'Hornsea'},
        {type: 'Regional monitoring', name: 'Looe Bay'},
        {type: 'Regional monitoring', name: 'Lymington'},
        {type: 'Regional monitoring', name: 'Milford'},
        {type: 'Regional monitoring', name: 'Minehead'},
        {type: 'Regional monitoring', name: 'Morecambe Bay'},
        {type: 'Regional monitoring', name: 'New Brighton'},
        {type: 'Regional monitoring', name: 'Newbiggin'},
        {type: 'Regional monitoring', name: 'Penzance'},
        {type: 'Regional monitoring', name: 'Perranporth'},
        {type: 'Regional monitoring', name: 'Pevensey Bay'},
        {type: 'Regional monitoring', name: 'Port Isaac'},
        {type: 'Regional monitoring', name: 'Porthleven'},
        {type: 'Regional monitoring', name: 'Rustington'},
        {type: 'Regional monitoring', name: 'Sandown Bay'},
        {type: 'Regional monitoring', name: 'Sandown Pier'},
        {type: 'Regional monitoring', name: 'Scarborough'},
        {type: 'Regional monitoring', name: 'Seaford'},
        {type: 'Regional monitoring', name: 'Severn Bridge'},
        {type: 'Regional monitoring', name: 'St Mary\'s Sound'},
        {type: 'Regional monitoring', name: 'Start Bay'},
        {type: 'Regional monitoring', name: 'Swanage Pier'},
        {type: 'Regional monitoring', name: 'Teignmouth Pier'},
        {type: 'Regional monitoring', name: 'Tor Bay'},
        {type: 'Regional monitoring', name: 'Wave Hub'},
        {type: 'Regional monitoring', name: 'West Bay'},
        {type: 'Regional monitoring', name: 'West Bay Harbour'},
        {type: 'Regional monitoring', name: 'Weston Bay'},
        {type: 'Regional monitoring', name: 'Weymouth'},
        {type: 'Regional monitoring', name: 'Whitby'},
        {type: 'GPS', name: 'Chichester'},
        {type: 'GPS', name: 'Newhaven'},
        {type: 'GPS', name: 'Hastings'},
        {type: 'GPS', name: 'Hurst'}]
};

var map;
var infoWindow;
var time_interval = 10000;
var my_timer;

var waves_array = new Array();
var tides_array = new Array();

var bWaves = true;
var bTides = true;

var wave_markers = [];
var tide_markers = [];

var history_info_duration = '1-0';

function load_history_into_array() {
    var days = parseInt(history_info_duration.split('-')[0]);
    var hours = parseInt(history_info_duration.split('-')[1]);
    var data = JSON.stringify({
        days: days,
        hours: hours
    });

    console.log(data);
    $.ajax({
        type: 'POST',
        url: "/api/get_history_info",
        data: data,
        dataType: "json",
        success: function (response, status) {
            console.log(response);
            waves_array = response.waves_array;
            tides_array = response.tides_array;
            console.log('waves_array:' + waves_array.length + ',tides_array:' + tides_array.length);
        },
        error: function (response, status, error) {
            console.log('Error: ' + error + ". Status: " + status);
        }
    });
}

function initMap() {
    var pos = {
        lat: 53.480759,
        lng: -2.242631
    }
    map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
    });

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

    infoWindow = new google.maps.InfoWindow();

    load_history_into_array();
    fetch_dataset_and_create_markers(); //Before the timer work, refresh the page once.
    my_timer = setInterval(fetch_dataset_and_upgrade_markers, time_interval); //refresh the page by timer.

}

google.maps.event.addDomListener(window, 'load', initMap);


function CenterControl(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Time label in the center!';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.id = "time_center_label";
    controlText.innerHTML = '<h4>Dataset Time</h4>';

    controlUI.appendChild(controlText);


}


function setTimeLabel(newValue) {
    /* The format of new value is 20170719#03300*/
    var s = newValue;
    var dt = s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8) + ' ' + s.slice(9, 11) + ':' + s.slice(11, 13) + ':' + s.slice(13, 15);
    $("#time_center_label").html('<h4>' + dt.toString() + '</h4>');
}

function checkJsonInArray(json, jsonArray) {
    var bRet = false;
    if (json instanceof Object && jsonArray instanceof Array) {
        for (var i = 0; i < jsonArray.length; i++) {
            if (JSON.stringify(json) == JSON.stringify(jsonArray[i])) {
                bRet = true;
            }
        }
    }
    return bRet;
}

/* When page load, fetch dataset and create markers.*/
function fetch_dataset_and_create_markers() {

    $.ajax({
        url: "/api/get_info",
        type: "GET",
        dataType: "json",
        success: function (data) {
            var waves_json = JSON.parse(JSON.stringify(data.waves_json));
            var tides_json = JSON.parse(JSON.stringify(data.tides_json));

            console.log(waves_array.length.toString() + ',' + tides_array.length.toString());

            clearWavesMarkers();
            clearWaveResult();
            create_wave_markers(waves_json);

            clearTidesMarkers();
            clearTideResult();
            create_tide_markers(tides_json);

            displayHistoryCount();

        },
        error: function (response, status, error) {
            console.log('Error: ' + error + ". Status: " + status);
        },
        async: false

    });
}

function create_wave_markers(waves_json) {
    if (bWaves) {
        setTimeLabel(waves_json.featureMember[0].waves.date);
        for (var j = 0; j < waves_json.featureMember.length; j++) {
            if (waves_json.featureMember[j].waves.value != "None") {
                var point = waves_json.featureMember[j].waves.msGeometry.Point.coordinates;
                var fillColor;

                var scale;

                if (parseFloat(waves_json.featureMember[j].waves.sst) < 5.0) {
                    fillColor = "#28008b";

                } else if (waves_json.featureMember[j].waves.sst >= 5.0 && waves_json.featureMember[j].waves.sst < 10.0) {
                    fillColor = "#4ad6d5";

                } else if (waves_json.featureMember[j].waves.sst >= 10.0 && waves_json.featureMember[j].waves.sst < 15.0) {
                    fillColor = "#ffff00";

                } else if (waves_json.featureMember[j].waves.sst >= 15.0 && waves_json.featureMember[j].waves.sst < 20.0) {
                    fillColor = "#d563da";

                } else {
                    fillColor = "#ff0000";

                }

                if (parseFloat(waves_json.featureMember[j].waves.hs) < 0.5) {
                    scale = 3;

                } else if (parseFloat(waves_json.featureMember[j].waves.hs) >= 0.5 && parseFloat(waves_json.featureMember[j].waves.hs) < 1.0) {
                    scale = 4;

                } else if (parseFloat(waves_json.featureMember[j].waves.hs) >= 1.0 && parseFloat(waves_json.featureMember[j].waves.hs) < 2.0) {
                    scale = 5;

                } else {
                    scale = 6;
                }
                var mark_option = {
                    map: map,
                    position: new google.maps.LatLng(parseFloat(point.split(',')[1]), parseFloat(point.split(','[0]))),
                    icon: {
                        path: 'm-0.499837,-2.820737l1.439716,2.997937l1.439716,-2.997937l-0.719858,0l0,-3.012362l-1.439716,0l0,3.012362l-0.719858,0z',
                        //path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: scale,
                        fillColor: fillColor,
                        fillOpacity: 0.8,
                        strokeWeight: 1,
                        rotation: parseInt(waves_json.featureMember[j].waves.value) //this is how to rotate the pointer
                    },
                    lat: parseFloat(point.split(',')[1]),
                    lng: parseFloat(point.split(','[0])),
                    date: waves_json.featureMember[j].waves.date,
                    hs: waves_json.featureMember[j].waves.hs,
                    sensor: waves_json.featureMember[j].waves.sensor,
                    sst: waves_json.featureMember[j].waves.sst,
                    type: waves_json.featureMember[j].waves.type,
                    value: waves_json.featureMember[j].waves.value
                }
                var marker = new google.maps.Marker(mark_option);
                wave_markers[j] = marker;
                google.maps.event.addListener(wave_markers[j], 'click', showWavesInfoWindow);
                addWaveResult(waves_json.featureMember[j].waves, j);

            } else {
                wave_markers[j] = null;
            }
        }

    }
}

function create_tide_markers(tides_json) {
    if (bTides) {
        for (var j = 0; j < tides_json.featureMember.length; j++) {
            if (tides_json.featureMember[j].tide.value != "None") {

                var sensor_type = checkSensorInStationJson(tides_json.featureMember[j].tide.sensor);
                var path;
                var fillColor;
                var rotation;
                if (sensor_type === 'other') {
                    path = 'm-1,4.000047l3.00003,-5.000047l3.00003,5.000047l-6.000061,0z';
                    fillColor = '#000000';
                    rotation = 180;
                } else {
                    if (sensor_type === 'Regional monitoring') {
                        path = 'm0.5,3.746722l3.437719,0l1.062282,-3.246722l1.062282,3.246722l3.437718,0l-2.781168,2.006561l1.062337,3.246722l-2.781169,-2.006616l-2.781169,2.006616l1.062337,-3.246722l-2.781169,-2.006561z';
                        fillColor = '#00FF00';
                        rotation = 0;
                    } else {
                        path = 'm5.502622,6.128481l0.200109,-0.817147l0.800439,-0.204287l-1.000548,1.021434l-5.002622,0l0,-6.128481l6.00317,0l0,5.107047';
                        fillColor = '#FF0000';
                        rotation = 0;
                    }

                }
                var point = tides_json.featureMember[j].tide.msGeometry.Point.coordinates;
                var mark_option = {
                    map: map,
                    position: new google.maps.LatLng(parseFloat(point.split(',')[1]), parseFloat(point.split(','[0]))),
                    icon: {
                        path: path,
                        scale: 1,
                        fillOpacity: 0.8,
                        strokeWeight: 0,
                        fillColor: fillColor,
                        rotation: rotation,
                    },
                    lat: parseFloat(point.split(',')[1]),
                    lng: parseFloat(point.split(','[0])),
                    date: tides_json.featureMember[j].tide.date,
                    sensor: tides_json.featureMember[j].tide.sensor,
                    type: tides_json.featureMember[j].tide.type,
                    value: tides_json.featureMember[j].tide.value
                }


                var marker = new google.maps.Marker(mark_option);
                tide_markers[j] = marker;
                google.maps.event.addListener(tide_markers[j], 'click', showTideInfoWindow);
                addTideResult(tides_json.featureMember[j].tide, j);
            } else {
                tide_markers[j] = null;
            }
        }
    }
}

function fetch_dataset_and_upgrade_markers() {
    $.ajax({
        url: "/api/get_info",
        type: "GET",
        dataType: "json",
        success: function (data) {
            var waves_json = JSON.parse(JSON.stringify(data.waves_json));
            var tides_json = JSON.parse(JSON.stringify(data.tides_json));

            console.log(waves_array.length.toString() + ',' + tides_array.length.toString());

            clearWaveResult();
            upgrade_wave_markers(waves_json);

            clearTideResult();
            upgrade_tide_markers(tides_json);

            displayHistoryCount();

        },
        error: function (response, status, error) {
            console.log('Error: ' + error + ". Status: " + status);
        },
        async: false

    });
}

function upgrade_wave_markers(w_json) {
    if (bWaves) {
        setTimeLabel(w_json.featureMember[0].waves.date);
        for (var j = 0; j < w_json.featureMember.length; j++) {
            if (w_json.featureMember[j].waves.value != "None") {
                var point = w_json.featureMember[j].waves.msGeometry.Point.coordinates;
                var fillColor;
                var scale;

                if (parseFloat(w_json.featureMember[j].waves.sst) < 5.0) {
                    fillColor = "#28008b";

                } else if (w_json.featureMember[j].waves.sst >= 5.0 && w_json.featureMember[j].waves.sst < 10.0) {
                    fillColor = "#4ad6d5";

                } else if (w_json.featureMember[j].waves.sst >= 10.0 && w_json.featureMember[j].waves.sst < 15.0) {
                    fillColor = "#ffff00";

                } else if (w_json.featureMember[j].waves.sst >= 15.0 && w_json.featureMember[j].waves.sst < 20.0) {
                    fillColor = "#d563da";

                } else {
                    fillColor = "#ff0000";

                }

                if (parseFloat(w_json.featureMember[j].waves.hs) < 0.5) {
                    scale = 3;

                } else if (parseFloat(w_json.featureMember[j].waves.hs) >= 0.5 && parseFloat(w_json.featureMember[j].waves.hs) < 1.0) {
                    scale = 4;

                } else if (parseFloat(w_json.featureMember[j].waves.hs) >= 1.0 && parseFloat(w_json.featureMember[j].waves.hs) < 2.0) {
                    scale = 5;

                } else {
                    scale = 6;
                }

                wave_markers[j].setPosition(new google.maps.LatLng(parseFloat(point.split(',')[1]), parseFloat(point.split(','[0]))));
                wave_markers[j].setIcon({
                    path: 'm-0.499837,-2.820737l1.439716,2.997937l1.439716,-2.997937l-0.719858,0l0,-3.012362l-1.439716,0l0,3.012362l-0.719858,0z',
                    //path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: scale,
                    fillColor: fillColor,
                    fillOpacity: 0.8,
                    strokeWeight: 1,
                    rotation: parseInt(w_json.featureMember[j].waves.value) //this is how to rotate the pointer
                });

                wave_markers[j].lat = parseFloat(point.split(',')[1]);
                wave_markers[j].lng = parseFloat(point.split(','[0]));
                wave_markers[j].date = w_json.featureMember[j].waves.date;
                wave_markers[j].hs = w_json.featureMember[j].waves.hs;
                wave_markers[j].sensor = w_json.featureMember[j].waves.sensor;
                wave_markers[j].sst = w_json.featureMember[j].waves.sst;
                wave_markers[j].value = w_json.featureMember[j].waves.value;

                addWaveResult(w_json.featureMember[j].waves, j);

            } else {
                wave_markers[j] = null;
            }
        }

    }
}

function upgrade_tide_markers(t_json) {
    if (bTides) {
        for (var j = 0; j < t_json.featureMember.length; j++) {
            if (t_json.featureMember[j].tide.value != "None") {

                var sensor_type = checkSensorInStationJson(t_json.featureMember[j].tide.sensor);
                var path;
                var fillColor;
                var rotation;
                if (sensor_type === 'other') {
                    path = 'm-1,4.000047l3.00003,-5.000047l3.00003,5.000047l-6.000061,0z';
                    fillColor = '#000000';
                    rotation = 180;
                } else {
                    if (sensor_type === 'Regional monitoring') {
                        path = 'm0.5,3.746722l3.437719,0l1.062282,-3.246722l1.062282,3.246722l3.437718,0l-2.781168,2.006561l1.062337,3.246722l-2.781169,-2.006616l-2.781169,2.006616l1.062337,-3.246722l-2.781169,-2.006561z';
                        fillColor = '#00FF00';
                        rotation = 0;
                    } else {
                        path = 'm5.502622,6.128481l0.200109,-0.817147l0.800439,-0.204287l-1.000548,1.021434l-5.002622,0l0,-6.128481l6.00317,0l0,5.107047';
                        fillColor = '#FF0000';
                        rotation = 0;
                    }

                }
                var point = t_json.featureMember[j].tide.msGeometry.Point.coordinates;

                tide_markers[j].setPosition(new google.maps.LatLng(parseFloat(point.split(',')[1]), parseFloat(point.split(','[0]))));
                tide_markers[j].setIcon({
                    path: path,
                    scale: 1,
                    fillOpacity: 0.8,
                    strokeWeight: 0,
                    fillColor: fillColor,
                    rotation: rotation,
                });

                tide_markers[j].lat = parseFloat(point.split(',')[1]);
                tide_markers[j].lng = parseFloat(point.split(','[0]));
                tide_markers[j].date = t_json.featureMember[j].tide.date;
                tide_markers[j].sensor = t_json.featureMember[j].tide.sensor;
                tide_markers[j].value = t_json.featureMember[j].tide.value

                addTideResult(t_json.featureMember[j].tide, j);
            } else {
                tide_markers[j] = null;
            }
        }
    }
}

function addWaveResult(result, i) {
    var results = document.getElementById("wave_results");

    var tr = document.createElement("tr");
    tr.style.backgroundColor = (i % 2 === 0 ? '#FOFOFO' : '#FFFFFF');
    tr.onclick = function () {
        google.maps.event.trigger(wave_markers[i], 'click');
    }

    var nameTd = document.createElement('td');
    var name = document.createTextNode(result.sensor);
    nameTd.appendChild(name);

    var hsTd = document.createElement('td');
    var hs = document.createTextNode(result.hs);
    hsTd.appendChild(hs);

    var sstTd = document.createElement('td');
    var sst = document.createTextNode(result.sst);
    sstTd.appendChild(sst);

    var directionTd = document.createElement('td');
    var direction = document.createTextNode(result.value);
    directionTd.appendChild(direction);

    tr.appendChild(nameTd);
    tr.appendChild(hsTd);
    tr.appendChild(sstTd);
    tr.appendChild(directionTd);
    results.appendChild(tr);
}

function clearWaveResult() {
    var results = document.getElementById("wave_results");
    while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
    }
}

function addTideResult(result, i) {
    var results = document.getElementById("tide_results");

    var tr = document.createElement("tr");
    tr.style.backgroundColor = (i % 2 === 0 ? '#FOFOFO' : '#FFFFFF');
    tr.onclick = function () {
        google.maps.event.trigger(tide_markers[i], 'click');
    }

    var nameTd = document.createElement('td');
    var name = document.createTextNode(result.sensor);
    nameTd.appendChild(name);

    var hsTd = document.createElement('td');
    var hs = document.createTextNode(result.value);
    hsTd.appendChild(hs);


    tr.appendChild(nameTd);
    tr.appendChild(hsTd);
    results.appendChild(tr);
}

function clearTideResult() {
    var results = document.getElementById("tide_results");
    while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
    }
}

function checkSensorInStationJson(sensor) {
    var type = 'other';
    for (var i = 0; i < station_json.station.length; i++) {
        if (station_json.station[i].name == sensor || sensor.indexOf(station_json.station[i].name) >= 0) {
            type = station_json.station[i].type;
        }
    }
    return type;
}

function showWavesInfoWindow() {
    var marker = this;

    contentString = '<div class="demo-card-wide mdl-card mdl-shadow--2dp">' +
        '<div class="mdl-card__title mdl-card__title_waves">' +
        '<h2 class="mdl-card__title-text"><sensor></h2>' +
        '</div>' +
        '<div class="mdl-card__supporting-text">' +
        '<p><lat>, <lng></p>' +
        '<p><date></p>' +
        '<p>Height: <hs> m</p>' +
        '<p>Temperature: <sst> °C</p>' +
        '<p>Direction: <value> °</p>' +
        '</div>' +
        '</div>';


    var reggie = /(\d{4})(\d{2})(\d{2})#(\d{2})(\d{2})(\d{2})/;
    var dateArray = reggie.exec(marker.date.toString());
    var dateString;
    if (dateArray != null && dateArray.length > 0) {
        dateString = dateArray[1] + '-' + dateArray[2] + '-' + dateArray[3] + ' ' + dateArray[4] + ':' + dateArray[5] + ':' + dateArray[6];
    } else {
        dateString = null;
    }
    contentString = contentString.replace("<lat>", marker.lat.toString());
    contentString = contentString.replace("<lng>", marker.lng.toString());

    if (dateString == null) {
        contentString = contentString.replace("<h4><date></h4>", "");
    } else {
        contentString = contentString.replace("<date>", dateString);
    }

    contentString = contentString.replace("<hs>", marker.hs.toString());
    contentString = contentString.replace("<sensor>", marker.sensor.toString());
    contentString = contentString.replace("<sst>", marker.sst.toString());
    contentString = contentString.replace("<value>", marker.value.toString());
    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);
}

function showTideInfoWindow() {
    var marker = this;

    contentString = '<div class="demo-card-wide mdl-card mdl-shadow--2dp">' +
        '<div class="mdl-card__title mdl-card__title_tides">' +
        '<h2 class="mdl-card__title-text"><sensor></h2>' +
        '</div>' +
        '<div class="mdl-card__supporting-text">' +
        '<p><lat>, <lng></p>' +
        '<p><date></p>' +
        '<p>Height: <value></p>' +
        '</div>' +
        '</div>';


    var reggie = /(\d{4})(\d{2})(\d{2})#(\d{2})(\d{2})(\d{2})/;
    var dateArray = reggie.exec(marker.date.toString());
    var dateString;
    if (dateArray != null && dateArray.length > 0) {
        dateString = dateArray[1] + '-' + dateArray[2] + '-' + dateArray[3] + ' ' + dateArray[4] + ':' + dateArray[5] + ':' + dateArray[6];
    } else {
        dateString = null;
    }

    contentString = contentString.replace("<lat>", marker.lat.toString());
    contentString = contentString.replace("<lng>", marker.lng.toString());

    if (dateString == null) {
        contentString = contentString.replace("<h4><date></h4>", "");
    } else {
        contentString = contentString.replace("<date>", dateString);
    }

    contentString = contentString.replace("<sensor>", marker.sensor.toString());
    contentString = contentString.replace("<value>", marker.value.toString());
    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);

}


function clearWavesMarkers() {
    for (var i = 0; i < wave_markers.length; i++) {
        if (wave_markers[i] instanceof google.maps.Marker) {
            wave_markers[i].setMap(null);
        }
    }
    wave_markers.length = 0;
}

function clearTidesMarkers() {
    for (var i = 0; i < tide_markers.length; i++) {
        if (tide_markers[i] instanceof google.maps.Marker) {
            tide_markers[i].setMap(null);
        }
    }
    tide_markers.length = 0;
}

var sidebar = $('#sidebar').sidebar();

function refresh_time_change() {
    if ($('#refresh_switch').is(':checked')) {
        time_interval = $("#refresh_time").attr("data-val");
        clearInterval(my_timer);
        my_timer = setInterval(fetch_dataset_and_upgrade_markers, time_interval);
    }
}

$('#refresh_switch').change(function () {
    if ($(this).is(':checked')) {
        refresh_on();
    }
    else {
        refresh_off();
    }
});


$("#datetime_duration").change(function () {

    history_info_duration = $(this).attr("data-val");

});

function refresh_on() {
    show_msg("Refresh on");
    $('#refresh_switch_label').text("Refresh on");
    time_interval = $("#refresh_time").attr("data-val");
    clearInterval(my_timer);
    my_timer = setInterval(fetch_dataset_and_upgrade_markers, time_interval);
}

function refresh_off() {
    show_msg("Refresh off");
    $('#refresh_switch_label').text("Refresh off");
    clearInterval(my_timer);
}

$('#waves_switch').change(function () {
    if ($(this).is(':checked')) {
        $('#waves_switch_label').text("Waves on");
        bWaves = true;

    }
    else {
        $('#waves_switch_label').text("Waves off");
        bWaves = false;
    }
});

$('#tides_switch').change(function () {
    if ($(this).is(':checked')) {
        $('#tides_switch_label').text("Tides on");
        bTides = true;

    }
    else {
        $('#tides_switch_label').text("Tides off");
        bTides = false;
    }
});

function displayHistoryCount() {
    $('div#wave_history_count').html(waves_array.length.toString());
    $('div#tide_history_count').html(tides_array.length.toString());

}


$("#wave_history_clear_btn").click(function () {
    localStorage.removeItem('waves');
    waves_array = [];
    displayHistoryCount();
});


$('#tide_history_clear_btn').click(function () {
    localStorage.removeItem('tides');
    tides_array = [];
    displayHistoryCount();
});


var mp = new Mprogress();


function show_msg(msg) {
    var snacker_container = document.querySelector('#snacker_container');
    var data = {message: msg};
    snacker_container.MaterialSnackbar.showSnackbar(data);

}

$("#replay_btn").click(function () {
    // load history info dataset
    show_msg('load history dataset!')
    load_history_into_array();

    //close refresh
    refresh_off();

    //start replay
    show_msg("Replay start!");
    for (var i = 0; i < waves_array.length; i++) {
        var wave_json = waves_array[i];
        var stop_flag = waves_array.length - 1;
        (function (w_json, ind, max) {
            setTimeout(function () {
                upgrade_wave_markers(w_json);
                if (ind == max) {
                    show_msg("Replay stop!");
                    refresh_on();
                }
                mp.set((ind + 1) / (max + 1));

            }, 500 * ind);
        })(wave_json, i, stop_flag);
    }
});


$("#stop_replay_btn").click(function () {
    refresh_on();
});

/*
 function replay_nodes_list() {
 for (var i = 0; i < waves_array.length; i++) {
 var div = document.createElement('div');
 div.setAttribute("id", "div_" + i.toString());
 document.getElementById("replay_list").appendChild(div);
 var dateText = document.createTextNode(waves_array[i].featureMember[0].waves.date);
 document.getElementById("div_" + i.toString()).appendChild(dateText);
 document.getElementById("div_" + i.toString()).appendChild(renderjson(waves_array[i].featureMember));

 }
 }


 function clear_replay_nodes_list() {
 var results = document.getElementById("replay_list");
 while (results.childNodes[0]) {
 results.removeChild(results.childNodes[0]);
 }
 }
 */

function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

$('#wave_download_btn').click(function () {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(waves_array));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "wave_" + new Date().getTime().toString() + ".json");
    dlAnchorElem.click();
});


$('#tide_download_btn').click(function () {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tides_array));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "tide_" + new Date().getTime().toString() + ".json");
    dlAnchorElem.click();
});


