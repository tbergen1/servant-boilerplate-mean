angular.module('appDashboard').controller('BlastController', ['$rootScope', '$scope', '$timeout', '$interval', '$state', 'Application', 'ServantAngularService',
    function($rootScope, $scope, $timeout, $interval, $state, Application, ServantAngularService) {

        $scope.initialize = function() {
            // Defaults
            $scope.view = 'tinytext';
            $scope.tinytexts = [];
            $scope.tinytext;
            $scope.more_results = true;
            $scope.page = 1;
            $scope.blast_date = moment();
            if ($scope.blast_date.diff(moment(), 'minutes')) $scope.blast_date = moment();
            // Set Timer
            $interval(function() {
                if ($scope.blast_date.diff(moment(), 'minutes')) $scope.blast_date = moment();
            }, 60000);
            // Fetch tinyTexts
            $scope.loadTinyTexts();
            // Scroll Listener For Tiny Texts
            $('#tiny-text-container').scroll(function() {
                var difference = $('#tiny-text-container')[0].scrollHeight - ($('#tiny-text-container').scrollTop() + $('#tiny-text-container').height());
                if ($('#tiny-text-container').scrollTop() > 100 && difference < 100 && $scope.more_results && !$scope.loading_infinitescroll) {
                    // Set Loading more results
                    $scope.loading_infinitescroll = true;
                    // Set next page
                    $scope.page = $scope.page + 1;
                    // Fetch Records
                    $scope.loadTinyTexts($scope.page, function() {
                        $timeout(function() {
                            $scope.loading_infinitescroll = false;
                        }, 250);
                    });
                }
            }); // Scroll Listener
        };

        $scope.selectTinyText = function(tinytext) {
            $scope.view = 'schedule';
            $scope.tinytext = tinytext;
        };

        $scope.scheduleTask = function() {
            $scope.scheduling = true;
            Application.scheduleTask({
                servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
            }, {
                scheduled_time: $scope.blast_date.toDate(),
                tinytextID: $scope.tinytext._id,
                task: 'sms_blast_single'
            }, function(response) {
                $scope.scheduled_time = moment(response.scheduled_time);
                $scope.view = 'scheduled';
                $scope.scheduling = false;
            }, function(error) {
                console.log(error);
            });
        };

        $scope.loadTinyTexts = function(page, callback) {
            // Fetch TinyTexts
            ServantAngularService.archetypesRecent('tinytext', page).then(function(response) {
                $scope.tinytexts = $scope.tinytexts.concat(response.records);
                console.log("Tiny Texts Fetched: ", $scope.tinytexts);
                if (response.records.length < 10) $scope.more_results = false;
                if (callback) return callback();
            }, function(error) {
                console.log(error);
                if (callback) return callback();
            });
        };

        $scope.adjustDate = function(increment, direction) {
            // Show Modal Overlay & Box
            if (direction === 'up') $scope.blast_date.add(1, increment);
            if (direction === 'down') $scope.blast_date.subtract(1, increment);
            // Validate
            if ($scope.blast_date.diff(moment(), 'minutes') < 0) $scope.blast_date = moment();
            if ($scope.blast_date.diff(moment(), 'days') > 59) $scope.blast_date = moment().add(60, 'days');
        };

    }
]);