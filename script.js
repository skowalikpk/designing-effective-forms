let clickCount = 0;

const countryInput = document.getElementById('country');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();
        const countries = data.map(country => country.name.common);
        countries.sort((a, b) => a.localeCompare(b));
        const countrySelect = document.getElementById('country');
        countrySelect.innerHTML = countries.map(country => `<option value="${country}">${country}</option>`).join('');
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}


async function populateCountryCodes() {
    const select = document.getElementById('countryCode');
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) throw new Error('Błąd podczas pobierania danych');
        const countries = await response.json();

        countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

        countries.forEach(country => {
            const name = country.name?.common;
            const callingCodes = country.idd?.root && country.idd?.suffixes
                ? country.idd.suffixes.map(suffix => `${country.idd.root}${suffix}`)
                : [];

            callingCodes.forEach(code => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${name} (${code})`;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function getCountryByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            setSelectToCountry(country);
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function getCityAndZipCodeByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const city = data.city || 'Nie udało się znaleźć miasta';
            const zipCode = data.zip || 'Nie udało się znaleźć kodu pocztowego';
            const latitude = data.latitude;
            const longitude = data.longitude;

            document.getElementById('city').value = city;
            document.getElementById('zipCode').value = zipCode;

            if (latitude && longitude) {
                reverseGeocode(latitude, longitude);
            }

            const country = data.country;
            setSelectToCountry(country); 
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function reverseGeocode(latitude, longitude) {
    const apiKey = 'd75b3169ec9a49c4895607414bb3d72c'; 
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&no_annotations=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results[0]) {
                const postalCode = data.results[0].components.postcode;
                if (postalCode) {
                    document.getElementById('zipCode').value = postalCode; 
                }
            }
        })
        .catch(error => {
            console.error('Błąd reverse geocoding:', error);
        });
}



function setSelectToCountry(countryName) {
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.value = countryName;
    }
    getCountryCode(countryName); 
}

function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Błąd pobierania danych');
            }
            return response.json();
        })
        .then(data => {
            const code = data[0].idd.root + (data[0].idd.suffixes ? data[0].idd.suffixes[0] : "");
            const countryCodeSelect = document.getElementById('countryCode');
            if (countryCodeSelect) {
                const optionToSelect = [...countryCodeSelect.options].find(opt => opt.value === code);
                if (optionToSelect) {
                    countryCodeSelect.value = code;
                } else {
                    console.warn('Nie znaleziono opcji dla kodu:', code);
                }
            } else {
                console.error('Nie znaleziono elementu countryCode');
            }
        })
        .catch(error => {
            console.error('Wystąpił błąd:', error);
        });
}

(() => {
    document.addEventListener('click', handleClick);
    fetchAndFillCountries();
    populateCountryCodes().then(getCountryByIP);
    getCityAndZipCodeByIP();
})();


document.getElementById('country').addEventListener('change', (e) => {
    const selectedCountry = e.target.value;
    getCountryCode(selectedCountry);
});


function handleImageSelect(selectId) {
    document.querySelectorAll(`#${selectId} .image-option`).forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll(`#${selectId} .image-option`).forEach(item => item.classList.remove('selected'));
            this.classList.add('selected');
            const selectedValue = this.getAttribute('data-value');
            document.getElementById(selectId).value = selectedValue;
        });
    });
}

handleImageSelect('shippingMethod');

handleImageSelect('paymentMethod');

function toggleVatFields() {
    const vatSection = document.getElementById('vatSection');
    const invoiceDataSection = document.getElementById('invoiceDataSection');
    const vatUE = document.getElementById('vatUE');
    const vatNumber = document.getElementById('vatNumber');
    const invoiceData = document.getElementById('invoiceData');

    if (vatUE.checked) {
        vatSection.style.display = 'block';
        invoiceDataSection.style.display = 'block';
        vatNumber.required = true;
        invoiceData.required = true;
    } else {
        vatSection.style.display = 'none';
        invoiceDataSection.style.display = 'none';
        vatNumber.required = false;
        invoiceData.required = false;
    }
}


