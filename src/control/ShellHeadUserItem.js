/**
 * Custom user sign-in/sign-out control for the Unified Shell
 *
 * Note: we have to use inheritance here rather than the recommended composition because
 * the unified shell insists on this control being of type sap.ui.unified.ShellHeadUserItem
 *
 */

/* globals sap, Meteor, Accounts, _, Tracker*/
sap.ui.define([
  'sap/ui/unified/ShellHeadUserItem',
  'sap/m/MessageBox'
],
  function (ShellHeadUserItem, MessageBox) { // eslint-disable-line 

    const control = ShellHeadUserItem.extend('meteor-ui5-accounts.control.ShellHeadUserItem', {

      constructor() {
        // Ignore standard ShellHeadUserItem constructor arguments for properties that we
        // will control
        delete arguments.username;

        // Call super
        ShellHeadUserItem.apply(this, arguments); // eslint-disable-line prefer-rest-params

        // Use tracker autorun to make changes to user reactive
        const that = this;
        this._observeChanges = Tracker.autorun(function () { // eslint-disable-line
          // Observe user for selected labels property
          that._user = Meteor.user();
          let displayName = '';
          if (that._user) {
            // Build user name for display in user button
            const firstName = _.get(that._user, 'profile.firstName', '');
            const lastName = _.get(that._user, 'profile.lastName', '');
            if (firstName || lastName) {
              displayName = `${firstName} ${lastName}`;
            } else {
              displayName = _.get(that._user, 'emails[0].address', '');
            }
          } else {
            displayName = 'Sign-in / Join';
          }
          ShellHeadUserItem.prototype.setUsername.apply(that, [displayName]);
        });

        // Callback on press
        this.attachPress(function () {
          if (this._user) {
            this._toggleSignedInActionSheet();
          } else {
            this._toggleNotSignedInPopover();
          }
        });
      }

    });

    control.prototype.exit = function () {
      // Kill tracker autorun on control destruction
      this._observeChanges.stop();
    };

    control.prototype._toggleSignedInActionSheet = function () {
      // create popover only once
      if (!this._signedInActionSheet) {
        this._signedInActionSheet = sap.ui.xmlfragment(
          'meteor-ui5-accounts.control.SignedInActionSheet',
          this
        );
        this.addDependent(this._signedInActionSheet);
      }

      // Toggle open/close
      this._togglePopover(this._signedInActionSheet);
    };

    control.prototype.handleForgotPassword = function () {
      MessageBox.alert('Sorry. Automated password reset has not be implemented yet.');
    };

    control.prototype._toggleNotSignedInPopover = function () {
      // create popover only once
      if (!this._notSignedInPopover) {
        this._notSignedInPopover = sap.ui.xmlfragment(
          'meteor-ui5-accounts.control.NotSignedInPopover',
          this
        );
        this.addDependent(this._notSignedInPopover);
      }

      // Toggle open/close
      this._togglePopover(this._notSignedInPopover);
    };

    control.prototype._togglePopover = function (oPopover) {
      if (oPopover.isOpen()) {
        oPopover.close();
      } else {
        oPopover.openBy(this);
      }
    };

    control.prototype.handleSignout = function () {
      Meteor.logout();
      this._signedInActionSheet.close();
    };

    control.prototype.handleSignin = function () {
      // Set busy and clear messages
      const oCore = sap.ui.getCore();
      const oPopover = this._notSignedInPopover;
      oPopover.setBusy(true);
      const oMessageStrip = oCore.byId('accountsMessage');
      oMessageStrip.setVisible(false);

      // Get input values
      const input = this._getInputValues();

      // Attempt login
      Meteor.loginWithPassword(input.email, input.password, (oError) => {
        oPopover.setBusy(false);
        if (oError) {
          oMessageStrip.setVisible(true);
          oMessageStrip.setType('Error');
          oMessageStrip.setText(oError);
        } else {
          oMessageStrip.setVisible(false);
          oPopover.close();
        }
      });
    };

    control.prototype.handleCreateAccount = function () {
      // Set busy and clear messages
      const oCore = sap.ui.getCore();
      const oPopover = this._notSignedInPopover;
      oPopover.setBusy(true);
      const oMessageStrip = oCore.byId('accountsMessage');
      oMessageStrip.setVisible(false);

      // Get input values
      const input = this._getInputValues();

      // Attempt to create user
      Accounts.createUser({ email: input.email, password: input.password }, (oError) => {
        oPopover.setBusy(false);
        if (oError) {
          oMessageStrip.setVisible(true);
          oMessageStrip.setType('Error');
          oMessageStrip.setText(oError);
        } else {
          oMessageStrip.setVisible(false);
          oPopover.close();
        }
      });
    };

    control.prototype._getInputValues = function () {
      const oCore = sap.ui.getCore();
      const oInputEmail = oCore.byId('inputEmail');
      const oInputPassword = oCore.byId('inputPassword');
      return {
        email: oInputEmail.getValue(),
        password: oInputPassword.getValue()
      };
    };

    return control;
  });
