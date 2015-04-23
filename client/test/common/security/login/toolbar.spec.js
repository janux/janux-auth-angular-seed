describe('login-toolbar', function() {
	var $rootScope, scope, toolbar, security;

	beforeEach(module(
		'cachedTemplates',
		'pascalprecht.translate', 
		'jnxSecurity'
	));

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
		// TODO: need to figure out how to load the locale/en.json
		expect(toolbar.find('#login').text().trim()).toBe('label.login');

		expect(toolbar.find('.auth-user').hasClass('ng-hide')).toBe(true);
		expect(toolbar.find('.auth-user').text().trim()).toBe('');

		expect(toolbar.find('#logout').hasClass('ng-hide')).toBe(true);
		expect(toolbar.find('#logout').text().trim()).toBe('label.logout');
	});


	it('should display current user name and logout, when authenticated', function () {
		security.currentUser = { 
			oid: '1234567890', 
			account: {
				name: 'widget',
				password: 'password',
				passwordExpire: '',
				isLocked: false,
			},
			person: { 
				name: { first: 'Jo', last: 'Bloggs' },
				email: 'jo@bloggs.com'
			}
		};

		$rootScope.$digest();

		expect(toolbar.find('.auth-user').text().trim()).toBe('Jo Bloggs');
		expect(toolbar.find('.auth-user').hasClass('ng-hide')).toBe(false);

		expect(toolbar.find('#logout').hasClass('ng-hide')).toBe(false);
		expect(toolbar.find('#logout').text().trim()).toBe('label.logout');

		expect(toolbar.find('#login').hasClass('ng-hide')).toBe(true);
		expect(toolbar.find('#login').text().trim()).toBe('label.login');
	});


	it('should call logout when the logout button is clicked', function () {
		spyOn(scope, 'logout');
		toolbar.find('#logout').click();
		expect(scope.logout).toHaveBeenCalled();

		expect(toolbar.find('#login').hasClass('ng-hide')).toBe(false);
		expect(toolbar.find('#login').text().trim()).toBe('label.login');

		expect(toolbar.find('.auth-user').hasClass('ng-hide')).toBe(true);
		expect(toolbar.find('.auth-user').text().trim()).toBe('');

		expect(toolbar.find('#logout').hasClass('ng-hide')).toBe(true);
		expect(toolbar.find('#logout').text().trim()).toBe('label.logout');
	});


	it('should call login when the login button is clicked', function () {
		spyOn(scope, 'login');
		toolbar.find('#login').click();
		expect(scope.login).toHaveBeenCalled();
	});
});
