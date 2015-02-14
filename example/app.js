'use strict';

var app = angular.module('example', ['wavesurfer.angular']);

app.controller('wavesurferController', ['$scope', function ($scope) {
    $scope.options = {
        waveColor      : '#c5c1be',
        progressColor  : '#2A9FD6',
        normalize      : true,
        hideScrollbar  : true,
        skipLength     : 5,
        height         : 253,
        minPxPerSec    : 250,
        cursorColor    : '#2A9FD6'
    };
    
    $scope.url = 'http://makkah-dl.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/001.mp3';

}]);