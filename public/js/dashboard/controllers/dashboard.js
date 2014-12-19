angular.module('appDashboard').controller('DashboardController', ['$rootScope', '$scope', '$timeout', '$modal', 'ServantAngularService',
	function($rootScope, $scope, $timeout, $modal, ServantAngularService) {


		// Initialize Stripe Checkout
		$scope.stripeCheckout = StripeCheckout.configure({
		    key: 'sk_test_tJRxt5eaktaLjWRtIM3E1J4c',
		    image: '/square-image.png',
		    token: function(token) {
		      // Use the token to create the charge with a server-side script.
		      // You can access the token ID with `token.id`
		    }
		});

		// Defaults
		$scope.view = 'loading';


		$scope.initialize = function() {
			ServantAngularService.getUserAndServants().then(function(response) {
				console.log("User and Servants:", response);
				$rootScope.servant = response;
			}, function(error) {
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