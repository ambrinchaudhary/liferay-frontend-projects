/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const deepMerge = require('./deepMerge');
const findRoot = require('./findRoot');
const getDXPVersion = require('./getDXPVersion');
const getUserConfig = require('./getUserConfig');

/**
 * Pluck a specific property, `property`, from the configuration object,
 * `config`.
 *
 * If no property is specified, returns the entire object.
 */
function pluck(config, property) {
	if (!property) {
		return config;
	}

	if (!Object.hasOwnProperty.call(config, property)) {
		const keys = JSON.stringify(Object.keys(config));
		const missing = JSON.stringify(property);
		throw new Error(
			`getMergedConfig(): property ${missing} is missing from configuration (existing keys are: ${keys})`
		);
	}

	return config[property];
}

function isObject(maybeObject) {
	return (
		maybeObject &&
		Object.prototype.toString.call(maybeObject) === '[object Object]'
	);
}

/**
 * Returns a deep copy of `object`, with any instance of `property`
 * transformed using the `callback` (which should accept the value of
 * the property and return the new value).
 */
function filter(object, property, callback) {
	if (Array.isArray(object)) {
		return object.map((item) => filter(item, property, callback));
	} else if (isObject(object)) {
		return Object.entries(object).reduce((acc, [key, value]) => {
			return {
				...acc,
				[key]:
					key === property
						? callback(value)
						: filter(value, property, callback),
			};
		}, {});
	} else {
		return object;
	}
}

/**
 * We want to use @babel-preset/react as a default, but some projects use
 * babel-plugin-incremental-dom, and we cannot turn off the preset
 * without this hack; see:
 *
 *  - https://github.com/babel/babel/issues/3016
 *  - https://babeljs.io/docs/en/babel-preset-env/#exclude
 */
function hackilySupportIncrementalDOM(config) {
	const {liferay, ...rest} = config;

	const excludes = (liferay && liferay.excludes) || {};

	return Object.entries(excludes).reduce((acc, [property, values]) => {
		return filter(acc, property, (value) => {
			if (Array.isArray(value)) {
				return value.filter((v) => !values.includes(v));
			} else {
				return value;
			}
		});
	}, rest);
}

/**
 * Normalize npmscripts configuration so that the fields only contain canonical
 * values.
 */
function normalizeNpmscriptsConfig(config) {
	const {federation} = config;

	if (federation) {
		if (federation.bridges === true) {
			federation.bridges = [];
		}

		if (federation.mode === undefined) {
			federation.mode = 'default';
		}

		if (!['default', 'compatible', 'disabled'].includes(federation.mode)) {
			throw new Error('Invalid federation mode: ' + federation.mode);
		}
	}

	return config;
}

/**
 * Helper to get JSON configs
 * @param {string} type Name of configuration ("babel", "bundler", "jest" etc)
 * @param {string=} property Specific configuration property to extract. If not
 * supplied, the entire configuration object is returned.
 */
function getMergedConfig(type, property) {
	let mergedConfig;

	switch (type) {
		case 'babel':
			{
				const {major, minor} = getDXPVersion() || {};

				const baseConfig =
					major === undefined ||
					major > 7 ||
					(major === 7 && minor > 3)
						? require('../config/babel')
						: require('../config/babel-legacy');

				mergedConfig = deepMerge(
					[baseConfig, getUserConfig('babel')],
					deepMerge.MODE.BABEL
				);

				// (Temporary) special case required by:
				//
				// https://github.com/liferay/liferay-npm-tools/issues/303
				//
				// TODO: Remove once incremental-dom is no longer used in
				// liferay-portal.

				mergedConfig = hackilySupportIncrementalDOM(mergedConfig);
			}
			break;

		case 'bundler': {
			const {bundler: bundlerDefaults} = getMergedConfig(
				'npmscripts',
				'build'
			);
			const userConfig = getUserConfig('npmbundler');

			if (userConfig.preset !== undefined) {
				mergedConfig = userConfig;
			} else {
				mergedConfig = deepMerge([bundlerDefaults, userConfig]);
			}
			break;
		}

		case 'eslint':
			mergedConfig = deepMerge([
				require('../config/eslint.config'),
				getUserConfig('eslint'),
			]);
			break;

		case 'jest':
			mergedConfig = deepMerge([
				require('../config/jest.config'),
				require('../utils/getJestModuleNameMapper')(),
				getUserConfig('jest'),
			]);
			break;

		case 'prettier':
			mergedConfig = deepMerge([
				require('../config/prettier'),
				getUserConfig('prettier', {upwards: true}),
			]);
			break;

		case 'npmscripts': {
			const rootDir = findRoot();

			let rootConfig = {};

			if (rootDir) {
				try {
					rootConfig = require(path.join(
						rootDir,
						'npmscripts.config.js'
					));
				} catch (err) {
					if (err.code !== 'MODULE_NOT_FOUND') {
						throw err;
					}
				}
			}

			if (process.cwd() === rootDir) {
				mergedConfig = deepMerge([
					require('../config/npmscripts.config.js'),
					rootConfig.global || {},
				]);
			} else {
				mergedConfig = deepMerge([
					require('../config/npmscripts.config.js'),
					rootConfig,
					getUserConfig('npmscripts'),
				]);
			}

			mergedConfig = normalizeNpmscriptsConfig(mergedConfig);
			break;
		}

		case 'stylelint':
			mergedConfig = deepMerge([
				require('../config/stylelint'),
				getUserConfig('stylelint'),
			]);
			break;

		case 'terser':
			mergedConfig = deepMerge([
				require('../config/terser.config'),
				getUserConfig('terser'),
			]);
			break;

		default:
			throw new Error(`'${type}' is not a valid config`);
	}

	return pluck(mergedConfig, property);
}

module.exports = getMergedConfig;
