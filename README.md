fullstack_bp
============

A fullstack boilerplate using Express 4, MongoDB, AngularJS, and JWT Auth


TODO:
* User management
  - ~~Create User~~
  - ~~Remove User~~
  - Edit User (reset password, change name, etc..)
  - Lock account
* User Groups
* Login
  - Password Reset
* Signup
  - Confirm email
* User Profile
  - Change password
  - Edit name
  - Change email
  - Account Picture

BLING:
  * User panel directives (animate delete and add)
  * Confirm dialog when removing user
  * List view for users
  * Paging
  * Account security (repeat lockout, ip record, etc)

THOUGHTS:
* To disable a user account, we should move the document to a 'disabled' collection.
* Accounts accessing PII should have a verified IP address. To verify an IP the user should enter a time sensitive token
delivered via email.
* All Administrators and superusers must provide a google authenticator key to elevate into the role.  
