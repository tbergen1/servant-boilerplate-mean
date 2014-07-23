angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$modal', 'Servant',
	function($rootScope, $scope, $timeout, $modal, Servant) {

		$scope.initialize = function() {
			// Defaults

			// Fetch User's Information & Available Servants
			Servant.getUser({
				token: $rootScope.servant.token
			}, function(response) {
				console.log(response)
				$rootScope.servant.user = response.user;
				$rootScope.servant.servants = response.servants;
				if (!$rootScope.servant.servants.length) alert("You either have on servants on your Servant account, or you have not allowed any to use this application.  Go into your Servant Dashboard to change this: http://www.servant.co")
			}, function(error) {
				console.log("Error Fetching User From Servant: ", error);
			})

		};

	}
]);