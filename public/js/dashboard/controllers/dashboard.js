angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$modal', 'Servant',
	function($rootScope, $scope, $timeout, $modal, Servant) {

		$scope.initialize = function() {

			Servant.getUser().then(function(data) {
				$rootScope.servant.user = data.user;
				$rootScope.servant.servants = data.servants;
				if (!$rootScope.servant.servants.length) alert('You either have on servants on your Servant account, or you have not allowed any to use this application.  Go into your Servant Dashboard to change this: http://www.servant.co');
				console.log('Servant User Information Fetched: ', $rootScope.servant);
			});

		};

	}
]);