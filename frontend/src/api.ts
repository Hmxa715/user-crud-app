import axios from "axios";
import type { User } from "./types/User";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

export const getUsers = () => api.get<User[]>("/users");
export const createUser = (user: User) => api.post("/add", user);
export const updateUser = (id: number, user: User) => api.put(`/users/${id}`, user);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);
export const getUserGrowth = () => api.get<{ date: string; count: number }[]>("/users/stats/growth");
