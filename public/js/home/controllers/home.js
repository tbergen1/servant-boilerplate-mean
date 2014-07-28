angular.module('appHome').controller('HomeController', ['$scope', '$timeout', '$modal', 'localStorageService', function ($scope, $timeout, $modal, localStorageService) {
    
    $scope.initialize = function() {
        // Defaults
        $scope.connecting = false;
    };

    $scope.connect = function() {
    	$scope.connecting = true;
    };

}]);