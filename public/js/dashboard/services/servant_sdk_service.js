/**
 *
 * This Angular Service Wraps the Servant Javascript SDK and returns promises
 * It's currently configured to work with v1.0.6 of the Servant Javascript SDK
 *
 */

angular.module('appDashboard').service('ServantAngularService', ['$rootScope', '$q', function($rootScope, $q) {

    this.status = function() {
        return Servant.status;
    }

    // Don't Intialize w/ Angular SDK

    this.connect = function() {
        Servant.connect();
    }

    this.getUserAndServants = function() {
        var def = $q.defer();
        Servant.getUserAndServants(function(response) {
            def.resolve(response);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

    this.setServant = function(servant) {
        var def = $q.defer();
        // Set Servant In SDK
        Servant.setServant(servant);
        // Set Servant In $rootScope
        $rootScope.s.d.servant = servant;
        def.resolve($rootScope.s.d.servant);
        return def.promise;
    }

    this.initializeUploadableArchetypes = function(options) {
        var def = $q.defer();
        Servant.initializeUploadableArchetypes(options);
        def.resolve();
        return def.promise;
    }

    this.instantiate = function(archetype) {
        var def = $q.defer();
        Servant.instantiate(archetype, function(response) {
            def.resolve(response);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

    this.validate = function(archetype, instance) {
        var def = $q.defer();
        Servant.validate(archetype, instance, function(errors, result) {
            if (errors) def.resolve(errors);
            if (result) def.resolve(result);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

    this.saveArchetype = function(archetype, instance) {
        var def = $q.defer();
        Servant.saveArchetype(archetype, instance, function(response) {
            def.resolve(response);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

    this.showArchetype = function(archetype, archetypeID) {
        var def = $q.defer();
        Servant.showArchetype(archetype, archetypeID, function(response) {
            def.resolve(response);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

    this.queryArchetypes = function(archetype, criteria) {
        var def = $q.defer();
        Servant.queryArchetypes(archetype, criteria, function(response) {
            def.resolve(response);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

    this.deleteArchetype = function(archetype, archetypeID) {
        var def = $q.defer();
        Servant.deleteArchetype(archetype, archetypeID, function(response) {
            def.resolve(response);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

    this.archetypesRecent = function(archetype, page) {
        var def = $q.defer();
        Servant.archetypesRecent(archetype, page, function(response) {
            def.resolve(response);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

    this.archetypesOldest = function(archetype, page) {
        var def = $q.defer();
        Servant.archetypesOldest(archetype, page, function(response) {
            def.resolve(response);
        }, function(error) {
            def.reject(error);
        });
        return def.promise;
    }

}]);


// End