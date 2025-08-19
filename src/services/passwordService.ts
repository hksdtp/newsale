/**
 * Password Service for secure password handling
 * Uses Web Crypto API for hashing passwords
 */

export interface PasswordHashResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface PasswordVerifyResult {
  success: boolean;
  isValid?: boolean;
  error?: string;
}

export class PasswordService {
  private static readonly SALT_LENGTH = 16;
  private static readonly ITERATIONS = 100000; // PBKDF2 iterations
  private static readonly HASH_LENGTH = 32;

  /**
   * Hash password using PBKDF2 with random salt
   */
  static async hashPassword(password: string): Promise<PasswordHashResult> {
    try {
      // Generate random salt
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      
      // Convert password to ArrayBuffer
      const passwordBuffer = new TextEncoder().encode(password);
      
      // Import password as key
      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      // Derive hash using PBKDF2
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: this.ITERATIONS,
          hash: 'SHA-256'
        },
        key,
        this.HASH_LENGTH * 8 // bits
      );
      
      // Combine salt and hash
      const combined = new Uint8Array(salt.length + hashBuffer.byteLength);
      combined.set(salt);
      combined.set(new Uint8Array(hashBuffer), salt.length);
      
      // Convert to base64
      const hash = btoa(String.fromCharCode(...combined));
      
      return { success: true, hash };
      
    } catch (error) {
      console.error('Password hashing error:', error);
      return { success: false, error: 'Không thể hash password.' };
    }
  }

  /**
   * Verify password against stored hash
   */
  static async verifyPassword(password: string, storedHash: string): Promise<PasswordVerifyResult> {
    try {
      // Decode stored hash
      const combined = new Uint8Array(
        atob(storedHash).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract salt and hash
      const salt = combined.slice(0, this.SALT_LENGTH);
      const storedHashBytes = combined.slice(this.SALT_LENGTH);
      
      // Convert password to ArrayBuffer
      const passwordBuffer = new TextEncoder().encode(password);
      
      // Import password as key
      const key = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      // Derive hash using same parameters
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: this.ITERATIONS,
          hash: 'SHA-256'
        },
        key,
        this.HASH_LENGTH * 8
      );
      
      // Compare hashes
      const computedHash = new Uint8Array(hashBuffer);
      const isValid = this.constantTimeEqual(computedHash, storedHashBytes);
      
      return { success: true, isValid };
      
    } catch (error) {
      console.error('Password verification error:', error);
      return { success: false, error: 'Không thể xác thực password.' };
    }
  }

  /**
   * Generate secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array, byte => charset[byte % charset.length]).join('');
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      feedback.push('Mật khẩu phải có ít nhất 8 ký tự');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Cần có ít nhất 1 chữ thường');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Cần có ít nhất 1 chữ hoa');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Cần có ít nhất 1 số');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Cần có ít nhất 1 ký tự đặc biệt');

    // Common patterns check
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Không được lặp ký tự quá 2 lần liên tiếp');
      score -= 1;
    }

    if (/123|abc|qwe|password|admin/i.test(password)) {
      feedback.push('Không được sử dụng chuỗi phổ biến');
      score -= 2;
    }

    const isValid = score >= 4 && feedback.length === 0;
    
    return { isValid, score: Math.max(0, score), feedback };
  }

  /**
   * Constant time comparison to prevent timing attacks
   */
  private static constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    
    return result === 0;
  }

  /**
   * Hash password for migration from plain text
   */
  static async migratePasswordToHash(userId: string, plainPassword: string): Promise<boolean> {
    try {
      const hashResult = await this.hashPassword(plainPassword);
      if (!hashResult.success || !hashResult.hash) {
        return false;
      }

      // Update in database (this would be done via API in real app)
      console.log(`Migrating password for user ${userId} to hash: ${hashResult.hash}`);
      
      return true;
    } catch (error) {
      console.error('Password migration error:', error);
      return false;
    }
  }
}

export default PasswordService;
