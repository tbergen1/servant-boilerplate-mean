angular.module('appDashboard').controller('NumberController', ['$rootScope', '$scope', '$timeout', '$modal', '$state', 'ServantAngularService',
	function($rootScope, $scope, $timeout, $modal, $state, ServantAngularService) {

		// Defaults
		$scope.view = 'loading';

		$scope.initialize = function() {
			// Check Subscription
			// if ($rootScope.s.user.plan === 'free') return $state.go('subscription');
			
		};

		$scope.loadTinyTexts = function() {
			ServantAngularService.archetypesRecent('tinytext', 1).then(function(response){
				$rootScope.s.tinytexts = response.records;
				console.log("Tiny Texts Fetched: ", $rootScope.s.tinytexts);
			},function(error){
				console.log(error);
			});
		};

		$scope.checkout = function(amount) {
			// Open Checkout with further options
		    $scope.stripeCheckout.open({
		      	name: 'Servant Text Messenger',
		      	description: '350 Text Messages/month for $' + amount + '.00',
		      	amount: amount,
		      	panelLabel: 'Subscribe {{ amount }}',
		      	amount: 2000
		    });
		};
	}
]);