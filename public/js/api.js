;(function(window) {
	'use strict';

	function API() {
		var api = this;

		function fetch(config, callback) {
			var xhr = new XMLHttpRequest();

			xhr.onload = callback;
			xhr.open(config.type, config.url, true);
			xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
			xhr.send(config.data ? JSON.stringify(config.data) : '');

			return xhr;
		}

		function method(type) {
			return function(config, callback) {
				if (typeof config === 'string') {
					config = {
						url: config
					};
				}

				if (!('type' in config)) {
					config.type = type;
				}

				fetch(config, callback);
			};
		}

		api.get = method('GET');
		api.post = method('POST');
	}

	window.API = new API();
})(window);
