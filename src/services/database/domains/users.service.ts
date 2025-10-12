import { db } from '../client';
import type { Profile, UpdateProfile } from '../types';
import { logger } from '@/utils/logger';

const userLogger = logger.withContext('UsersService');

export class UsersService {
  /**
   * Get user profile by ID
   */
  async getById(userId: string): Promise<Profile> {
    return db.query<Profile>('getUserById', async () => {
      return await db.getClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    });
  }

  /**
   * Get user profile by email
   */
  async getByEmail(email: string): Promise<Profile | null> {
    return db.queryOptional<Profile>('getUserByEmail', async () => {
      return await db.getClient()
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
    });
  }

  /**
   * Update user profile
   */
  async update(userId: string, updates: UpdateProfile): Promise<Profile> {
    userLogger.info('Updating user profile', { userId });

    return db.query<Profile>('updateUser', async () => {
      return await db.getClient()
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    });
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<Profile> {
    userLogger.info('Updating user avatar', { userId });

    return this.update(userId, { avatar: avatarUrl });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const profile = await this.getByEmail(email);
    return profile !== null;
  }
}

// Export singleton instance
export const usersService = new UsersService();
