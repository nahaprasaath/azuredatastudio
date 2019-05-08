/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// This code is originally from https://github.com/Microsoft/vscode/blob/master/src/vs/base/test/node/port.test.ts

'use strict';

import * as assert from 'assert';
import * as net from 'net';
import 'mocha';

import * as ports from '../../common/ports';

describe('Ports', () => {
	it('Should Find a free port (no timeout)', function (done): void {
		this.timeout(1000 * 10); // higher timeout for this test

		// get an initial freeport >= 7000
		ports.findFreePort(7000, 100, 300000).then(initialPort => {
			assert.ok(initialPort >= 7000);

			// create a server to block this port
			const server = net.createServer();
			server.listen(initialPort, undefined, undefined, () => {

				// once listening, find another free port and assert that the port is different from the opened one
				ports.findFreePort(7000, 50, 300000).then(freePort => {
					assert.ok(freePort >= 7000 && freePort !== initialPort);
					server.close();

					done();
				}, err => done(err));
			});
		}, err => done(err));
	});

	it('Should Find a free port in strict mode', function (done): void {
		this.timeout(1000 * 10); // higher timeout for this test

		// get an initial freeport >= 7000
		let options = new ports.StrictPortFindOptions(7000, 7200);
		options.timeout = 300000;
		ports.strictFindFreePort(options).then(initialPort => {
			assert.ok(initialPort >= 7000);

			// create a server to block this port
			const server = net.createServer();
			server.listen(initialPort, undefined, undefined, () => {

				// once listening, find another free port and assert that the port is different from the opened one
				options.minPort = initialPort;
				options.maxRetriesPerStartPort = 1;
				options.totalRetryLoops = 50;
				ports.strictFindFreePort(options).then(freePort => {
					assert(freePort >= 7100, `Expected freePort to be >= 7100, Actual: ${freePort}`);
					assert(freePort !== initialPort, `Expected freePort to be not equal to initialPort, Actual: ${freePort}`);
					server.close();

					done();
				}, err => done(err));
			});
		}, err => done(err));
	});
});

