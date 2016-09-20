var rapModule = angular.module('rap', ['ui.router', 'ngAnimate']);

rapModule.service('peopleService', function PeopleService($http, $state) {
  var peopleService = this;
  peopleService.people = [];
  function filterGender(originalPeople, gender) {
    if (gender === 'all') {
      return originalPeople;
    } else {
      return originalPeople.filter(function (p) {
        return p.gender === gender;
      });
    }
  }
  peopleService.loadPeople = function (gender) {
    return $http.get('/data.json').then(function (res) {
      peopleService.people = filterGender(res.data, gender);
      return peopleService.people;
    });
  };
  peopleService.select = function (person) {
    peopleService.person = person;
    $state.go('search.detail', {id: person._id});
  };
  peopleService.loadId = function(id) {
    peopleService.person = peopleService.people.find(function (p) {
      return p._id === id;
    });
  };
  peopleService.changeGender = function (gender) {
    peopleService.loadPeople(gender).then(function () {
      $state.go($state.current.name, { gender: gender });
    })
  }
});

rapModule.component('rapCriteria', {
  controller: function CriteriaController(peopleService) {
    this.gender = 'all';
    this.change = peopleService.changeGender;
  },
  controllerAs: 'criteria',
  template: '<h2>Criteria</h2><div class="form-group">' +
  '<label><input type="radio" ng-model="criteria.gender" ng-change="criteria.change(criteria.gender)" name="gender" value="female"> Female</label>' +
  '<label><input type="radio" ng-model="criteria.gender" ng-change="criteria.change(criteria.gender)" name="gender" value="male"> Male</label>' +
  '<label><input type="radio" ng-model="criteria.gender" ng-change="criteria.change(criteria.gender)" name="gender" value="all"> All</label></div>' +
  '<button class="btn btn-primary" ui-sref="search.list({gender: criteria.gender})">Results</button>'
});

rapModule.component('rapList', {
  template: '<h2>List</h2><ul><li ng-repeat="person in list.peopleService.people"><a href="" ng-click="list.peopleService.select(person)">{{person.name}}</a></li></ul>',
  controller: function ListController(peopleService) {
    this.peopleService = peopleService;
  },
  controllerAs: 'list'
});

rapModule.component('rapDetail', {
  template: '<h2>{{detail.peopleService.person.name}}</h2><div>' +
  '<br>E-Mail: {{detail.peopleService.person.email}}' +
  '<br>Phone:  {{detail.peopleService.person.phone}}' +
  '<br>Address:  {{detail.peopleService.person.address}}</div>',
  controller: function DetailController(peopleService) {
    this.peopleService = peopleService;
  },
  controllerAs: 'detail'
});

function SearchController($scope, $state) {
  $scope.showCriteria = function () {
    return $state.current.name !== 'search.detail';
  };
  $scope.isStateCriteria = function () {
    return $state.current.name === 'search.criteria';
  };
  $scope.isStateList = function () {
    return $state.current.name === 'search.list';
  };
  $scope.showDetail = function () {
    return $state.current.name === 'search.detail';
  };
}

rapModule.controller('AppController', function ($state) {
  this.state = $state.current
});

rapModule.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider.state({
    abstract: true,
    name: 'search',
    template: '<rap-criteria class="col-md-6 sv" ng-class="{ \'hidden-sm-down\': !isStateCriteria() }" ng-show="showCriteria()"></rap-criteria>' +
    '<rap-list class="col-md-6 sv" ng-class="{ \'hidden-sm-down\': !isStateList() }"></rap-list>' +
    '<rap-detail class="col-md-6 sv" ng-show="showDetail()"></rap-detail>',
    controller: SearchController,
    resolve: {
      people: ['peopleService', '$stateParams', function (peopleService, $stateParams) {
        return peopleService.loadPeople($stateParams.gender || 'all');
      }]
    }
  }).state({
    url: '/c?gender',
    parent: 'search',
    name: 'search.criteria'
  }).state({
    url: '/l?gender',
    parent: 'search',
    name: 'search.list'
  }).state({
    url: '/d/:id',
    parent: 'search',
    name: 'search.detail',
    resolve: {
      detail: ['peopleService', '$stateParams', function (peopleService, $stateParams) {
        return peopleService.loadId($stateParams.id);
      }]
    }
  });

  $urlRouterProvider.when('/', '/c');
});
