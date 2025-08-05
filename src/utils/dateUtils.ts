/**
 * Utility functions for date parsing and formatting
 */

/**
 * Parse Vietnamese date format like "10 Th9, 2023" to JavaScript Date
 * @param dateStr - Vietnamese date string
 * @returns Date object or null if invalid
 */
export function parseVietnameseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Map Vietnamese month abbreviations to numbers
    const monthMap: { [key: string]: number } = {
      'Th1': 1, 'Th2': 2, 'Th3': 3, 'Th4': 4, 'Th5': 5, 'Th6': 6,
      'Th7': 7, 'Th8': 8, 'Th9': 9, 'Th10': 10, 'Th11': 11, 'Th12': 12,
      // Handle lowercase variations
      'th1': 1, 'th2': 2, 'th3': 3, 'th4': 4, 'th5': 5, 'th6': 6,
      'th7': 7, 'th8': 8, 'th9': 9, 'th10': 10, 'th11': 11, 'th12': 12
    };
    
    // Parse format: "10 Th9, 2023" or "10 Th9 2023"
    const regex = /^(\d{1,2})\s+(Th\d{1,2}),?\s+(\d{4})$/i;
    const match = dateStr.match(regex);
    
    if (!match) {
      // Try alternative formats: dd/mm/yyyy or yyyy-mm-dd
      const altRegex1 = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const altMatch1 = dateStr.match(altRegex1);
      if (altMatch1) {
        const day = parseInt(altMatch1[1], 10);
        const month = parseInt(altMatch1[2], 10);
        const year = parseInt(altMatch1[3], 10);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) return date;
      }
      
      return null;
    }
    
    const day = parseInt(match[1], 10);
    const monthStr = match[2];
    const year = parseInt(match[3], 10);
    
    const month = monthMap[monthStr];
    if (!month) return null;
    
    // Create date (month is 0-indexed in JavaScript)
    const date = new Date(year, month - 1, day);
    
    // Validate the date
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      return null;
    }
    
    return date;
  } catch (e) {
    return null;
  }
}

/**
 * Format date to Vietnamese short format "dd thg MM"
 * @param date - Date object
 * @returns Formatted string like "10 thg 9"
 */
export function formatVietnameseDate(date: Date): string {
  if (!date || isNaN(date.getTime())) return 'N/A';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  return `${day} thg ${month}`;
}

/**
 * Parse date string (supports both ISO and Vietnamese formats)
 * @param dateStr - Date string in various formats
 * @returns Date object or null if invalid
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try Vietnamese format first
  const vietnameseDate = parseVietnameseDate(dateStr);
  if (vietnameseDate) return vietnameseDate;
  
  // Try standard JavaScript Date parsing
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;
  } catch (e) {
    // Fall through
  }
  
  return null;
}
