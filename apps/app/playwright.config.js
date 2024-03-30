"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
require("dotenv/config");
require("./src/env");
var PORT = process.env.PORT;
exports.default = (0, test_1.defineConfig)({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        locale: 'en-US',
        timezoneId: 'Europe/Vilnius',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
    projects: [
        { name: 'setup', testMatch: /.*\.setup\.ts/ },
        {
            name: 'chromium',
            use: __assign(__assign({}, test_1.devices['Desktop Chrome']), { storageState: 'mnt/auth.json' }),
            dependencies: ['setup'],
        },
    ],
    webServer: {
        command: 'bun start',
        url: "http://localhost:".concat(PORT, "/healthcheck"),
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
            PORT: PORT,
        },
    },
});
