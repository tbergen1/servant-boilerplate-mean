angular.module('appDashboard').controller('NumberController', ['$rootScope', '$scope', '$timeout', '$state', '$stateParams', 'Application', 'ServantAngularService',
    function($rootScope, $scope, $timeout, $state, $stateParams, Application, ServantAngularService) {

        // Defaults
        $scope.number_type = 'local';
        $scope.country = 'US';
        $scope.area_code = '424';

        $scope.initialize = function() {
            // Check If Servant Has Plan
            if ($rootScope.s.user.servants[$rootScope.servant_index].servant_pay.subscription_status === 'none') {
                return $state.go('plan', {
                    servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
                });
            }
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
            var c = confirm("Is this the number you want: " + number + "?  This number will be yours as long as you have a plan with us.  If you cancel your plan, this number will be lost forever, so be careful!");
            if (c) {
                $scope.registering = true;
                Application.purchasePhoneNumber({
                    servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
                }, {
                    phone_number: number
                }, function(response) {
                    $rootScope.s.reloadUserAndServantData(function() {
                        // Set Servant Again To Make Sure servant_index points to the right Servant
                        $rootScope.s.setServant($stateParams.servantID, function() {
                            $scope.registering = false;
                            $scope.registered = true;
                            $timeout(function() {
                                $scope.registered = false;
                                return $state.go('menu', {
                                    servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
                                });
                            }, 3000);
                        });
                    });
                }, function(error) {
                    console.log(error);
                });
            }
        };

        $scope.releasePhoneNumber = function() {
            var c = confirm("WARNING: If you release your phone number you will NEVER be able to recover it.  Are you sure you want to release this phone number?");
            if (c) {
                $scope.releasing = true;
                Application.releasePhoneNumber({
                    servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
                }, {}, function(response) {
                    $rootScope.s.reloadUserAndServantData(function() {
                        // Set Servant Again To Make Sure servant_index points to the right Servant
                        $rootScope.s.setServant($stateParams.servantID, function() {
                            $scope.releasing = false;
                        });
                    });
                }, function(error) {
                    console.log(error);
                    return false
                });
            }
        };

    }
]);