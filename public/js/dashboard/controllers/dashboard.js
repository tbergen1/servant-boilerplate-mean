angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$state', 'Application', 'ServantAngularService',
    function($rootScope, $scope, $timeout, $state, Application, ServantAngularService) {

        // Defaults
        $scope.servant_index = 0;
        $rootScope.view = 'servant';
        $scope.newPlan = 'plan1';
        $scope.number_type = 'local';
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
        $scope.country = 'US';
        $scope.area_code = '424';

        $rootScope.$watch('view', function(newValue, oldValue) {
            if (newValue === 'menu') {
                if ($rootScope.s.user.servants[$scope.servant_index].servant_pay_subscription_status === 'none') $rootScope.view = 'createplan';
                if (!$rootScope.s.user.servants[$scope.servant_index].twilio_phone_number) $rootScope.view = 'createnumber';
            }
        });

        $scope.initialize = function() {
            // Fetch User Data
            $scope.getServants();
        };

        $scope.getServants = function() {
            ServantAngularService.getUserAndServants().then(function(response) {
                console.log("User and Servants Fetched:", response);
                $rootScope.s.servants = response.servants;
                // Combine Servants and ServantMeta
                for (i = 0; i < $rootScope.s.user.servants.length; i++) {
                    for (j = 0; j < $rootScope.s.servants.length; j++) {
                        if ($rootScope.s.user.servants[i].servant_id === $rootScope.s.servants[j]._id) {
                            $rootScope.s.user.servants[i].master = $rootScope.s.servants[j].master;
                            $rootScope.s.user.servants[i].master_biography = $rootScope.s.servants[j].master_biography;
                            $rootScope.s.user.servants[i].personality = $rootScope.s.servants[j].personality;
                            $rootScope.s.user.servants[i].servant_pay_subscription_status = $rootScope.s.servants[j].servant_pay_subscription_status;
                            $rootScope.s.user.servants[i].servant_pay_subscription_plan_canceled = $rootScope.s.servants[j].servant_pay_subscription_plan_canceled;
                        }
                    };
                };
                console.log("User: ", $rootScope.s.user)
            }, function(error) {
                console.log(error);
            });
        };

        $scope.wizardSetServant = function(servantID) {
            // Set Servant
            for (i = 0; i < $rootScope.s.servants.length; i++) {
                if ($rootScope.s.user.servants[i]._id.toString() === servantID.toString()) $scope.servant_index = i;
            }
            ServantAngularService.setServant($rootScope.s.user.servants[$scope.servant_index]);
            $rootScope.view = 'menu';
        };

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
                servantID: $rootScope.s.servants[$scope.servant_index]._id
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

        $scope.registering = true;
        $scope.purchasePhoneNumber = function(number) {
            var c = confirm("Is this the number you want: " + number + "?  this number will be yours as long as you have a plan with us.");
            if (c) {
                $scope.registering = true;
                Application.purchasePhoneNumber({
                    servantID: $rootScope.s.servants[$scope.servant_index]._id
                }, {
                    phone_number: number
                }, function(response) {
                    $scope.registering = false;
                    $rootScope.s.servants[$scope.servant_index] = response;
                }, function(error) {
                    console.log(error);
                });
            }
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