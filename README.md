# Questionable Quotes

Ever had these weird conversations? Those conversations where you could pick lines from and use them out of context to create even weirder conversations? You should.

But you probably have quotes and quotes can be used for the greater good. Just for laughter, of course 😉.

This repo provides you with a full API and web interface to show those quotes, one by one, and have people up-/downvote them.

## Requirements

The API requires NodeJS v4+ and uses MongoDB for storage.

## Config

The API requires a config file in the `./config` directory which looks like this:

```
{
	"name": "questionablequot.es",
	"manifest": {
		"server": {
			"app": {
				"slogan": "Questionable Quotes"
			}
		},
		"connection": {
			"port": 1337,
			"labels": ["any", "label", "you", "like"]
		}
	},
	"api": {
		"version": "v1"
	},
	"database": {
		"dsn": "mongodb://<user>:<password>@localhost/<database>"
	},
	"mail": {
		"user": "<user>",
		"password": "<password>",
		"host": "<host>",
		"validator": "<validator for emailaddresses which are allowed to request invites>"
	}
}
```
