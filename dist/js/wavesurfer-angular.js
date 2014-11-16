(function () {
    'use strict';
    
    angular.module('wavesurfer.angular', [])
        .filter('hms', function () {
            return function (str) {
                var sec_num = parseInt(str, 10),
                    hours   = Math.floor(sec_num / 3600),
                    minutes = Math.floor((sec_num - (hours * 3600)) / 60),
                    seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (hours   < 10) { hours   = "0" + hours; }
                if (minutes < 10) { minutes = "0" + minutes; }
                if (seconds < 10) { seconds = "0" + seconds; }

                var time    = minutes + ':' + seconds;

                return time;
            };
        })
        .directive('wavesurferAngular', function ($interval, $window) {
            return {
                restrict : 'AE',
                scope    : {
                    url     : '=',
                    options : '='
                },
                templateUrl : '/dist/js/audioplayer.tpl.html',
                link : function (scope, element) {
                    scope.wavesurfer = Object.create(WaveSurfer);
                    scope.playing    = false;
                    scope.volume_level = ($window.sessionStorage.audioLevel || 50);
                    // updating volume slider value
                    scope.updateSlider = function () {
                        $("#volume").slider({
                            min: 0,
                            max: 100,
                            value: scope.volume_level,
                            range: "min",
                            animate: true,
                            slide: function(event, ui) {
                                scope.volume_level = $window.sessionStorage.audioLevel = (ui.value);
                                scope.wavesurfer.setVolume(scope.volume_level / 100);
                            }
                        });
                    };
                    // initialize the wavesurfer
                    scope.options = _.extend({container: document.querySelector('#waveform')}, scope.options);
                    scope.wavesurfer.init(scope.options);
                    scope.updateSlider();
                    scope.wavesurfer.load(scope.url);
                    scope.moment = "0";
                    // on ready
                    scope.wavesurfer.on('ready', function () {
                        scope.length = Math.floor(scope.wavesurfer.getDuration()).toString();
                        $interval(function () {
                            scope.moment = Math.floor(scope.wavesurfer.getCurrentTime()).toString();
                        }, parseFloat(scope.playrate) * 1000); 
                    });
                    // what to be done on finish playing
                    scope.wavesurfer.on('finish', function () {
                        scope.playing = false;
                    });
                    // play/pause action
                    scope.playpause = function () {
                        scope.wavesurfer.playPause();
                        scope.playing = !scope.playing;
                    };
                    
                    scope.ff = function () {
                        scope.wavesurfer.skipForward();
                    };
                    
                    scope.bw = function () {
                        scope.wavesurfer.skipBackward();
                    };
                }
            };
        });
}());