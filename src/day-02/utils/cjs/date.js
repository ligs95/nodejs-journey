function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

function timeAgo(date) {
    return `${Math.floor((Date.now() - date.getTime()) / 1000 / 60 / 60 / 24)} days ago`;
}


function isWeekend(date){
    return date.getDay() === 0 || date.getDay() === 6;
}

module.exports = {
    formatDate,
    timeAgo,
    isWeekend
}