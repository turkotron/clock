var timers = {
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

    $('.clock').on('touchstart', function() {
        navigator.vibrate(1000);
    });

    $('.clock').on('tap click', function() {
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
    });
});
