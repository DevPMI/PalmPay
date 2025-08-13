/** @format */

const formatPhoneNumber = (input) => {
	let phoneNumber;
	if (input[0] === '+') {
		phoneNumber = input
			.slice(3, input.length)
			.replace(/\s/g, '')
			.replace(/\D/g, '')
			.split('');
		phoneNumber.unshift(0);
		return phoneNumber.join('');
	} else {
		phoneNumber = input.replace(/\D/g, '').split('');
		return phoneNumber.join('');
	}
};

module.exports = formatPhoneNumber;
