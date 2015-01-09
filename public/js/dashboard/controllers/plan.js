angular.module('appDashboard').controller('PlanController', ['$rootScope', '$scope', '$timeout', '$state', 'Application', 'ServantAngularService',
    function($rootScope, $scope, $timeout, $state, Application, ServantAngularService) {

        // Defaults
        $scope.newPlan = 'plan1';
        if ($rootScope.s.user.servants[$rootScope.servant_index].servant_pay_subscription_plan_id) $scope.newPlan = $rootScope.s.user.servants[$rootScope.servant_index].servant_pay_subscription_plan_id;
        $scope.plans = [{
            label: '500 Text Messages for $12/Month',
            plan_id: 'plan1'
        }, {
            label: '1000 Text Messages for $24/Month',
            plan_id: 'plan2'
        }, {
            label: '1500 Text Messages for $36/Month',
            plan_id: 'plan3'
        }, {
            label: '2000 Text Messages for $48/Month',
            plan_id: 'plan4'
        }, {
            label: '2500 Text Messages for $60/Month',
            plan_id: 'plan5'
        }, {
            label: 'test',
            plan_id: 'test'
        }];

        $scope.initialize = function() {

        };

        $scope.subscribe = function() {
            $scope.subscribing = true;
            // Check Subscription Status
            if ($rootScope.s.user.servants[$rootScope.servant_index].servant_pay_subscription_status === 'active') {
                if ($scope.newPlan) {
                    // Make Sure Not Resubscribed To Same Plan
                    if ($scope.newPlan === $rootScope.s.user.servants[$rootScope.servant_index].servant_pay_subscription_plan_id) return false;
                    // Update
                    ServantAngularService.servantpaySubscriptionUpdate($scope.newPlan).then(function(response) {
                        console.log(response);
                        $scope.subscribing = false;
                        $scope.subscribed = true;
                        $timeout(function() {
                            $scope.subscribed = false;
                            return $state.go('menu', {
                                servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
                            });
                        }, 3000);
                        return $scope.showServant($rootScope.s.user.servants[$rootScope.servant_index].servant_id);
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
                            return $state.go('menu', {
                                servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
                            });
                        }, 3000);
                        return $scope.showServant($rootScope.s.user.servants[$rootScope.servant_index].servant_id);
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
                        return $state.go('menu', {
                            servantID: $rootScope.s.user.servants[$rootScope.servant_index].servant_id
                        });
                    }, 3000);
                    return $scope.showServant($rootScope.s.user.servants[$rootScope.servant_index].servant_id);
                }, function(error) {
                    console.log(error)
                });
            }
        };

    }
]);