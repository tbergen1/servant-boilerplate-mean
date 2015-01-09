angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$state', 'Application', 'ServantAngularService',
    function($rootScope, $scope, $timeout, $state, Application, ServantAngularService) {

        // Defaults
        $scope.number_type = 'local';
        $scope.country = 'US';
        $scope.area_code = '424';

        $scope.initialize = function() {};

        $scope.showServant = function(servantID) {
            ServantAngularService.showServant(servantID).then(function(response) {
                console.log(response)
            }, function(error) {
                console.log(error);
            });
        };


        $scope.scheduleTask = function(datetime) {
            Application.scheduleTask({
                servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
            }, {
                time: datetime
            }, function(response) {
                $scope.registering = false;
                $rootScope.s.user.servants[$rootScope.servant_index] = response;
            }, function(error) {
                console.log(error);
            });
        };

        $scope.loadTinyTexts = function() {
            // Fetch TinyTexts
            ServantAngularService.archetypesRecent('tinytext', 1).then(function(response) {
                $rootScope.s.tinytexts = response.records;
                console.log("Tiny Texts Fetched: ", $rootScope.s.tinytexts);
            }, function(error) {
                console.log(error);
            });
        };

        $scope.adjustDate = function(increment, direction) {
            // Default
            var currentDatetime = moment(new Date());
            var maxDays = 30;
            console.log(increment, direction);
            // Show Modal Overlay & Box
            if (direction === 'up') $scope.blast_date.add(1, increment);
            if (direction === 'down') $scope.blast_date.subtract(1, increment);
            // Validate
            if ($scope.blast_date.diff(currentDatetime, 'hours') < 1) {
                $scope.blast_date = moment(new Date());
                $scope.blast_date.add(1, 'hours').startOf('hour');
            }
            if ($scope.blast_date.diff(currentDatetime, 'days') > 30) $scope.blast_date.subtract(1, 'days');
        };

        $scope.showModal = function(view) {
            // Show Modal Overlay & Box
            document.getElementById("modal-overlay").style.display = 'block';
            document.getElementById("modal-box").style.display = 'block';
            // Change View Back
            $rootScope.view = view;
        };

        $scope.hideModal = function() {
            // Show Modal Overlay & Box
            document.getElementById("modal-overlay").style.display = 'none';
            document.getElementById("modal-box").style.display = 'none';
            // Change View Back
            $rootScope.view = 'dashboard';
        };

    }
]);