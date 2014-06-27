window.scrollTo(0,1);

var timers = {
};

var WS = {
    endpoint: 'http://turkotron.lichess.org',
    create: function(callback) {
        return $.ajax({
            url: this.endpoint + '/clock/create',
            type: 'POST',
            success: callback
        });
    },
    switch: function(callback) {
        $.ajax({
            url: this.endpoint + '/clock/switch',
            type: 'POST',
            success: callback
        });
    },
    finish: function(callback) {
        // return $.ajax({
        //     url: this.endpoint + '/clock/finish',
        //     type: 'POST'
        // });
    }
};

function getTimer($clock) {
    var timerId = $clock.data('timer') || Date.now();
    var timer = timers[timerId];
    if(!timer) {
        timer =  Timer(
            function onTick() {
                var x = timer.msToTime(timer.lap());
                var timeString = x.substring(0, x.length - 4);
                var $value = $clock.find('.value');
                $value.text(timeString);
            },
            function onComplete() {
                WS.finish();
            }
        );
        $clock.data('timer', timerId);
        timers[timerId] = timer;
    }
    return timer;
}

function Timer(onTick, onComplete) {
    return new Tock({
        countdown: true,
        interval: 10,
        callback: onTick,
        complete: onComplete
    });
}

function parseTime(time) {
    var parsed = time.match(/(\d{2}):(\d{2})/);
    var m = parsed[1];
    var s = parsed[2];
    return (m * 60 * 1000) + (s * 1000);
}

$(document).ready(function() {

    $('body').on('click', '.main.init .create-game button', function() {
        var time = $(this).siblings('input').val();
        if(time.trim()) {
            $('.clock .value').text(time);
        } else {
            $('.clock .value').text('05:00');
        }
        WS.create(function(url) {
            var $url = $('.url a');
            $url.attr('href', url);
            $url.text(url);
            $url.parent().addClass('displayed');
            $('body .main').removeClass('init');
            $('.create-game').addClass('submitted');
        });
    });

    $('body').on('click', '.main:not(.init) .clock', function() {

        if($('.clock.stop').length == 2) {
            $(this).siblings('.clock').removeClass('stop');
        }

        var $clockToStart = $('.clock.stop');
        var $clockToStop = $('.clock:not(.stop)');

        (function() {
            var $value = $clockToStart.find('.value');
            var timerToStart = getTimer($clockToStart).start(parseTime($value.text()));
            $clockToStart.removeClass('stop');
        })();

        (function() {
            var timerToStop = getTimer($clockToStop).pause();
            $clockToStop.addClass('stop');
        })();

        WS.switch();
    });
});
