#!/usr/bin/env node

var net = require('net'),
	ranges = process.argv.slice(2),
	callback = {
		connection: function (socket) {
			socket.setEncoding('utf8');
			socket.on('data', callback.data.bind(socket));
		},
		listening: function () {
			var host = this.address();
			// console.log('listening on %s:%s', host.address, host.port);
		},
		error: function (error) {
			console.log('Error: %s on port %s', error.code, this.port);
		},
		data: function (data) {
			console.log('Port %s: %s', this.address().port, data);
		}
	},
	parseRange = function (range) {
		var format = /(\d+)(?:-(\d+))?/, // "n-m" or just "n"
			matches = range.trim().match(format),
			min = +matches[1],
			max = +matches[2] || (+matches[2] !== 0 && min),
			valid = !isNaN(min) && !isNaN(max) && max >= min;
		if (!valid) console.log('Warning: Invalid input: %s', range);
		return valid ? { min: min, count : max - min } : range;
	},
	listenOnRange = function (ports) {
		console.log('Setting up listeners %s-%s ...', ports.min, ports.min + ports.count);
		for (var i = ports.min; i < ports.min + ports.count; i++) {
			var server = net.createServer();
			server.on('error', callback.error.bind({ port: i }));
			server.on('connection', callback.connection.bind(server));
			server.listen(i, callback.listening.bind(server));
		}
	};

ranges
	.map(parseRange)
	.filter(function (range) { return typeof range !== 'string'; })
	.forEach(listenOnRange);
