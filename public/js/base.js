/* global API */
;(function() {
	'use strict';

	var get = function get(item) {
			return localStorage.getItem('qq:' + item);
		},

		set = function set(item, value) {
			return localStorage.setItem('qq:' + item, value);
		},

		each = function(selector, callback) {
			Array.prototype.forEach.call(document.querySelectorAll(selector), callback);
		},

		enable = function enable() {
			each('button', function(node) {
				node.removeAttribute('disabled');
			});
		},

		disable = function disable() {
			each('button', function(node) {
				node.setAttribute('disabled', 'disabled');
			});
		},

		quote = function quote(text, author, id) {
			quoteNode.setAttribute('data-quote', text);
			authorNode.setAttribute('data-author', author || 'QQ');

			if (id) {
				set('quote', id);
			}
		},

		endpoint = '/api/v1/quote',
		token = get('token'),

		authorNode, quoteNode, form;

	function getRandom(callback) {
		API.get(endpoint + '/random?token=' + token, function() {
			var json;

			if (this.status === 200) {
				json = JSON.parse(this.responseText);

				authorNode.style.display = 'none';

				quote(json.body, json.author, json.id);
				enable();

				return typeof callback === 'function' ? callback() : true;
			}

			if (this.status === 401) {
				document.querySelector('[data-view=quote]').style.display = 'none';
				document.querySelector('[data-view=authorize]').style.display = 'block';
			}

			if (this.status === 404) {
				authorNode.style.display = 'block';
				quote('No Quote Available', 'QQ');
			}
		});
	}

	function vote(say) {
		API.post({
				url: endpoint + '/vote',
				data: {
					quote: get('quote'),
					token: token,
					vote: say
				}
			},
			function() {
				setTimeout(function() {
					getRandom();
				}, 2000);
			}
		);
	}

	window.addEventListener('DOMContentLoaded', function() {
		authorNode = document.querySelector('[data-author]');
		quoteNode = document.querySelector('[data-quote]');
		form = document.querySelector('form');

		if (form) {
			getRandom(function() {
				each('button', function(node) {
					node.style.display = 'inline-block';
					node.addEventListener('click', function() {
						disable();
						authorNode.style.display = 'block';
						vote(this.getAttribute('data-vote'));
					});
				});
			});

			form.addEventListener('submit', function(event) {
				var email = document.querySelector('[name=email]').value,
					form = this;

				form.removeAttribute('data-error');
				event.preventDefault();

				API.post(
					{
						url: '/api/v1/authorize/invite',
						data: {
							email: email
						}
					},
					function() {
						if (this.status === 200) {
							return form.parentNode.replaceChild(document.createTextNode('Email has been send'), form);
						}

						if (this.status === 400) {
							return form.setAttribute('data-error', this.responseText);
						}

						if (this.status === 409) {
							return form.setAttribute('data-error', 'Emailaddress already in use');
						}
					}
				);
			});
		}
	});
})();
