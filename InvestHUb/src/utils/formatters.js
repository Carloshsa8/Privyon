export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value || 0);
};

export const formatPercent = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((value || 0) / 100);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  // Handle YYYY-MM-DD (standard storage format)
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  // Fallback to Intl
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
  } catch (e) {
    return dateString;
  }
};

// Generates an array of colors given a number of items needed for charts
export const generateColors = (count) => {
  const baseColors = [
    '#00D26A', // Primary Green
    '#1c7ed6', // Blue
    '#f59f00', // Orange
    '#e03131', // Red
    '#7048e8', // Purple
    '#1098ad', // Cyan
    '#f06595', // Pink
    '#a9e34b', // Lime
  ];
  
  if (count <= baseColors.length) return baseColors.slice(0, count);
  
  // If more colors needed, cycle through them
  const colors = [];
  for(let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};
