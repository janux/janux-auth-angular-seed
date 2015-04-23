describe('$jnxAuth', function() {

	var $rootScope, security, $jnxAuth, queue;

	var userResponse, resolved;

	beforeEach(module(
		'cachedTemplates',
		'pascalprecht.translate',
		'jnxSecurity'
	));

	beforeEach(inject(function($injector) {

		$rootScope     = $injector.get('$rootScope');
		$jnxAuth = $injector.get('$jnxAuth');
		security       = $injector.get('security');
		queue          = $injector.get('retryQueue');
		
		userResponse = { 
			user: { 
				oid:       '1234567890', 
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
			}
		};

		resolved = false;

		spyOn(security, 'requestCurrentUser').and.callFake(function() {
			security.currentUser = security.currentUser || userResponse.user;
			var promise = $injector.get('$q').when(security.currentUser);
			// Trigger a digest to resolve the promise;
			return promise;
		});

	}));


	describe('requireAuthenticatedUser', function() {

		it('makes a GET request to current-user url', function() {
			expect(security.isAuthenticated()).toBe(false);
			$jnxAuth.requireAuthenticatedUser().then(function(data) {
				resolved = true;
				expect(security.isAuthenticated()).toBe(true);
				expect(security.currentUser).toBe(userResponse.user);
			});
			$rootScope.$digest();
			expect(resolved).toBe(true);
		});

		it('adds a new item to the retry queue if not authenticated', function () {
			var resolved = false;
			userResponse.user = null;
			expect(queue.hasMore()).toBe(false);
			$jnxAuth.requireAuthenticatedUser().then(function() {
				resolved = true;
			});

			$rootScope.$digest();
			expect(security.isAuthenticated()).toBe(false);
			expect(queue.hasMore()).toBe(true);
			expect(queue.retryReason()).toBe('unauthenticated-client');
			expect(resolved).toBe(false);
		});
	});
});
