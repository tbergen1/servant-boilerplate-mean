/**
 * 
 * This Service wraps cleanly around the SDK to help it work with Angular
 * Without this, you will have to write further code to update the DOM after
 * the SDK performs asyc actions (e.g., $scope.$apply)
 *  
 */
angular.module('appDashboard').service('Servant', ['$q',
	function($q) {
		// Get User & Servants 
		this.getUser = function() {
			var def = $q.defer();
			servant.getUser(function(response) {
				def.resolve(response);
			}, function(error) {
				def.reject('Error Fetching User From SDK: ', error);
			});
			return def.promise;
		};
	}
]);