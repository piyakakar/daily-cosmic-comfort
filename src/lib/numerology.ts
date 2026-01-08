// Numerology calculation utilities

export const calculateNaamAnk = (name: string): number => {
  const letterValues: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 8, g: 3, h: 5, i: 1,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 7, p: 8, q: 1, r: 2,
    s: 3, t: 4, u: 6, v: 6, w: 6, x: 5, y: 1, z: 7
  };

  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  
  for (const char of cleanName) {
    sum += letterValues[char] || 0;
  }

  // Reduce to single digit (except master numbers)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((acc, d) => acc + parseInt(d), 0);
  }

  return sum;
};

export const calculateMulank = (dateOfBirth: string): number => {
  const date = new Date(dateOfBirth);
  const day = date.getDate();
  
  let mulank = day;
  while (mulank > 9 && mulank !== 11 && mulank !== 22) {
    mulank = String(mulank).split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  
  return mulank;
};

export const calculateLifePathNumber = (dateOfBirth: string): number => {
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const digitSum = (n: number): number => {
    let sum = 0;
    while (n > 0) {
      sum += n % 10;
      n = Math.floor(n / 10);
    }
    return sum;
  };

  let lifePathNumber = digitSum(month) + digitSum(day) + digitSum(year);
  while (lifePathNumber > 9 && lifePathNumber !== 11 && lifePathNumber !== 22 && lifePathNumber !== 33) {
    lifePathNumber = digitSum(lifePathNumber);
  }

  return lifePathNumber;
};

export const getZodiacSign = (dateOfBirth: string): string => {
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const zodiacSigns = [
    { sign: "Capricorn", start: [12, 22], end: [1, 19] },
    { sign: "Aquarius", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", start: [2, 19], end: [3, 20] },
    { sign: "Aries", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", start: [6, 21], end: [7, 22] },
    { sign: "Leo", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", start: [8, 23], end: [9, 22] },
    { sign: "Libra", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
  ];

  for (const z of zodiacSigns) {
    const [startMonth, startDay] = z.start;
    const [endMonth, endDay] = z.end;
    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay)
    ) {
      return z.sign;
    }
  }

  return "Capricorn";
};

export const getLuckyColors = (number: number): string[] => {
  const colors: Record<number, string[]> = {
    1: ['Gold', 'Orange', 'Yellow'],
    2: ['White', 'Cream', 'Green'],
    3: ['Yellow', 'Purple', 'Pink'],
    4: ['Blue', 'Grey', 'Khaki'],
    5: ['Green', 'White', 'Grey'],
    6: ['Blue', 'Pink', 'White'],
    7: ['Green', 'Yellow', 'White'],
    8: ['Black', 'Dark Blue', 'Purple'],
    9: ['Red', 'Pink', 'Coral'],
    11: ['Silver', 'White', 'Violet'],
    22: ['Green', 'Cream', 'White'],
    33: ['Sky Blue', 'Pink', 'Turquoise'],
  };
  return colors[number] || colors[1];
};

export const getLuckyDays = (number: number): string[] => {
  const days: Record<number, string[]> = {
    1: ['Sunday'],
    2: ['Monday'],
    3: ['Thursday'],
    4: ['Saturday', 'Sunday'],
    5: ['Wednesday'],
    6: ['Friday'],
    7: ['Monday'],
    8: ['Saturday'],
    9: ['Tuesday', 'Thursday'],
    11: ['Monday', 'Sunday'],
    22: ['Saturday', 'Monday'],
    33: ['Thursday', 'Friday'],
  };
  return days[number] || days[1];
};

export const getCompatibleNumbers = (number: number): number[] => {
  const compatible: Record<number, number[]> = {
    1: [1, 2, 3, 9],
    2: [1, 2, 6],
    3: [1, 3, 6, 9],
    4: [5, 6, 8],
    5: [1, 4, 6],
    6: [2, 3, 4, 9],
    7: [1, 2, 9],
    8: [4, 6, 8],
    9: [1, 3, 6, 9],
    11: [2, 4, 6],
    22: [4, 6, 8],
    33: [3, 6, 9],
  };
  return compatible[number] || compatible[1];
};
