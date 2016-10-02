/**
 * Created by Adam on 26/12/2015.
 */

 var bar;

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
        $('#yearsel').val(year);
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
    var mode =  getMode();
    if (mode == 'rec') {
        $('#recco').prop("checked", true).trigger("click");
    } else if (mode == 'agg') {
        $('#both').prop("checked", true).trigger("click");
        toggleAlgo();
    } else {
        $('#plays').prop("checked", true).trigger("click");
    }
}

function toggleMode() {
    var mode = getSelectedMode();
    if (mode == 'rec') {
        $('#recco').prop("checked", true).trigger("click");
    } else if (mode == 'agg') {
        $('#both').prop("checked", true).trigger("click");
        toggleAlgo();
    } else {
        $('#plays').prop("checked", true).trigger("click");
    }
}

function toggleAlgo() {
    var algo = getSelectedAlgo();
    if (algo == 'recco') {
        $('#arecco').prop("checked", true).trigger("click");
    } else if (algo == 'listened') {
        $('#aplays').prop("checked", true).trigger("click");
    }
}

function toggleModeSelect() {
    var source = getSelectedSource();
    if ($('#plays').is(':checked')) {
        $('#algodiv').hide();
    }
    else if ($('#recco').is(':checked')) {
        $('#algodiv').hide();
    }
    else if ($('#both').is(':checked')) {
        $('#algodiv').show();
        toggleAlgo();
    }
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
    $('#algoselect').children().removeClass();
    $('#algoselect').children().addClass('btn btn-success');
    $('#modeselect').children().removeClass();
    $('#modeselect').children().addClass('btn btn-success');
    $('#festivals').children().removeClass();
    $('#festivals').children().addClass('btn btn-success');
    toggleMode();
}

function updateButtonsRed() {
    $('#algoselect').children().removeClass();
    $('#algoselect').children().addClass('btn btn-danger');
    $('#modeselect').children().removeClass();
    $('#modeselect').children().addClass('btn btn-danger');
    $('#festivals').children().removeClass();
    $('#festivals').children().addClass('btn btn-danger');
    toggleMode();
}

function createProgressBar(duration) {
    $('#progressbar').show();
    bar = new ProgressBar.Line('#progressbar', {
      strokeWidth: 4,
      easing: 'easeInOut',
      duration: duration,
      color: '#0000ff',
      trailColor: '#FFEA82',
      trailWidth: 1,
      svgStyle: {width: '100%', height: '100%'}
    });

    bar.animate(1.0);
}

function closeProgressBar() {
    bar.set(1.0);
    bar.destroy();
    $('#progressbar').hide();
}

