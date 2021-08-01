let connectedUsers = [];

exports.addConnectedUser = (user) => {
  connectedUsers.push(user);
  console.log(connectedUsers);
};

exports.removeConnectedUser = (socketId) => {
  connectedUsers = connectedUsers.filter((user) => user.socketId !== socketId);
  console.log(connectedUsers);
};
