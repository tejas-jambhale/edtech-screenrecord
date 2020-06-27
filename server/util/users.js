const users = [];

//join user to chat
function userJoin(id, username, room, type, allowed) {
  const user = {
    id,
    username,
    room,
    type,
    allowed,
    speakAllowed: false,
  };
  // user.allowed = user.type === "student" ? false : true;

  users.push(user);
  return user;
}

function getCurrentUser(username) {
  return users.find((user) => user.username === username);
}

function getCurrentUserById(id) {
  return users.find((user) => user.id === id);
}

function userLeaves(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
}

function userLeavesName(username) {
  const index = users.findIndex((user) => user.username === username);
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
}

function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

function changeItem(username, changeTo) {
  const a = users.find((user) => user.username === username);
  a.allowed = changeTo;
}

function changeSpeech(username, changeTo) {
  const a = users.find((user) => user.username === username);
  a.speakAllowed = changeTo;
}

function changeAllSpeech(changeTo) {
  users.forEach((user) => (user.speakAllowed = changeTo));
}

function changeAllMessages(changeTo) {
  users.forEach((user) =>
    user.type === "student" ? (user.allowed = changeTo) : null
  );
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeaves,
  getRoomUsers,
  changeItem,
  getCurrentUserById,
  changeSpeech,
  userLeavesName,
  changeAllSpeech,
  changeAllMessages,
};
