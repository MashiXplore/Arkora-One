import { userRepository } from '@/backend/repositories/user.repository';
import type { CreateUserInput, UpdateUserInput } from '@/backend/validators/user.validator';

export const userService = {
  async getUsers(params: { page: number; pageSize: number; search?: string }) {
    const { users, totalRecords } = await userRepository.findMany(params);
    const totalPages = Math.ceil(totalRecords / params.pageSize);

    return {
      users,
      pagination: {
        totalRecords,
        page: params.page,
        pageSize: params.pageSize,
        totalPages,
      },
    };
  },

  async getUserById(id: number) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  },

  async createUser(data: CreateUserInput) {
    return userRepository.create(data);
  },

  async updateUser(id: number, data: UpdateUserInput) {
    return userRepository.update(id, data);
  },

  async deleteUser(id: number) {
    return userRepository.delete(id);
  },

  async getUserMetrics() {
    return userRepository.getMetrics();
  },
};
