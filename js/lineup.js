/**
 * Created by Adam on 26/12/2015.
 */
$(document).ready(function () {
    $('#spinner').hide();
    $('#spinner2').hide();
    $('#spinnerspot').hide();
    toggleSource();
    selectCurrentMode();
    toggleModeSelect();


    enactDeepLinking();

    if ((getAuthKey() != "" && getAuthKey() != null)) {
        $('#authindyes').show();
        $('#authindno').hide();
    }
    else {
        $('#authindno').show();
        $('#authindyes').hide();
    }
});

function enactDeepLinking() {
    var user = getParameterByName('user');
    if (user != "") {
        $('#lastfmid').val(user);
    }
    var year = getParameterByName('year');
    if (year != "") {
        $('#yearcheck').trigger("click");
        $('#yearbox').val(year);
    }
    var festival = getParameterByName('festival');
    if (festival != "") {
        fetchResults(festival);
    }
}

function selectCurrentMode() {
    var source = getSource();
    if (source == 'spotify') {
        $('#spotify').prop("checked", true).trigger("click");
    } else {
        $('#lastfm').prop("checked", true).trigger("click");
    }
    if (source != 'spotify') {
        var mode = getMode();
        if (mode == 'rec') {
            $('#recco').prop("checked", true).trigger("click");
        } else if (mode == 'agg') {
            $('#both').prop("checked", true).trigger("click");
        } else {
            $('#plays').prop("checked", true).trigger("click");
        }
    }
}

function toggleModeSelect() {
    var source = getSource();
}

function toggleSource() {
    if ($('#lastfm').is(':checked')) {
        //hide spotify stuff
        $('#spotifyauthdiv').hide();
        $('#lfmmodediv').show();
        $('#listeneddiv').show();
        toggleModeSelect();
        //change CSS Red
        updateButtonsRed();
    }
    else if ($('#spotify').is(':checked')) {
        //hide lastfm stuff
        $('#lfmmodediv').hide();
        $('#authdiv').hide();
        $('#algodiv').hide();
        $('#listeneddiv').hide();

        //show spotify button
        $('#spotifyauthdiv').show();

        if (isTokenValid(getCode())) {
            $('#spotifyauthindyes').show();
            $('#spotifyauthindno').hide();
        } else {
            $('#spotifyauthindyes').hide();
            $('#spotifyauthindno').show();
        }
        //change css green
        updateButtonsGreen();
    }
}

function updateButtonsGreen() {
    $('#festivals').children().removeClass();
    $('#festivals').children().addClass('btn btn-success');
}

function updateButtonsRed() {
    $('#festivals').children().removeClass();
    $('#festivals').children().addClass('btn btn-danger');
}


function fetchResults(festival) {
    $('#spinner').show();
    $('#spinner2').show();
    $('#spinnerspot').show();
//    var host = 'http://glasto.cloudapp.net:80';
    var host = 'http://localhost:80';
    var source = getSelectedSource();
    if (source == 'lastfm') {
        var mode = getSelectedMode();
        var username = $('#lastfmid').val();
        if (username == null || username == '') {
            displayError('Please enter a Last.FM username');
            return;
        }
        if (mode == 'listened') {
            var url = host + '/' + festival + "/" + username;
        }
        else if (mode == 'rec') {
            var url = host + '/rec/' + festival + "/" + username;
        }
    }
    else if (source == 'spotify') {
        var code = getCode();
        if (!isTokenValid(code)) {
            displayError('Invalid Token - Please reconnect with Spotify');
            return;
        }
        var redirect = encodeURIComponent('http://www.wellysplosher.com/lineup.html?source=spotify');
        var url = host + '/spotify/' + festival + '/' + code + "/" + redirect;
    }


    var year = $('#yearsel').val();
    url = url + "?year=" + year;

    $.ajax({
        url: url,
        dataType: 'JSON',
        type: 'GET',
        success: function (json) {
            clearTable();
            var tr;
            for (var i = 0; i < json.length; i++) {
                tr = $('<tr/>');
                tr.append("<td>" + json[i].name + "</td>");
                tr.append("<td>" + json[i].day + "</td>");
                tr.append("<td>" + json[i].stage + "</td>");
                tr.append("<td>" + json[i].status + "</td>");
                setTableCss(tr, json[i].status);
                $('#results').append(tr);
            }
            $('#spinner').hide();
            $('#spinner2').hide();
            $('#spinnerspot').hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('#results').html("ERROR - That festival may not have run that year, or the LastFM account does not exist");
            $('#spinner').hide();
            $('#spinner2').hide();
            $('#spinnerspot').hide();
        }
    });
}

