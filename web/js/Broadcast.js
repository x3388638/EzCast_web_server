var Broadcast = (_ => {
	/**
	 * cache DOM
	 */
	var $broadcastInput = $('#input-broadcast');
	
	/**
	 * init
	 */
	var _socket = App.getSocket();

	/**
	 * bind eevnt
	 */
	$broadcastInput.on('keypress', _handleKeypress);
	
	function _handleKeypress(e) {
		if (e.keyCode == 13) {
			var msg = $broadcastInput.val();
			msg != '' && _sendBroadcast(msg);
		}
	}

	function _sendBroadcast(msg) {
		_socket.emit('broadcast', msg + '');
		$broadcastInput.val('');
	}

})();
