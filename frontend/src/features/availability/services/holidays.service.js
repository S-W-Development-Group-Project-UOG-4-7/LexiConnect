// Sri Lanka holidays service with caching support
// Uses Nager.Date API as primary source

const HOLIDAYS_CACHE_KEY = 'lexiconnect_holidays_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class HolidaysService {
  constructor() {
    this.cache = this.loadCacheFromStorage();
  }

  loadCacheFromStorage() {
    try {
      const cached = localStorage.getItem(HOLIDAYS_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.warn('Failed to load holidays cache:', error);
      return {};
    }
  }

  saveCacheToStorage() {
    try {
      localStorage.setItem(HOLIDAYS_CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.warn('Failed to save holidays cache:', error);
    }
  }

  getCacheKey(countryCode, year) {
    return `holidays:${countryCode}:${year}`;
  }

  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
  }

  async getPublicHolidays({ year, countryCode = 'LK' } = {}) {
    const cacheKey = this.getCacheKey(countryCode, year);
    const cached = this.cache[cacheKey];

    if (this.isCacheValid(cached)) {
      return cached.data;
    }

    try {
      // Use Nager.Date API
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const holidays = await response.json();
      
      // Normalize format
      const normalizedHolidays = holidays.map(holiday => ({
        date: holiday.date,
        localName: holiday.localName || holiday.name,
        name: holiday.name,
        type: this.determineHolidayType(holiday.name, holiday.localName),
        countryCode
      }));

      // Cache the results
      this.cache[cacheKey] = {
        data: normalizedHolidays,
        timestamp: Date.now()
      };
      this.saveCacheToStorage();

      return normalizedHolidays;
    } catch (error) {
      console.warn('Failed to fetch holidays from API:', error);
      
      // Return cached data if available, even if expired
      if (cached && cached.data) {
        console.warn('Using expired holiday cache as fallback');
        return cached.data;
      }
      
      return [];
    }
  }

  determineHolidayType(name, localName) {
    const text = (name + ' ' + localName).toLowerCase();
    
    // Check for Poya days (full moon days)
    if (text.includes('poya') || text.includes('full moon') || text.includes('poson')) {
      return 'poya';
    }
    
    // Check for other religious holidays
    if (text.includes('christmas') || text.includes('easter') || 
        text.includes('ramadan') || text.includes('eid') || 
        text.includes('vesak') || text.includes('deepavali') || text.includes('diwali')) {
      return 'religious';
    }
    
    // Default to public holiday
    return 'public';
  }

  async getHolidaysForDateRange(startDate, endDate, countryCode = 'LK') {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = new Set();
    
    // Collect all years needed
    let current = new Date(start);
    while (current <= end) {
      years.add(current.getFullYear());
      current.setFullYear(current.getFullYear() + 1);
    }

    // Fetch holidays for all needed years
    const holidayPromises = Array.from(years).map(year => 
      this.getPublicHolidays({ year, countryCode })
    );

    const allHolidays = await Promise.all(holidayPromises);
    const holidays = allHolidays.flat();

    // Filter by date range
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= start && holidayDate <= end;
    });
  }

  buildHolidayLookup(holidays) {
    const lookup = {};
    holidays.forEach(holiday => {
      lookup[holiday.date] = holiday;
    });
    return lookup;
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.cache = {};
    this.saveCacheToStorage();
  }
}

// Export singleton instance
const holidaysService = new HolidaysService();
export default holidaysService;
