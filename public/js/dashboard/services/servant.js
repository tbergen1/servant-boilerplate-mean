// Servant service used for REST Endpoint
angular.module('appDashboard').factory('Servant', function($resource, $rootScope) {
    return $resource('', null, {
    	getUser: {
            method: 'GET',
            isArray: false,
            url: 'http://api.servant.co/v0/:token/user'
        },
        getProducts: {
            method: 'GET',
            isArray: false,
            url: 'http://api.servant.co/v0/:token/servants/:servantID/products'
        }
    });
});