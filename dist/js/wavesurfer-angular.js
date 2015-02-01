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
        .directive('wavesurfer', function () {
            return {
                restrict: 'EA',
                template: '<div class="waveform" id="waveform">',
                require: '^wavesurferAngular',
                link: function(scope, element, attrs, wavesurferAngularCtrl) {
                    wavesurferAngularCtrl.init()
                }
            }
        })
        .directive('playButton', function() {
            return{
                restrict: 'A',
                require: '^wavesurferAngular',
                link: function(scope, element, attrs, wavesurferAngularCtrl) {

                    element.on('click', wavesurferAngularCtrl.playpause);
                }
            }
        })
        .directive('backwardButton', function() {
            return{
                restrict: 'A',
                require: '^wavesurferAngular',
                link: function(scope, element, attrs, wavesurferAngularCtrl) {
                    element.on('click', wavesurferAngularCtrl.bw);
                }
            }
        })
        .directive('forwardButton', function() {
            return{
                restrict: 'A',
                require: '^wavesurferAngular',
                link: function(scope, element, attrs, wavesurferAngularCtrl) {
                    element.on('click', wavesurferAngularCtrl.ff);
                }
            }
        })
        .directive('volumeLevel', function($window) {
            return{
                restrict: 'A',
                require: '^wavesurferAngular',
                link: function(scope, element, attrs, wavesurferAngularCtrl) {
                    element.val(( $window.sessionStorage.audioLevel || 50));

                    // This could be changed to onchange
                    element.on('mousemove', function(e) {
                        wavesurferAngularCtrl.updateVolume(element.val())
                    });
                }
            }
        })
        .directive('wavesurferAngular', function($interval, $window, $filter) {
            return {
                restrict: 'EA',
                scope: {
                    url: '=',
                    options: '='
                },
                transclude: true,
                template: "<div ng-transclude></div>",
                controller: function($scope, $element) {
                    var self = this;

                    this.wavesurfer = Object.create(WaveSurfer);
                    this.playing    = false;

                    this.updateVolume = function(volumeLevel) {
                        this.wavesurfer.setVolume(volumeLevel / 100);
                        $window.sessionStorage.audioLevel = volumeLevel;
                    }

                    // on ready
                    this.wavesurfer.on('ready', function () {
                        $scope.length = Math.floor(self.wavesurfer.getDuration()).toString();
                        $interval(function () {
                            $scope.moment = Math.floor(self.wavesurfer.getCurrentTime()).toString();
                        }, parseFloat($scope.playrate) * 1000); 
                    });

                    // Watch and push to the parent scope to be used there.
                    $scope.$watchGroup(['moment', 'length'], function(oldValue, newValue, scope) {
                        $scope.$parent.moment =  $filter('hms')($scope.moment);
                        $scope.$parent.length =  $filter('hms')($scope.length);
                    });

                    // What to be done on finish playing
                    this.wavesurfer.on('finish', function () {
                        this.playing = false;
                    }.bind(this));

                    this.init = function(options) {
                        $scope.options = $.extend({container: $element[0].querySelector('#waveform')},$scope.options);
                        this.wavesurfer.init($scope.options);
                        this.wavesurfer.load($scope.url);

                        $scope.moment = "0";
                    };

                    // play/pause action
                    this.playpause = function() {
                        this.wavesurfer.playPause();
                        this.playing = !this.playing;
                    }.bind(this);
                    
                    this.ff = function() {
                        this.wavesurfer.skipForward();
                    }.bind(this);
                    
                    this.bw = function() {
                        this.wavesurfer.skipBackward();
                    }.bind(this);
                }
            };
        });
}());