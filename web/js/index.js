var App = (_ => {
	
	/**
	 * init
	 */
	var _socket = io();

	/**
	 * ws event
	 */
	_socket.on('disconnect', function () {
		console.error('ws disconnect');
	});

	function getSocket() {
		return _socket;
	}

	return {
		getSocket
	}
	
})();
