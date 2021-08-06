let connectedUsers = [];

exports.addConnectedUser = (user) => {
  connectedUsers.push(user);
  console.log(connectedUsers);
};

exports.removeConnectedUser = (socketId) => {
  connectedUsers = connectedUsers.filter((user) => user.socketId !== socketId);
  console.log(connectedUsers);
};

exports.getConnectedUserBySocketId = (id) => {
  return connectedUsers.find((user) => user.socketId === id);
};

exports.getConnectedUserByUserId = (id) => {
  return connectedUsers.find((user) => user.userId === id);
};

exports.getConnectedUsers = () => {
  return connectedUsers;
};
