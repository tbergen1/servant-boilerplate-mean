// Application service used for application's REST endpoints
angular.module('appDashboard').factory('Application', function($resource) {
    return $resource('', null, {

        show_user: {
            method: 'GET',
            isArray: false,
            url: '/user'
        },
        searchPhoneNumbers: {
            method: 'POST',
            isArray: false,
            url: '/servants/:servantID/twilio/phone_numbers/search'
        },
        purchasePhoneNumber: {
            method: 'POST',
            isArray: false,
            url: '/servants/:servantID/twilio/phone_numbers/purchase'
        }


    });
});