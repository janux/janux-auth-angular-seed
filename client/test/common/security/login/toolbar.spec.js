describe('login-toolbar', function() {
  var $rootScope, scope, toolbar, security;

  beforeEach(module('cachedTemplates', 'security'));

  beforeEach(inject(function(_$rootScope_, $compile, _security_) {
    $rootScope = _$rootScope_;
    security   = _security_;
    toolbar    = $compile('<login-toolbar></login-toolbar>')($rootScope);
    $rootScope.$digest();

    scope = toolbar.scope();

    angular.element(document.body).append(toolbar);
		// console.debug('toolbar', toolbar);
  }));


  afterEach(function() {
    toolbar.remove();
  });


  it('should attach stuff to the scope', inject(function ($compile, $rootScope) {
		expect(scope.currentUser).toBeDefined();
		expect(scope.isAuthenticated).toBe(security.isAuthenticated);
		expect(scope.login).toBe(security.showLogin);
		expect(scope.logout).toBe(security.logout);
  }));


  it('should display login and no user, when user is not authenticated', function() {
    security.currentUser = null;
    $rootScope.$digest();

		expect(toolbar.find('#login').hasClass('ng-hide')).toBe(false);
		expect(toolbar.find('#login').text().trim()).toBe('Login');

		// console.debug('auth-user', toolbar.find('.auth-user').attr('class'));
    expect(toolbar.find('.auth-user').hasClass('ng-hide')).toBe(true);
    expect(toolbar.find('.auth-user').text().trim()).toBe('');

		expect(toolbar.find('#logout').hasClass('ng-hide')).toBe(true);
		expect(toolbar.find('#logout').text().trim()).toBe('Logout');
  });


  it('should display current user name and logout, when authenticated', function () {
    security.currentUser = { firstName: 'Jo', lastName: 'Bloggs'};
    $rootScope.$digest();

    expect(toolbar.find('.auth-user').text().trim()).toBe('Jo Bloggs');
    expect(toolbar.find('.auth-user').hasClass('ng-hide')).toBe(false);

		expect(toolbar.find('#logout').hasClass('ng-hide')).toBe(false);
		expect(toolbar.find('#logout').text().trim()).toBe('Logout');

		expect(toolbar.find('#login').hasClass('ng-hide')).toBe(true);
		expect(toolbar.find('#login').text().trim()).toBe('Login');
  });


  it('should call logout when the logout button is clicked', function () {
    spyOn(scope, 'logout');
    toolbar.find('#logout').click();
    expect(scope.logout).toHaveBeenCalled();

		expect(toolbar.find('#login').hasClass('ng-hide')).toBe(false);
		expect(toolbar.find('#login').text().trim()).toBe('Login');

    expect(toolbar.find('.auth-user').hasClass('ng-hide')).toBe(true);
    expect(toolbar.find('.auth-user').text().trim()).toBe('');

		expect(toolbar.find('#logout').hasClass('ng-hide')).toBe(true);
		expect(toolbar.find('#logout').text().trim()).toBe('Logout');
  });


  it('should call login when the login button is clicked', function () {
    spyOn(scope, 'login');
    toolbar.find('#login').click();
    expect(scope.login).toHaveBeenCalled();
  });
});