const { capitalize, truncate, slugify } = require('./string.js');
const { formatDate, timeAgo, isWeekend } = require('./date.js');
const { chunk, unique, shuffle } = require('./array.js');

module.exports = {
    capitalize,
    truncate,
    slugify,
    formatDate,
    timeAgo,
    isWeekend,
    chunk,
    unique,
    shuffle
};
