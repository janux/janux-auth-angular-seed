'use strict';


// Truncate string in the middle
var truncate = function (fullStr, strLen, separator) {
	if (fullStr.length <= strLen) return fullStr;

	separator = separator || '...';

	var sepLen = separator.length,
		charsToShow = strLen - sepLen,
		frontChars = Math.ceil(charsToShow/2),
		backChars = Math.floor(charsToShow/2);

	return fullStr.substr(0, frontChars) +
		separator +
		fullStr.substr(fullStr.length - backChars);
};

module.exports = {
	"truncate": truncate
};