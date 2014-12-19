fullstack_bp
============

A fullstack boilerplate using Express 4, MongoDB, AngularJS, and JWT Auth


TODO:
* Signup
  - Confirm email
* User Profile
  - Change password
  - Edit name
  - Change email
  - Account Picture
* Accounts originating from a strange IP should need to verify by entering a time sensitive token
delivered via email.
* All Administrators and superusers must provide a google authenticator key to elevate into the role.  
* Implement Fail2Ban

BLING:
  * User panel directives (animate delete and add)
  * Confirm dialog when removing user
  * List view for users
  * Paging
  * Account security (repeat lockout, ip record, etc)