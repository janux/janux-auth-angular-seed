describe('security', function() {

	var $rootScope, $http, $httpBackend, status, userInfo;

	function assertUser(user) {
		expect(user.person).toEqual(userInfo.person);
		expect(user.account.name).toEqual(userInfo.account.name);
		expect(user.account.roles.length).toEqual(1);
		expect(user.account.roles[0].can('READ','WIDGET')).toEqual(true);
		expect(user.account.roles[0].can('CREATE','EQUIPMENT')).toEqual(false);
	};
	
	// The cachedTemplates module is created in karma.conf.js 
	// via the ngHtml2JsPreprocessor, and caches all html templates 
	// in the angular $templateCache
	beforeEach(module(
		'cachedTemplates',
		'pascalprecht.translate',
		'jnxSecurity' 
	));

	beforeEach(inject(function(_$rootScope_, _$httpBackend_, _$http_) {
		$rootScope   = _$rootScope_;
		$httpBackend = _$httpBackend_;
		$http        = _$http_;

		userInfo = {
			'oid': 'e90597ae-6450-49f5-8b72-3c0b1a6e8c4f',
			'person': {
				'name': {
					'first': 'Chase',
					'last': 'Widgeter'
				}
			},
			'account': {
				'name': 'widgeter',
				'passwordExpiresOn': '',
				'expiresOn': '',
				'roles': [
					{
						'name': 'WIDGET_DESIGNER',
						'description': 'A Widget Designer',
						'sortOrder': 0,
						'isEnabled': true,
						'typeName': 'janux.security.Role',
						'permissions': {
							'WIDGET': {
								'grant': 15
							},
							'EQUIPMENT': {
								'grant': 3
							}
						},
						'permissionContexts': [
							{
								'name': 'WIDGET',
								'bit': {
									'READ': {
										'position': 0
									},
									'UPDATE': {
										'position': 1
									},
									'CREATE': {
										'position': 2
									},
									'DELETE': {
										'position': 3
									},
									'PURGE': {
										'position': 4
									}
								}
							},
							{
								'name': 'EQUIPMENT',
								'bit': {
									'READ': {
										'position': 0
									},
									'UPDATE': {
										'position': 1
									},
									'CREATE': {
										'position': 2
									},
									'DELETE': {
										'position': 3
									},
									'PURGE': {
										'position': 4
									}
								}
							}
						]
					}
				]
			}
		};

		$httpBackend.when('GET', '/current-user').respond(200, { user: userInfo });
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	var service, queue;

	beforeEach(inject(function($injector) {
		service = $injector.get('security');
		queue   = $injector.get('retryQueue');
	}));


	describe('showLogin', function() {
		it("should open the dialog", function() {
			service.showLogin();
			$rootScope.$digest();
			expect(angular.element('.login-form').length).toBeGreaterThan(0);
		});
	});


	describe('login', function() {

		it('sends an http request to login the specified user', function() {
			var user;
			$httpBackend.when('POST', '/login').respond(200, { user: userInfo });
			$httpBackend.expect('POST', '/login');
			service.login('widgeter', 'password');
			$httpBackend.flush();
			assertUser(service.currentUser);
		});

		it('calls queue.retry on a successful login', function() {
			$httpBackend.when('POST', '/login').respond(200, { user: userInfo });
			spyOn(queue, 'retryAll');
			service.showLogin();
			service.login('widgeter', 'password');
			$httpBackend.flush();
			$rootScope.$digest();
			expect(queue.retryAll).toHaveBeenCalled();
			assertUser(service.currentUser);
		});

		it('does not call queue.retryAll after a login failure', function() {
			$httpBackend.when('POST', '/login').respond(200, { user: null });
			spyOn(queue, 'retryAll');
			expect(queue.retryAll).not.toHaveBeenCalled();
			service.login('username', 'password');
			$httpBackend.flush();
			expect(queue.retryAll).not.toHaveBeenCalled();
		});

		it('returns true to success handlers if the user authenticated', function() {
			$httpBackend.when('POST', '/login').respond(200, { user: userInfo });
			service.login('widgeter', 'password').then(function(loggedIn) {
				expect(loggedIn).toBe(true);
			});
			$httpBackend.flush();
		});

		it('returns false to success handlers if the user was not authenticated', function() {
			$httpBackend.when('POST', '/login').respond(200, { user: undefined });
			service.login('username', 'password').then(function(loggedIn) {
				expect(loggedIn).toBe(false);
			});
			$httpBackend.flush();
		});
	});


	describe('logout', function() {

		beforeEach(function() {
			$httpBackend.when('POST', '/logout').respond(200, {});
		});

		it('sends a http post to clear the current logged in user', function() {
			$httpBackend.expect('POST', '/logout');
			service.logout();
			$httpBackend.flush();
		});

		it('logout redirects to /goodbye by default', function() {
			inject(function($location) {
				spyOn($location, 'path');
				service.logout();
				$httpBackend.flush();
				expect($location.path).toHaveBeenCalledWith('/goodbye');
			});
		});

		it('redirects to the path specified in the first parameter', function() {
			inject(function($location) {
				spyOn($location, 'path');
				service.logout('/other/path');
				$httpBackend.flush();
				expect($location.path).toHaveBeenCalledWith('/other/path');
			});
		});
	});


	describe("currentUser", function() {

		it("should be unauthenticated to begin with", function() {
			expect(service.isAuthenticated()).toBe(false);
			// expect(service.isAdmin()).toBe(false);
			expect(service.currentUser).toBe(null);
		});

		it("should be authenticated if we update with user info", function() {
			var userInfo = {};
			service.currentUser = userInfo;
			expect(service.isAuthenticated()).toBe(true);
			// expect(service.isAdmin()).toBe(false);
			expect(service.currentUser).toEqual(userInfo);
		});

		/*
		it("should be admin if we update with admin user info", function() {
			var userInfo = { admin: true };
			service.currentUser = userInfo;
			expect(service.isAuthenticated()).toBe(true);
			expect(service.isAdmin()).toBe(true);
			expect(service.currentUser).toEqual(userInfo);
		});
		*/

		it("should not be authenticated or admin if we clear the user", function() {
			// var userInfo = { admin: true };
			service.currentUser = userInfo;
			expect(service.isAuthenticated()).toBe(true);
			// expect(service.isAdmin()).toBe(true);
			// expect(service.currentUser).toEqual(userInfo);

			service.currentUser = null;
			expect(service.isAuthenticated()).toBe(false);
			// expect(service.isAdmin()).toBe(false);
			expect(service.currentUser).toBe(null);
		});

	});


	describe('requestCurrentUser', function() {

		it('makes a GET request to current-user url', function() {
			expect(service.isAuthenticated()).toBe(false);
			$httpBackend.expect('GET', '/current-user');
			service.requestCurrentUser().then(function(data) {
				resolved = true;
				expect(service.isAuthenticated()).toBe(true);
				assertUser(service.currentUser);
			});
			$httpBackend.flush();
			expect(resolved).toBe(true);
		});

		it('returns the current user immediately if they are already authenticated', function() {
			userInfo = {};
			service.currentUser = userInfo;
			expect(service.isAuthenticated()).toBe(true);
			service.requestCurrentUser().then(function(data) {
				resolved = true;
				expect(service.currentUser).toEqual(userInfo);
			});
			expect(resolved).toBe(true);
		});

	});

});
