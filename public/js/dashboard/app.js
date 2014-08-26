/**
 * Create Angular App
 */
angular.module('appDashboard', ['ngResource', 'ui.router', 'ui.bootstrap', 'LocalStorageModule']);


/**
 * Universal Functions & Data
 */
angular.module('appDashboard').run(['$rootScope', '$timeout', '$interval',
	function($rootScope, $timeout, $interval) {

		// Defaults
		$rootScope.servant = {};

	}
]);