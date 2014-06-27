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

function startOtherTimer(id) {
    Object.keys(timers).filter(function(key) {
        if(key != id) {
            $('.clock[data-timer="' + key + '"]').removeClass('stop');
            timers[key].start();
        }
    });
}

function pauseOtherTimer(id) {
    Object.keys(timers).filter(function(key) {
        if(key != id) {
            $('.clock[data-timer="' + key + '"]').addClass('stop');
            timers[key].pause();
        }
    });
}

$(document).ready(function() {

    $('body').on('tap click', '.init .create-game button', function() {
        var time = $(this).siblings('input').val();
        if(time.trim()) {
            $('.clock .value').text(time);
        } else {
            $('.clock .value').text('05:00');
        }
        WS.create(function(url) {
            var $url = $('.url');
            $url.text(url);
            $url.addClass('displayed');
            $('body').removeClass('init');
            $('.create-game').addClass('submitted');
        });
    });

    $('body').on('tap click', '.clock', function() {
        var $clock = $(this);
        var $value = $clock.find('.value');
        var timerId = $clock.data('timer') || Date.now();
        var timer = timers[timerId];

        if(!timer) {
            timer =  Timer(
                function onTick() {
                    var x = timer.msToTime(timer.lap());
                    var timeString = x.substring(0, x.length - 4);
                    $value.text(timeString);
                },
                function onComplete() {
                    WS.finish();
                }
            );
            $clock.data('timer', timerId);
            timers[timerId] = timer;
        }

        if($clock.is('.stop')) {
            window.setTimeout(function() {
                timer.start(parseTime($value.text()));
            }, 200);
            pauseOtherTimer(timerId);
            $clock.removeClass('stop');
        } else {
            if(!$clock.siblings('.clock').is('.stop')) {
                $clock.addClass('stop');
                startOtherTimer(timerId);
                timer.stop();
            }
        }

        WS.switch();
    });
});
