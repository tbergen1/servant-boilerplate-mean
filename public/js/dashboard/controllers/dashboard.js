angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$state', 'Application', 'ServantAngularService',
    function($rootScope, $scope, $timeout, $state, Application, ServantAngularService) {

        // Defaults
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

        $scope.initialize = function() {
            $scope.getServants();
        };

        $scope.getServants = function(callback) {
            ServantAngularService.getUserAndServants().then(function(response) {
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
                if (callback) return callback();
            }, function(error) {
                console.log(error);
            });
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
                servantID: $rootScope.s.servants[$rootScope.servant_index]._id
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
                    servantID: $rootScope.s.servants[$rootScope.servant_index]._id
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
                servantID: $rootScope.s.servants[$rootScope.servant_index]._id
            }, {
                time: datetime
            }, function(response) {
                $scope.registering = false;
                $rootScope.s.servants[$rootScope.servant_index] = response;
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

        $scope.subscribe = function() {
            $scope.subscribing = true;
            // Check Subscription Status
            if ($rootScope.s.servants[$rootScope.servant_index].servant_pay_subscription_status === 'active') {
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
                        return $scope.showServant($rootScope.s.servants[$rootScope.servant_index]._id);
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
                        return $scope.showServant($rootScope.s.servants[$rootScope.servant_index]._id);
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
                    return $scope.showServant($rootScope.s.servants[$rootScope.servant_index]._id);
                }, function(error) {
                    console.log(error)
                });
            }
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