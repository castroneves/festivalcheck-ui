// 
// This work by http://twitter.com/Ben_Lowe of http://www.triballabs.net is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 2.0 UK: England & Wales License.
// http://creativecommons.org/licenses/by-nc-sa/2.0/uk/ 
//
$(function () {
    $('.timetable').resize(function (e) {
        $(this).resizeTimetable();
    });

    $.fn.calcuateScaleFactor = function () {
        var sf = 1200 / $(this).width();
        if ( $(this).width() > 1100) {
            return 1;
        }
        return sf;
    };



    $.fn.initialiseTT = function () {
        var daysArr = new Array(new Array(), new Array(), new Array(), new Array(), new Array(), new Array(), new Array());

        // create array to determine and calcuate position of clashing events
        jQuery('.tt-event', this).each(function (i) {
            $(this).attr('rel', 'tooltip');
            $(this).attr('title', $(this).html().replace('<br/>', '\n'));

            $(this).attr('unselectable', 'on')
               .css({
                   '-moz-user-select': 'none',
                   '-webkit-user-select': 'none',
                   'user-select': 'none',
                   '-ms-user-select': 'none'
               })
               .each(function () {
                   this.onselectstart = function () { return false; };
               });

            var placed = false;
            var dayInt = parseInt($(this).data('day'));

            for (i = 0; i < daysArr[dayInt].length; i++) {
                // if nothing in column then add it in
                if (daysArr[dayInt][i].length == 0) {
                    daysArr[dayInt][i].push(new Array($(this).data('id'), $(this).data('start'), $(this).data('duration'), $(this).getHiddenDimensions(false).height));
                    $(this).data('column', i);
                    placed = true;
                    break;
                }
                else {
                    // check last end time in column and see if it overlaps
                    var lastEv = daysArr[$(this).data('day')][i].last();

                    if (parseFloat(lastEv[1]) + parseFloat(lastEv[2]) <= parseFloat($(this).data('start'))) {
                        daysArr[dayInt][i].push(new Array($(this).data('id'), $(this).data('start'), $(this).data('duration'), $(this).getHiddenDimensions(false).height));
                        $(this).data('column', i);
                        placed = true;
                        break;
                    }
                }
            }
            // if not placed then add a new column
            if (!placed) {
                daysArr[dayInt].push(new Array(new Array($(this).data('id'), $(this).data('start'), $(this).data('duration'), $(this).getHiddenDimensions(false).height)));
                $(this).data('column', daysArr[dayInt].length - 1);
            }
        });

        jQuery("[rel=tooltip]", this).tooltip();
        jQuery('.timetable', this).tooltip();

        // work out the required heights of each column
        // loop through each day
        for (i = 0; i < daysArr.length; i++) {
            //loop through each column
            for (j = 0; j < daysArr[i].length; j++) {
                var maxHeight = 0;
                // loop through each event
                for (k = 0; k < daysArr[i][j].length; k++) {
                    if (daysArr[i][j][k][3] > maxHeight) {
                        maxHeight = daysArr[i][j][k][3];
                    }
                }
                daysArr[i][j].push(maxHeight);
            }
        }

        //loop again through events to set their heights and top offset
        jQuery('.tt-event', this).each(function (i) {
            $(this).height(daysArr[$(this).data('day')][$(this).data('column')].last());

            var top = 0;
            for (i = 0; i < $(this).data('column'); i++) {
                top += daysArr[$(this).data('day')][i].last() + 10;
            }
            if ($(this).data('column') == 0) {
                $(this).data('top', top + 1);
            } else {
                $(this).data('top', top - (4 * $(this).data('column')) + 1);
            }

            // Fix tooltips
            var tooltip = $(this).data('original-title');
            var scrobs = $(this).data('scrobs');
            var source = $(this).data('source');
            if (scrobs > 0) {
                var prefix = source == 'spotify' ? "Appearances" : "Plays";
                tooltip = tooltip + '</br>' + prefix + ': ' + scrobs
            }
            var match = $(this).data('match');
            if (undefined != match && match != 'undefined') {
                tooltip = tooltip + '</br>Matched on: ' + match;
            }
            $(this).tooltip('hide')
                .attr('data-original-title', tooltip)
                .tooltip('fixTitle')
                .tooltip('show');
        });



        jQuery('.tt-day', this).each(function (i) {
            var height = 0;
            for (j = 0; j < daysArr[i].length; j++) {
                height += daysArr[i][j].last() + 6;
            }
            if (height > 0) {
                $(this).height(height - 5);
            }
        });
    }

    $.fn.resizeTimetable = function () {
        if ( $(this).width() > 1100) {
            $('#ttdiv').addClass("paddesktop");
            $('#ttdiv').removeClass("padmobile");
        } else {
            $('#ttdiv').addClass("padmobile");
            $('#ttdiv').removeClass("paddesktop");
        }

        var tt = this;
        // reset day widths to allow for day names changing based on screen width
        jQuery('.tt-day', this).width('auto');
        jQuery('.tt-day', this).css('margin-right', 0);

        var ttDaysExtras = parseInt(jQuery('.tt-days', this).css('border-left-width')) + parseInt(jQuery('.tt-days', this).css('border-right-width')) + parseInt(jQuery('.tt-days', this).css('padding-left')) + parseInt(jQuery('.tt-days', this).css('padding-right'));
        console.log(ttDaysExtras);
        ttDaysExtras=0;
        // have to float left to get width correctly in IE8 and below
        jQuery('.tt-days', this).css('float', 'left');
        var daysWidth = jQuery('.tt-days', this).width() + ttDaysExtras;  // + border
        jQuery('.tt-days', this).css('width', daysWidth + 'px');
        jQuery('.tt-days', this).css('float', '');
        var temp = jQuery('.tt-days', this).getHiddenDimensions();
        jQuery('.tt-times', this).css('padding-left', daysWidth);

        var ttTimesExtras = parseInt(jQuery('.tt-times', this).css('border-top-width')) + parseInt(jQuery('.tt-times', this).css('border-bottom-width')) + parseInt(jQuery('.tt-times', this).css('padding-top')) + parseInt(jQuery('.tt-times', this).css('padding-bottom'));
        var ttTimeExtras = parseInt(jQuery('.tt-time', this).last().css('padding-bottom')) + parseInt(jQuery('.tt-time', this).last().css('padding-top'));
        var tempWidth = jQuery('.tt-time', this).last().width();
        jQuery('.tt-time', this).last().width(0);
        var timesHeight = jQuery('.tt-times', this).height() + ttTimesExtras; // + border
        jQuery('.tt-time', this).last().width(tempWidth);

        jQuery('.tt-days', this).css('top', (timesHeight) + 'px');

        $(this).height((timesHeight + jQuery('.tt-days', this).height()) + 'px');

        jQuery('.tt-events', this).css('left', daysWidth);
        jQuery('.tt-events', this).css('top', timesHeight);
        /* check why different between height and width - times/days */



        var scaleFactor = $(this).calcuateScaleFactor();
//        var scaleFactor = 1;
        //var scaleFactor = 1;
        console.log(scaleFactor);
        console.log("div width =" + $(this).width());

        var ttWidth = $(this).width() * scaleFactor;
        var width = ($(this).width() * scaleFactor) - jQuery('.tt-days', this).width() - ttDaysExtras;
//        var width = 1500 - jQuery('.tt-days', this).width() - ttDaysExtras;
        console.log("without header width =" + width);
        var height = $(this).height();
        var hours = $(this).data('hours');
        console.log("hours =" + hours);
//        var hours = 10;
        var hourWidth = Math.floor(width / hours);
        console.log("hour width =" + hourWidth);
        var timeWidth = hourWidth - parseInt(jQuery('.tt-time', this).first().css('padding-left')) - parseInt(jQuery('.tt-time', this).first().css('padding-right')) - parseInt(jQuery('.tt-time', this).first().css('border-left-width')) - parseInt(jQuery('.tt-time', this).first().css('border-right-width'));
        var widthLeft = width;
        var timeHeight = height - ttTimesExtras - ttTimeExtras;
        var timeMarginBottom = -1 * timeHeight;
        var maxDayWidth = 0;
        var dayHeights = new Array();
        var dayYOffset = new Array();

        // set sizes of the times
        jQuery('.tt-time', this).each(function (i) {
            if (i < hours) {
                var timeStart = $(this).data('time') * hourWidth;
                $(this).css('left', timeStart + daysWidth);
                $(this).width(timeWidth);
                $(this).height(timeHeight);
//                $(this).float('left')
//                $(this).display('table-cell')
                $(this).css('margin-bottom', timeMarginBottom);
                widthLeft -= hourWidth;
            }
            else {
                $(this).width(widthLeft - parseInt($(this).css('padding-left')) - parseInt($(this).css('padding-right')) - parseInt($(this).css('border-left-width')) - parseInt($(this).css('border-right-width')));
            }
        });



        // set day sizes
        jQuery('.tt-day', this).each(function (i) {
            var dayWidth = ttWidth - ttDaysExtras - parseInt($(this).css('padding-left')) - parseInt($(this).css('padding-right'));
            $(this).width(dayWidth);
            $(this).css('margin-right', -1 * width);
            dayHeights[i] = $(this).height() + 11;
            if (i == 0) {
                dayYOffset[i] = 0;
            }
            else {
                dayYOffset[i] = dayYOffset[i - 1] + dayHeights[i - 1];
            }
        });

        jQuery('.tt-event', this).each(function (i) {
                    var eventStart = $(this).data('start') * hourWidth;
                    var eventWidth = Math.max($(this).data('duration') * hourWidth - 9, 1);
                    var eventDay = $(this).data('day');

                    $(this).css('top', dayYOffset[eventDay] + $(this).data('top'));
                    $(this).css('left', eventStart);
                    $(this).width(eventWidth);
                });



        return false;
    };
});



