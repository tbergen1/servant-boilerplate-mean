angular.module('appDashboard').controller('SubscriptionController', ['$rootScope', '$scope', '$timeout', '$modal', 'ServantAngularService',
	function($rootScope, $scope, $timeout, $modal, ServantAngularService) {

		// Detect Host
		if (window.location.host.indexOf('localhost') > -1) {
		    var protocol = 'http';
		} else {
		    var protocol = 'https';
		}

		// Defaults
		$scope.view = 'loading';

		$scope.initialize = function() {
			// Initialize Stripe Checkout
			$scope.stripeCheckout = StripeCheckout.configure({
			    key: 'sk_test_tJRxt5eaktaLjWRtIM3E1J4c',
			    image: '/square-image.png',
			    token: function(token) {
			      // Use the token to create the charge with a server-side script.
			      // You can access the token ID with `token.id`
			    }
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