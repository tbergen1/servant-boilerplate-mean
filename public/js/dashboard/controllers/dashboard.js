angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$state', 'ServantAngularService',
    function($rootScope, $scope, $timeout, $state, ServantAngularService) {

        // Defaults
        $scope.servant_index = 0;
        $scope.view = 'servant';
        $scope.newPlan = undefined;
        $scope.plans = [{
            label: 'No Plan',
            plan_id: undefined
        }, {
            label: '$10/Month',
            plan_id: 'plan1'
        }, {
            label: '$20/Month',
            plan_id: 'plan2'
        }, {
            label: '$30/Month',
            plan_id: 'plan3'
        }, {
            label: '$40/Month',
            plan_id: 'plan4'
        }];

        // $scope.$watch('servant_index', function(newValue, oldValue) {
        //     if (!$rootScope.s.servants) return;
        //     // Set Servant in SDK
        //     ServantAngularService.setServant($rootScope.s.servants[$scope.servant_index]);
        //     // Load TinyTexts
        //     $scope.loadTinyTexts();
        //     // Set Plan
        //     if ($rootScope.s.servants[$scope.servant_index].servant_pay_subscription_plan_id) $scope.newPlan = $rootScope.s.servants[$scope.servant_index].servant_pay_subscription_plan_id;
        // });

        $scope.initialize = function() {
            // Fetch User Data
            ServantAngularService.getUserAndServants().then(function(response) {
                console.log("User and Servants Fetched:", response);
                $rootScope.s.servants = response.servants;
            }, function(error) {
                console.log(error);
            });
        };

        $scope.wizardSetServant = function(servant, index) {
        	// Set Servant
        	ServantAngularService.setServant($rootScope.s.servants[$scope.servant_index]);
        	// Set Servant Index
        	$scope.servant_index = index;
        	$scope.view = 'plan';
        };	

        $scope.refreshCurrentServant = function() {
            ServantAngularService.showServant($rootScope.s.servants[$scope.servant_index]._id).then(function(response) {
                $rootScope.s.servants[$scope.servant_index] = response;
                console.log(response)
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

        $scope.showModal = function(view) {
            // Show Modal Overlay & Box
            document.getElementById("modal-overlay").style.display = 'block';
            document.getElementById("modal-box").style.display = 'block';
            // Change View Back
            $scope.view = view;
        };

        $scope.hideModal = function() {
            // Show Modal Overlay & Box
            document.getElementById("modal-overlay").style.display = 'none';
            document.getElementById("modal-box").style.display = 'none';
            // Change View Back
            $scope.view = 'dashboard';
        };

        $scope.subscribe = function() {
            // Check Subscription Status
            if ($rootScope.s.servants[$scope.servant_index].servant_pay_subscription_status === 'active') {
                if ($scope.newPlan) {
                    // Update
                    ServantAngularService.servantpaySubscriptionUpdate($scope.newPlan).then(function(response) {
                        console.log(response);
                        return $scope.refreshCurrentServant();
                    }, function(error) {
                        console.log(error)
                    });
                } else {
                    // Cancel
                    ServantAngularService.servantpaySubscriptionCancel().then(function(response) {
                        console.log(response);
                        return $scope.refreshCurrentServant();
                    }, function(error) {
                        console.log(error)
                    });
                }
            } else {
                // Create
                ServantAngularService.servantpaySubscriptionCreate($scope.newPlan).then(function(response) {
                    console.log(response);
                    return $scope.refreshCurrentServant();
                }, function(error) {
                    console.log(error)
                });
            }
        };
    }
]);