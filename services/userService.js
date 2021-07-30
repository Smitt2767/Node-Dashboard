let users = [];

exports.addUser = ({ username, id }) => {
  users.push({ username, id });
  console.log(users);
};

exports.getUsers = (id) => {
  return users;
};

exports.getUserById = (id) => {
  return users.find((user) => user.id === id);
};

exports.removeUser = (id) => {
  users = users.filter((user) => user.id !== id);
  console.log(users);
};
