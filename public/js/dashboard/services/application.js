// Application service used for application's REST endpoints
angular.module('appDashboard').factory('Application', function($resource) {
    return $resource('', null, {

        show_user: {
            method: 'GET',
            isArray: false,
            url: '/user'
        },
        user_update_card: {
            method: 'POST',
            isArray: false,
            url: '/user/update_card'
        },
        user_update_plan: {
            method: 'PUT',
            isArray: false,
            url: '/user/update_plan'
        }

    });
});