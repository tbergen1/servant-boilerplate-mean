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

        $scope.searchPhoneNumbers = function() {
            $scope.searching = true;
            Application.searchPhoneNumbers({
                servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
            }, {
                number_type: $scope.number_type,
                country: $scope.country,
                area_code: $scope.area_code
            }, function(response) {
                $scope.phone_numbers = response.available_phone_numbers;
                $scope.searching = false;
            }, function(error) {
                console.log(error);
                $scope.phone_numbers = [];
                $scope.searching = false;
            });
        };

        $scope.purchasePhoneNumber = function(number) {
            var c = confirm("Is this the number you want: " + number + "?  this number will be yours as long as you have a plan with us.");
            if (c) {
                $scope.registering = true;
                Application.purchasePhoneNumber({
                    servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
                }, {
                    phone_number: number
                }, function(response) {
                    $rootScope.s.user.servants[$rootScope.servant_index].twilio_phone_number = response.twilio_phone_number;
                    $scope.registering = false;
                    $scope.registered = true;
                    $timeout(function() {
                        $rootScope.view = 'menu';
                        $scope.registering = false;
                        $scope.registered = false;
                    }, 4000);
                }, function(error) {
                    console.log(error);
                });
            }
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