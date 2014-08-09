// Servant service used for REST Endpoint
angular.module('appDashboard').factory('Servant', function($resource, $rootScope) {
    return $resource('', null, {
    	getUser: {
            method: 'GET',
            isArray: false,
            url: 'http://api0.servant.co/data/:token/user'
        },
        getProducts: {
            method: 'GET',
            isArray: false,
            url: 'http://api0.servant.co/data/:token/servants/:servantID/products'
        }
    });
});