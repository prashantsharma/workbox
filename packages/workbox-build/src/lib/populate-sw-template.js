/*
  Copyright 2017 Google Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const template = require('lodash.template');
const swTemplate = require('../templates/sw-template');

const errors = require('./errors');
const runtimeCachingConverter = require('./runtime-caching-converter');

module.exports = ({
  cacheId,
  clientsClaim,
  directoryIndex,
  ignoreUrlParametersMatching,
  importScripts,
  manifestEntries,
  modulePathPrefix,
  navigateFallback,
  navigateFallbackBlacklist,
  navigateFallbackWhitelist,
  runtimeCaching,
  skipWaiting,
}) => {
  // These are all options that can be passed to the precacheAndRoute() method.
  const precacheOptions = {
    directoryIndex,
    // An array of RegExp objects can't be serialized by JSON.stringify()'s
    // default behavior, so if it's given, convert it manually.
    ignoreUrlParametersMatching: ignoreUrlParametersMatching ?
      [] :
      undefined,
  };

  let precacheOptionsString = JSON.stringify(precacheOptions, null, 2);
  if (ignoreUrlParametersMatching) {
    precacheOptionsString = precacheOptionsString.replace(
      `"ignoreUrlParametersMatching": []`,
      `"ignoreUrlParametersMatching": [` +
      `${ignoreUrlParametersMatching.join(', ')}]`
    );
  }

  try {
    const populatedTemplate = template(swTemplate)({
      cacheId,
      clientsClaim,
      importScripts,
      manifestEntries,
      modulePathPrefix,
      navigateFallback,
      navigateFallbackBlacklist,
      navigateFallbackWhitelist,
      precacheOptionsString,
      skipWaiting,
      runtimeCaching: runtimeCachingConverter(runtimeCaching),
    });

    // Clean up multiple blank lines.
    return populatedTemplate.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  } catch (error) {
    throw new Error(
      `${errors['populating-sw-tmpl-failed']} '${error.message}'`);
  }
};
