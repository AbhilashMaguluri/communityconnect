exports.registerUser = (req, res) => {
  res.json({ success: true, message: 'User registered (demo)' });
};

exports.loginUser = (req, res) => {
  res.json({ success: true, message: 'User logged in (demo)', token: 'demo-token' });
};

exports.getMe = (req, res) => {
  res.json({ success: true, user: { email: req.user.email } });
};

exports.updateProfile = (req, res) => {
  res.json({ success: true, message: 'Profile updated (demo)' });
};

exports.changePassword = (req, res) => {
  res.json({ success: true, message: 'Password changed (demo)' });
};

exports.deactivateAccount = (req, res) => {
  res.json({ success: true, message: 'Account deactivated (demo)' });
};
