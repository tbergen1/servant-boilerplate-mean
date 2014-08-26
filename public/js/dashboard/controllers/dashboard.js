angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$modal',
	function($rootScope, $scope, $timeout, $modal) {

		// Defaults
		$rootScope.servant = {};

		$scope.initialize = function() {

			// Get User & Servants 
			servant.getUser(function(response) {
				// Have to call $scope.$apply since Servant call is asynchronous and therefore updates outside of the AngularJS digest cycle
				$scope.$apply(function() {
					$rootScope.servant.user = response.user;
					$rootScope.servant.servants = response.servants;
					if (!$rootScope.servant.servants.length) alert('You either have on servants on your Servant account, or you have not allowed any to use this application.  Go into your Servant Dashboard to change this: http://www.servant.co');
					console.log('Servant User Information Fetched: ', $rootScope.servant);
				})
			}, function(error) {
				console.log('Error Fetching User From Servant: ', error);
			});

		};

	}
]);