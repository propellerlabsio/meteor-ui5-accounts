/**
 * @file package.js
 * @copyright PropellerLabs.com 2016
 * @license Apache-2.0
 *
 * @namespace meteor-ui5-accounts
 * @description This is a Meteor package for using UI5 with the Meteor Accounts system.
 * It provides drop-in UI controls to manage logging in, sign out and other user accounts
 * functions.
 */

/* globals Package */

Package.describe({
  name: 'propellerlabsio:meteor-ui5-accounts',
  version: '0.0.2',
  summary: 'UI5 with Meteor Accounts system',
  git: 'https://github.com/propellerlabsio/meteor-ui5-accounts',
  documentation: 'README.md'
});

Package.onUse((api) => {
  api.versionsFrom('1.4.1.1');
  api.use('ecmascript');
  api.use('accounts-password');

  // Add our UI5 files. Note OpenUI5 requires these files to be
  // served as is with none of meteor's processing which is why we use the bare and
  // isAsset options.
  api.addFiles([
    'control/NotSignedInPopover.fragment.xml',
    'control/ShellHeadUserItem.js',
    'control/ShellHeadUserItem-dbg.js',
    'control/ShellHeadUserItem.js.map',
    'control/SignedInActionSheet.fragment.xml'
  ], 'client', {
    bare: true,
    isAsset: true // Allows clients to reference model by <resourcepath>.control.ShellHeadUserItem
  });
});
