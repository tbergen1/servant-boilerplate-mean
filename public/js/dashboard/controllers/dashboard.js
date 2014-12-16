angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$modal', 'ServantAngularService',
	function($rootScope, $scope, $timeout, $modal, ServantAngularService) {

		$scope.initialize = function() {
			ServantAngularService.getUserAndServants().then(function(response) {
				console.log(response);
				$rootScope.servant = response;
			}, function(error) {
				console.log(error);
			});
		};

	}
]);