document.getElementById('vatUE').addEventListener('change', toggleVatFields);

toggleVatFields();


document.getElementById('phoneNumber').addEventListener('input', function (e) {
    let value = this.value.replace(/\D/g, ''); 
    value = value.substring(0, 20); 
    let formatted = value.replace(/(\d{3})(\d{3})(\d{0,3})/, function(_, p1, p2, p3) {
        return p1 + (p2 ? ' ' + p2 : '') + (p3 ? ' ' + p3 : '');
    });
    this.value = formatted;
});

document.getElementById('vatNumber').addEventListener('input', function () {
    const vatNumber = this.value.trim();
    const vatHelp = document.getElementById('vatHelp');

    const isValidVat = /^[A-Za-z]+[0-9]+$/.test(vatNumber);

    if (!isValidVat && vatNumber.length > 0) {
        vatHelp.style.display = 'block';
    } else {
        vatHelp.style.display = 'none';
    }
});

document.getElementById('exampleInputEmail1').addEventListener('input', function () {
    const email = this.value;
    const emailHelp = document.getElementById('emailHelp');
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid && email.length > 0) {
        emailHelp.style.display = 'block';
    } else {
        emailHelp.style.display = 'none';
    }
});

document.getElementById('zipCode').addEventListener('input', function () {
    const zipCode = this.value;
    const zipHelp = document.getElementById('zipHelp');
    const isValid = /^\d{2}-\d{3}$/.test(zipCode); 
    if (!isValid && zipCode.length > 0) {
      zipHelp.style.display = 'block'; 
    } else {
      zipHelp.style.display = 'none'; 
    }
  });


function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('exampleInputEmail1').value.trim();
    const phone = document.getElementById('phoneNumber').value.replace(/\s/g, '').trim();
    const street = document.getElementById('street').value.trim();
    const city = document.getElementById('city').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value;
    const shippingMethod = document.getElementById('shippingMethod').querySelector('.selected');
    const paymentMethod = document.getElementById('paymentMethod').querySelector('.selected');
    const vatUE = document.getElementById('vatUE').checked;
    const vatNumber = document.getElementById('vatNumber').value.trim();
    const invoiceData = document.getElementById('invoiceData').value.trim();

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidZip = /^\d{2}-\d{3}$/.test(zipCode);
    const isValidVat = /^[A-Za-z]+[0-9]+$/.test(vatNumber);

    let isFormValid = false;

    if (name && isValidEmail && street && city && isValidZip && country && shippingMethod && paymentMethod) {
        isFormValid = true;
    }

    if (vatUE) {
        if (!vatNumber || !invoiceData || !isValidVat) {
            isFormValid = false;
        }
    }

    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = !isFormValid;
    return isFormValid;
}

document.getElementById('name').addEventListener('input', validateForm);
document.getElementById('exampleInputEmail1').addEventListener('input', validateForm);
document.getElementById('phoneNumber').addEventListener('input', validateForm);
document.getElementById('street').addEventListener('input', validateForm);
document.getElementById('city').addEventListener('input', validateForm);
document.getElementById('zipCode').addEventListener('input', validateForm);
document.getElementById('country').addEventListener('change', validateForm);
document.getElementById('shippingMethod').addEventListener('click', validateForm);
document.getElementById('paymentMethod').addEventListener('click', validateForm);
document.getElementById('vatUE').addEventListener('change', validateForm);
document.getElementById('vatNumber').addEventListener('input', validateForm);
document.getElementById('invoiceData').addEventListener('input', validateForm);

document.addEventListener("keydown", function(event) {
    const tag = event.target.tagName.toLowerCase();
    const isFormElement = ["input", "textarea", "select"].includes(tag);
    if (event.key === "Enter" && !isFormElement && validateForm()) {
        document.querySelector("button[type='submit']").click();
    }
});
