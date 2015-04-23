describe('retryQueue', function() {
	var queue;

	function mockRetryItem() {
		return jasmine.createSpyObj('retryItem', ['retry', 'cancel']);
	}

	beforeEach(module('jnxSecurity'));

	beforeEach(inject(function($injector) {
		queue = $injector.get('retryQueue');
	}));

	describe('hasMore', function() {
		it('initially has no items to retry', function() {
			expect(queue.hasMore).toBeDefined();
			expect(queue.hasMore()).toBe(false);
		});

		it('has more items once one has been pushed', function() {
			queue.push(mockRetryItem());
			expect(queue.hasMore()).toBe(true);
		});
	});

	describe('retryReason', function() {
		it('returns undefined if there are no items on the queue', function() {
			expect(queue.retryReason()).not.toBeDefined();
		});
	});

	describe('pushRetryFn', function() {

		it('adds a new item to the queue', function() {
			queue.pushRetryFn(function() {});
			expect(queue.hasMore()).toBe(true);
			expect(queue.retryReason()).not.toBeDefined();
		});

		it('adds a reason to the retry', function() {
			var reason = 'SOME_REASON';
			queue.pushRetryFn(reason, function() {});
			expect(queue.retryReason()).toBe(reason);
		});

		it('adds an empty reason to the retry if not specified', function() {
			queue.pushRetryFn(function() {});
			expect(queue.retryReason()).not.toBeDefined();
		});
	});

	describe('retryAll', function() {

		it('should be a no-op if the queue is empty', function(){
			// queue.retryAll(function(item) {});
			queue.retryAll();
		});

		it('should empty the queue', function() {
			queue.pushRetryFn(function(){ return 0;});
			queue.pushRetryFn(function(){ return 1;});
			queue.pushRetryFn(function(){ return 2;});
			expect(queue.hasMore()).toBe(true);
			queue.retryAll();
			expect(queue.hasMore()).toBe(false);
		});

		//
		// pp-TODO-2014-12-11: queue.push should probably be a private method
		//
		it('should empty a queue of mocks, call the "retry" function, and not call the "cancel" function', function() {
			var ops = [mockRetryItem(), mockRetryItem(), mockRetryItem()];

			ops.forEach( function(op) {
				queue.push(op);
			});

			expect(queue.hasMore()).toBe(true);

			ops.forEach( function(op) {
				expect(op.retry).not.toHaveBeenCalled();
				expect(op.cancel).not.toHaveBeenCalled();
			});

			queue.retryAll();

			ops.forEach( function(op) {
				expect(op.retry).toHaveBeenCalled();
				expect(op.cancel).not.toHaveBeenCalled();
			});

			expect(queue.hasMore()).toBe(false);
		});
	});
	
});
