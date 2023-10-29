// import { User } from "knex/types/tables"
import { User, UserForCreate } from "../utils/interfaces.ts";
import db from "../db/db.ts";
import bcrypt from "bcrypt";

export class UserModel {
  async findUserByName(name: string) {
    const user = await db<User>("users").first("name", "id", "created_at")
      .where("name", name);
    return user;
  }
  async getUserPwdHash(id: string) {
    const pwdHash = await db<User>("users").first("pwd_hash").where("id", id);
    return pwdHash;
  }
  async CreateUser(newUserInfo: UserForCreate) {
    const { name, pwd } = newUserInfo;
    const pwd_hash = await bcrypt.hash(pwd, 12);
    const user = await db<User>("users").insert({ name, pwd_hash }).returning(["id", "name", "created_at"]);
    console.log(user);
    return user;
  }
}
