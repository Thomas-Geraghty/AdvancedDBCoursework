function hashToInt(str) {

    const colors = 
    ['#0084ff', '#44bec7', '#ffc300', '#fa3c4c', '#d696bb', '#6699cc', '#13cf13', '#ff7e29', 
    '#e68585', '#ad8fff', '#20cef5', '#67b868', '#d4a88c', '#ff5ca1', '#a695c7', '#d7a2c9']

    str = str.toString();

    var hash = 0;
	if (str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }

    hash = ((hash % colors.length) + colors.length) % colors.length;

    return colors[hash];
}

module.exports = {
    hashToInt: hashToInt
}