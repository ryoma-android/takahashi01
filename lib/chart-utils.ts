/**
 * チャート用データ検証ユーティリティ
 */

// 数値が有効かどうかをチェック
export const isValidNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

// 数値を安全な値に変換
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (isValidNumber(value)) {
    return value;
  }
  return defaultValue;
};

// オブジェクトの数値プロパティを安全な値に変換
export const sanitizeObjectNumbers = (obj: any, defaultValue: number = 0): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'number') {
      sanitized[key] = safeNumber(sanitized[key], defaultValue);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObjectNumbers(sanitized[key], defaultValue);
    }
  }
  return sanitized;
};

// 配列の数値プロパティを安全な値に変換
export const sanitizeArrayNumbers = (arr: any[], defaultValue: number = 0): any[] => {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map(item => {
    if (typeof item === 'number') {
      return safeNumber(item, defaultValue);
    } else if (typeof item === 'object' && item !== null) {
      return sanitizeObjectNumbers(item, defaultValue);
    }
    return item;
  });
};

// チャートデータが有効かどうかをチェック
export const isValidChartData = (data: any): boolean => {
  if (!data) return false;
  if (Array.isArray(data)) {
    return data.length > 0 && data.every(item => isValidChartDataItem(item));
  }
  return isValidChartDataItem(data);
};

// チャートデータアイテムが有効かどうかをチェック
export const isValidChartDataItem = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;
  
  // 数値プロパティをチェック
  for (const key in item) {
    if (typeof item[key] === 'number' && !isValidNumber(item[key])) {
      return false;
    }
  }
  
  return true;
};

// チャートデータを安全にフィルタリング
export const filterValidChartData = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(item => {
    if (!item || typeof item !== 'object') return false;
    
    // 数値プロパティをチェック
    for (const key in item) {
      if (typeof item[key] === 'number' && !isValidNumber(item[key])) {
        return false;
      }
    }
    
    return true;
  });
};

// デフォルトのチャートデータを生成
export const createDefaultChartData = (type: 'line' | 'bar' | 'pie'): any[] => {
  switch (type) {
    case 'line':
    case 'bar':
      return [
        { month: '1月', value: 0 },
        { month: '2月', value: 0 },
        { month: '3月', value: 0 },
        { month: '4月', value: 0 },
        { month: '5月', value: 0 },
        { month: '6月', value: 0 }
      ];
    case 'pie':
      return [
        { name: 'データなし', value: 1, percentage: 100 }
      ];
    default:
      return [];
  }
};

// 軸のドメインを安全に設定
export const getSafeDomain = (data: any[], dataKey: string): [number, number] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [0, 100];
  }

  const values = data
    .map(item => item[dataKey])
    .filter(value => isValidNumber(value))
    .map(value => safeNumber(value));

  if (values.length === 0) {
    return [0, 100];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // 最小値と最大値が同じ場合の処理
  if (min === max) {
    return [min - 10, max + 10];
  }

  return [min, max];
}; 