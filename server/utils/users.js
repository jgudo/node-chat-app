class User {
  constructor() {
    this.users = [];
  }
  addUser(id, name, room, avatar) {
    const user = {id, name, room, avatar};
    this.users.push(user);
    return user;
  }
  removeUser(id) {
    const user = this.getUser(id);

    if(user) {
      this.users = this.users.filter((user) => user.id !== id);
    }

    return user;
  }
  getUser(id) {
    return this.users.filter((user) => user.id === id)[0];
  }
  getUserList(room) {
    const users = this.users.filter((user) => user.room === room);
    const names = users.map((user) => user.name);

    return names; 
  }
}

module.exports = {User};