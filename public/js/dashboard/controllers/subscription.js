angular.module('appDashboard').controller('SubscriptionController', ['$rootScope', '$scope', '$timeout', '$modal', 'Application', 'ServantAngularService',
	function($rootScope, $scope, $timeout, $modal, Application, ServantAngularService) {

		// Detect Host
		if (window.location.host.indexOf('localhost') > -1) var stripeKey = 'pk_test_5mdgQevPdxbK1KrohjwhIHfs';
		else  var stripeKey = 'pk_test_5mdgQevPdxbK1KrohjwhIHfs';

		// Defaults
		$scope.view = 'loading';
		$scope.plans = [{ label: 'No Plan', subItem: { plan: 'free' }}, { label: '$10/month', subItem: { plan: 'plan1' }}, { label: '$20/month', subItem: { plan: 'plan2' }}, { label: '$30/month', subItem: { plan: 'plan3' }}, { label: '$40/month', subItem: { plan: 'plan4' }}];
		$scope.newPlan;
		$scope.card = {};

		$scope.initialize = function() {
			// Get Plan Data
			if ($rootScope.s.user.plan === 'free') $scope.newPlan = $rootScope.s.user.plan;
			// Initialize Stripe
			Stripe.setPublishableKey(stripeKey);
		};

		// Methods
		$scope.updateCard = function(updatePlan) {
			// Duplicate Card Object Into A Stripe Card Object
			$scope.stripe_card = {
				number: $scope.card.number,
				cvc: $scope.card.cvc
			}
			$scope.stripe_card['exp-year'] = $scope.card.expYear;
			$scope.stripe_card['exp-month'] = $scope.card.expMonth;

			Stripe.card.createToken($scope.stripe_card, function(status, cardToken) {
				if (cardToken.error) {
					if (cardToken.error.param === "number")
						$scope.error = "The Card number you entered is invalid";
					if (cardToken.error.param === "exp_month")
						$scope.error = "The Card expiration month you entered is invalid";
					if (cardToken.error.param === "exp_year")
						$scope.error = "The Card expiration year you entered is invalid";
					if (cardToken.error.param === "cvc")
						$scope.error = "The Card CVC you entered is invalid";

					// Convert Back Card Properties
					$scope.card.expYear = $scope.card['exp-year'];
					$scope.card.expMonth = $scope.card['exp-month'];

					$scope.$apply();
				} else {
					$scope.error = false;

					// Send All Data Back To Server
					Application.user_update_card({}, cardToken, function(result) {
						console.log("Card Saved: ", result);
						if (updatePlan) return $scope.updatePlan();
					}, function(error) {
						console.log(error);
					});
				}
			});
		};

		$scope.updatePlan = function() {
			Application.user_update_plan({}, { plan: $scope.newPlan }, function(result) {
				console.log("Plan Updated: ", result);
				$rootScope.s.user = result;
				$scope.success = true;
			}, function(error) {
				console.log(error);
			});
		};
	}
]);