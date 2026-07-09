function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, length) {
    if (str.length > length) {
        return str.slice(0, length) + '...';
    }
    return str;
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

module.exports = {
    capitalize,
    truncate,
    slugify
}