/* global API */
;(function() {
	'use strict';

	var nonce = window.location.search.match(/nonce=([a-z0-9]+)&?/i);

	window.addEventListener('DOMContentLoaded', function() {
		API.post(
			{
				url: '/api/v1/authorize/activate',
				data: {
					nonce: nonce[1]
				}
			},
			function() {
				var node = document.querySelector('section');

				if (this.status === 200) {
					localStorage.setItem('qq:token', nonce[1]);
					window.location.href = '/';

					return;
				}

				if (this.status === 400) {
					return node.setAttribute('data-error', this.responseText);
				}
			}
		);
	});
})();