function fetchResults(festival) {
    $('#clashfinder').hide();
    $('#timetable').hide();
    $('#message').hide();
    $('#spinner').show();
    $('#spinner2').show();
    $('#spinnerspot').show();
    var host = 'https://api.wellysplosher.com';
//    var host = 'http://localhost:80';
    var year = $('#yearsel').val();
    var source = getSelectedSource();
    if (source == 'lastfm') {
        var mode = getSelectedMode();
        var username = $('#lastfmid').val();
        if (username == null || username == '') {
            displayError('Please enter a Last.FM username');
            return;
        }
        if (mode == 'listened') {
            var url = host + '/s/' + festival + '/' + year + "/" + username;
            createProgressBar(10000);
        }
        else if (mode == 'rec') {
            var url = host + '/s/rec/' + festival + '/' + year + "/" + username;
            createProgressBar(12000);
        }
        else if (mode == 'agg') {
            var algo = getSelectedAlgo();
            var url = host + '/s/h/' + algo + '/' + festival + '/' + year + "/" + username;
            createProgressBar(20000);
        }
    }
    else if (source == 'spotify') {
        var code = getCode();
        if (!isTokenValid(code)) {
            displayError('Invalid Token - Please reconnect with Spotify');
            return;
        }
        var redirect = encodeURIComponent('http://www.wellysplosher.com/schedule.html?source=spotify');
        var mode = getSelectedMode();
        if (mode == 'listened') {
            var url = host + '/s/spotify/' + festival + '/' + year + "/" + code + "/" + redirect;
            createProgressBar(20000);
        }
        else if (mode == 'rec') {
            var url = host + '/s/spotify/rec/' + festival + '/' + year + "/" + code + "/" + redirect;
            createProgressBar(25000);
        }
        else if (mode == 'agg') {
            var algo = getSelectedAlgo();
            var url = host + '/s/h/spotify/' + algo + '/' + festival + '/' + year + "/" + code + "/" + redirect;
            createProgressBar(30000);
        }
    }

    $.ajax({
        url: url,
        dataType: 'JSON',
        type: 'GET',
        success: function (json) {
            $('#spinner').hide();
            $('#spinner2').hide();
            $('#spinnerspot').hide();
            closeProgressBar();
            teardownTt();
            var days = Object.keys(json.sched);
            setupTableConfig(days);
            for (var i = 0; i < days.length; i++) {
                console.log(json.sched[days[i]]);
                var acts = json.sched[days[i]];
                if (typeof acts !== "undefined") {
                    $.each(acts, function (j, act) {
                        var clazz = determineClassSched(act, mode);
                        $('#ttevents').append("<li class=\"tt-event " + clazz + "\" data-scrobs=\"" + act.scrobs + "\" data-source=\"" + source + "\" data-match=\"" + act.matchString + "\" data-id=\"" + act.name + "\" data-day=\"" + i + "\" data-start=\"" + act.ttStart + "\" data-duration=\"" + act.ttDuration + "\" rel=\"tooltip\" unselectable=\"on\">" + act.name + "<br>" + act.stage + "<br>" + act.startTime + " - " + act.endTime + "</li>");
                    });
                }

                var clashes = json.clash[days[i]];
                if (typeof clashes !== "undefined") {
                    $.each(clashes, function (j, act) {
                        var clazz = determineClassClash(act, mode);
                        $('#ttevents').append("<li class=\"tt-event " + clazz + "\" data-scrobs=\"" + act.scrobs + "\" data-source=\"" + source + "\" data-match=\"" + act.matchString + "\" data-id=\"" + act.name + "\" data-day=\"" + i + "\" data-start=\"" + act.ttStart + "\" data-duration=\"" + act.ttDuration + "\" rel=\"tooltip\" unselectable=\"on\">" + act.name + "<br>" + act.stage + "<br>" + act.startTime + " - " + act.endTime + "</li>");
                    });
                }

            }
            $('.timetable').each(function (e) {
                $(this).initialiseTT();
                $(this).resizeTimetable();
            });
            $('#clashfinderbut').unbind('click');
            $('#clashfinderbut').click(function() {
                window.open(json.clashfinderUrl);
            });
            $('#timetable').show();
            $('#clashfinder').show();

        },
        error: function (xhr, ajaxOptions, thrownError) {
            closeProgressBar();
            $('#results').html("ERROR - That festival may not have run that year, or the LastFM account does not exist");
            $('#spinner').hide();
            $('#spinner2').hide();
            $('#spinnerspot').hide();
            $('#clashfinder').hide();
            displayError('500 Returned From Server');
        }
    });
}

function displayError(message) {
    $('#timetable').hide();
    $('#message').html("   ERROR- " + message);
    $('#message').show();
    $('#spinner').hide();
    $('#spinner2').hide();
    $('#spinnerspot').hide();
    $('#clashfinder').hide();
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
    var url = encodeURIComponent('http://www.wellysplosher.com/schedule.html?source=spotify');
    //var url = 'http://www.wellysplosher.com/schedule.html?source=spotify';
    window.location.replace('https://accounts.spotify.com/authorize/?client_id=4f9ea44544be4b789e54bfd9c23ebdc9&response_type=code&scope=user-read-private%20user-read-email%20user-library-read%20playlist-read-private%20playlist-read-collaborative&redirect_uri=' + url);
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