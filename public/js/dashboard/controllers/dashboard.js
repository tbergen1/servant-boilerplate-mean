angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$state', 'ServantAngularService',
    function($rootScope, $scope, $timeout, $state, ServantAngularService) {

        // Defaults
        $scope.servant_index = 0;
        $rootScope.view = 'servant';
        $scope.newPlan = 'plan1';
        $scope.plans = [{
            label: '500 Text Messages for $10/Month',
            plan_id: 'plan1'
        }, {
            label: '1000 Text Messages for $20/Month',
            plan_id: 'plan2'
        }, {
            label: '1500 Text Messages for $30/Month',
            plan_id: 'plan3'
        }, {
            label: '2000 Text Messages for $40/Month',
            plan_id: 'plan4'
        }, {
            label: '2500 Text Messages for $50/Month',
            plan_id: 'plan5'
        }];
        $scope.subscribing;
        $scope.subscribed;

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

        $scope.wizardSetServant = function(servantID) {
            // Set Servant
            for (i = 0; i < $rootScope.s.servants.length; i++) {
                if ($rootScope.s.servants[i]._id.toString() === servantID.toString()) $scope.servant_index = i;
            }
            ServantAngularService.setServant($rootScope.s.servants[$scope.servant_index]);
            // Redirect
            if ($rootScope.s.servants[$scope.servant_index].servant_pay_subscription_status === 'none') {
            	$rootScope.view = 'createplan';
            } else {
            	$rootScope.view = 'createnumber';
            }
            // ServantAngularService.servantpayCustomerDelete().then(function(resp) {
            // 	console.log(resp)
            // }, function(error) {
            // 	console.log(error)
            // });
        };

        $scope.showServant = function(servantID) {
            ServantAngularService.showServant(servantID).then(function(response) {
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
            $rootScope.view = view;
        };

        $scope.hideModal = function() {
            // Show Modal Overlay & Box
            document.getElementById("modal-overlay").style.display = 'none';
            document.getElementById("modal-box").style.display = 'none';
            // Change View Back
            $scope.view = 'dashboard';
        };

        $scope.subscribe = function() {
            $scope.subscribing = true;
            // Check Subscription Status
            if ($rootScope.s.servants[$scope.servant_index].servant_pay_subscription_status === 'active') {
                if ($scope.newPlan) {
                    // Update
                    ServantAngularService.servantpaySubscriptionUpdate($scope.newPlan).then(function(response) {
                        console.log(response);
                        $scope.subscribing = false;
                        $scope.subscribed = true;
                        $timeout(function() {
                            $scope.subscribed = false;
                            $rootScope.view = 'menu';
                        }, 3000);
                        return $scope.showServant($rootScope.s.servants[$scope.servant_index]._id);
                    }, function(error) {
                        console.log(error)
                    });
                } else {
                    // Cancel
                    ServantAngularService.servantpaySubscriptionCancel().then(function(response) {
                        console.log(response);
                        $scope.subscribing = false;
                        $scope.subscribed = true;
                        $timeout(function() {
                            $scope.subscribed = false;
                            $rootScope.view = 'menu';
                        }, 3000);
                        return $scope.showServant($rootScope.s.servants[$scope.servant_index]._id);
                    }, function(error) {
                        console.log(error)
                    });
                }
            } else {
                // Create
                ServantAngularService.servantpaySubscriptionCreate($scope.newPlan).then(function(response) {
                    console.log(response);
                    $scope.subscribing = false;
                    $scope.subscribed = true;
                    $timeout(function() {
                        $scope.subscribed = false;
                        $rootScope.view = 'menu';
                    }, 3000);
                    return $scope.showServant($rootScope.s.servants[$scope.servant_index]._id);
                }, function(error) {
                    console.log(error)
                });
            }
        };



    }
]);