import userRepositories from "../repositories/user.repositories.js";

function createUserService(newUser) {
  return userRepositories.createUserRepository(newUser);
}

export default { createUserService };
