const hamburer = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');
const errorMessage = document.querySelector('.errorMessage');
// errorMessage.style.display = 'none';
// console.log(' _ ' + errorMessage.textContent);
// if (errorMessage.textContent) {
// 	errorMessage.style.display = '';
// } else {
// 	errorMessage.style.display = 'none';
// }

if (hamburer) {
	hamburer.addEventListener('click', () => {
		navList.classList.toggle('open');
	});
}

// Popup
const popup = document.querySelector('.popup');
const closePopup = document.querySelector('.popup-close');

if (popup) {
	closePopup.addEventListener('click', () => {
		popup.classList.add('hide-popup');
	});

	window.addEventListener('load', () => {
		setTimeout(() => {
			popup.classList.remove('hide-popup');
		}, 1000);
	});
}
