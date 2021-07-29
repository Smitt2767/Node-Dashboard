let users = [];

exports.addUser = ({ username, id }) => {
  users.push({ username, id });
};

exports.getUsers = (id) => {
  return users;
};

exports.getUserById = (id) => {
  return users.find((user) => user.id === id);
};

exports.removeUser = (id) => {
  users = users.filter((user) => user.id !== id);
};