function clearTable() {
    $('#results').html("<thead><tr><th>Artist</th><th>Day</th><th>Stage</th><th>Status</th></tr></thead>");
}

function displayError(message) {
    $('#results').html("   ERROR- " + message);
    $('#message').show();
    $('#spinner').hide();
    $('#spinner2').hide();
    $('#spinnerspot').hide();
}

function setTableCss(tr, status) {
    switch (status) {
        case "Confirmed":
            tr.addClass("success");
            break;
        case "To Be Confirmed":
            tr.addClass("info");
            break;
        case "Strong Rumour":
            tr.addClass("warning");
            break;
        case "Rumour":
            tr.addClass("danger");
            break;
        default:
    }
}

function displayError(message) {
    $('#timetable').hide();
    $('#message').html("   ERROR- " + message);
    $('#message').show();
    $('#spinner').hide();
    $('#spinner2').hide();
    $('#spinnerspot').hide();
}

function isTokenValid(token) {
    if (token == null || token == '') {
        return false;
    }
    return true;
}

function getSelectedAlgo() {
    if ($('#aplays').is(':checked')) {
        return 'listened';
    }
    else if ($('#arecco').is(':checked')) {
        return 'recco';

    }
}


function determineClassSched(act, mode) {
    var rank = act.reccorank;
    var scrobs = act.scrobs;
    if (scrobs != 0) {
        return "btn-success";
    }
    else if (rank != -1) {
        return "btn-primary no-margin";
    }
}

function determineClassClash(act, mode) {
    var rank = act.reccorank;
    var scrobs = act.scrobs;
    if (scrobs != 0) {
        return "btn-warning";
    }
    else if (rank != -1) {
        return "btn-info";
    }
}


function setupTableConfig(days) {
    $('#timetable').data('days', days.length);
    for (var i = 0; i < days.length; i++) {
        $('#ttdays').append("<div class=\"tt-day\" data-day=\"" + i + "\">" + days[i] + "</span></div>");
    }
}

function teardownTt() {
    $('#ttdays').html('');
    $('#ttevents').html('');
}

function clearTable() {
    $('#results').html("<thead><tr><th>Artist</th><th>Day</th><th>Stage</th><th>Status</th></tr></thead>");
}

function setTableCss(tr, status) {
    switch (status) {
        case "Confirmed":
            tr.addClass("success");
            break;
        case "To Be Confirmed":
            tr.addClass("info");
            break;
        case "Strong Rumour":
            tr.addClass("warning");
            break;
        case "Rumour":
            tr.addClass("danger");
            break;
        default:
    }
}


function toggleyear() {
    if ($("#yearcheck").is(':checked')) {
        console.log("showing");
        $("#yearbox").prop('disabled', false);
    }
    else {
        console.log("hiding");
        $("#yearbox").prop('disabled', true);
        $("#yearbox").val("");
    }
}

function getSelectedMode() {
    if ($('#plays').is(':checked')) {
        return 'listened';
    }
    else if ($('#recco').is(':checked')) {
        return 'rec';

    }
    else if ($('#both').is(':checked')) {
        return 'agg';
    }
}

function getSelectedSource() {
    if ($('#spotify').is(':checked')) {
        return 'spotify';
    }
    else if ($('#lastfm').is(':checked')) {
        return 'lastfm';
    }
}

function authWithLastFm() {
    // do something a bit more clever with key returned, cookie perhaps
    var origin = window.location.origin;
    var pathname = window.location.pathname;
    var url = encodeURIComponent(origin + pathname + '?source=lastfm&mode=' + getSelectedMode());
    window.location.replace('http://www.last.fm/api/auth?api_key=0ba3650498bb88d7328c97b461fc3636&cb=' + url);
}

function authWithSpotify() {
    var origin = window.location.origin;
    var pathname = window.location.pathname;
    var url = encodeURIComponent('http://www.wellysplosher.com/lineup.html?source=spotify');
    //var url = 'http://www.wellysplosher.com/schedule.html?source=spotify';
    window.location.replace('https://accounts.spotify.com/authorize/?client_id=4f9ea44544be4b789e54bfd9c23ebdc9&response_type=code&scope=user-read-private%20user-read-email%20user-library-read%20playlist-read-private&redirect_uri=' + url);
}

function getAuthKey() {
    return getParameterByName('token');
}

function getSource() {
    return getParameterByName('source');
}

function getMode() {
    return getParameterByName('mode');
}

function getCode() {
    return getParameterByName('code');
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}