'use strict';

window.addEventListener('DOMContentLoaded', () => { 

    const filterSearch = document.querySelector('.filter__search'),
        filter = document.querySelector('.filter'),
        goodsWrapper = document.querySelector('.goods__wrapper'),
        overlay = document.querySelector('.overlay'),
        modal = document.querySelector('.modal');
    let categories = [],
        startValue = filter.value,
        titles = document.querySelectorAll('.goods__description'),
        goodsBtn = document.querySelectorAll('.goods__btn'),
        goodsName = document.querySelectorAll('.goods__name');

    //выдает данные в зависимости от того, что введено в инпут
    function getData() {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            request.open('GET', 'cars.json');
            request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            request.send();

            request.addEventListener('load', function() {
                if (request.status == 200) {
                    let data = JSON.parse(request.response),
                        array = [];
                    goodsWrapper.innerHTML = '';
                    data.cars.forEach(item => {
                        if (item.category.toUpperCase() == filter.value.toUpperCase()) {
                            array.push(item);
                        } else if (filter.value == startValue) {
                            array.push(item);
                        }
                    });
                    resolve(array);
                } else {
                    reject(new Error('Что-то пошло не так!'));
                }
            });
        })
    }
    //выдает данные для открытия модального окна
    function getDataForModal(car) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();

            request.open('GET', 'cars.json');
            request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            request.send();

            request.addEventListener('load', function() {
                if (request.status == 200) {
                    let data = JSON.parse(request.response).cars;
                    data.forEach(item => {
                        if (item.name == car) {
                            resolve(item);
                        }
                    });
                } else {
                    reject(new Error('Что-то пошло не так!'));
                }
            })
        })
    }

    function createSearch() {
        let content = document.createElement('div');
        content.classList.add('filter__content');
        content.textContent = startValue;
        filterSearch.appendChild(content);

        categories.forEach(item => {
            let content = document.createElement('div');
            content.classList.add('filter__content');
            content.textContent = item.trim()[0].toUpperCase() + item.trim().slice(1);
            filterSearch.appendChild(content);
        });
    }

    function createElement(arr) {
        arr.forEach(function(item) {
            let car = document.createElement('div');
            car.classList.add('goods__item');
            car.innerHTML = `
                <img class="goods__img" src="${item.img}" alt="car-photo" width="280" height="210">
                <div class="goods__name">${item.name}</div>
                <div class="goods__country">Country: ${item.category.trim()[0].toUpperCase() + item.category.trim().slice(1)}</div>
                <div class="goods__description">
                    ${item.description}
                </div>
                <div class="goods__price">
                    <span>${item.price}</span> $
                </div>
                <button class="goods__btn">Show more</button>
            `;
            goodsWrapper.appendChild(car);

            if (!categories.includes(item.category)) {
                categories.push(item.category);
            }
        });
    }

    function openSearch() {
        document.addEventListener('click', (event) => {
            if (event.target && event.target == filter && !filter.classList.contains('open')) {
                filterSearch.style.display = 'block';
                filter.classList.add('open');
            } else if (event.target && !event.target.classList.contains('filter__content') && 
                    !event.target.classList.contains('filter__search') &&
                    filter.classList.contains('open')) {
                filterSearch.style.display = 'none';
                filter.classList.remove('open');
            }
        });
    }

    function sliceTitle(title) {
        title.forEach(function(item) {
            let str = item.textContent;
            str = str.trim();
            if (str.length < 200) { //если количество символов описания каждого товара меньше 70
                return;
            } else {
                str = str[0].toUpperCase() + str.slice(1, 200) + '...'; //отрежем первые 70 символов от описания в str и добавим троеточие
                //const str = `${item.textContent.slice(0, 71)}...`; //в ES6
                item.textContent = str;
            }
        });
    }

    function chooseCategory() {
        const cat = document.querySelectorAll('.filter__content');
        filterSearch.addEventListener('click', (event) => {
            cat.forEach((item) => {
                if (event.target && event.target == item) {
                    filter.value = item.textContent;
                    filterSearch.style.display = 'none';
                    filter.classList.remove('open');
                    
                    getData()
                        .then(response => {
                            createElement(response);
                        })
                        .then(() => {
                            titles = document.querySelectorAll('.goods__description');
                            goodsBtn = document.querySelectorAll('.goods__btn');
                            goodsName = document.querySelectorAll('.goods__name');

                            sliceTitle(titles);
                            openModal();
                            closeModal();
                        })
                        .catch(error => console.log(error.message));     
                }
            });
        });     
    }
    
    function openModal() {
        document.body.addEventListener('click', event => {
            if (!filter.classList.contains('open') && !modal.classList.contains('open')) {
                goodsBtn.forEach((item, index) => {
                    if (event.target && event.target == item) {
                        console.log(goodsName[index]);
                        getDataForModal(goodsName[index].textContent)
                            .then(resp => createModal(resp))
                            .catch(error => console.log(error))
                    }
                })
            }
        });
    }

    function createModal(response) {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        modal.classList.add('open');
        modal.innerHTML = `
            <img class="modal__img" src="${response.img}" alt="car-photo" width="680">
            <div class="modal__name">${response.name}</div>
            <div class="modal__country">Country: ${response.category.trim()[0].toUpperCase() + response.category.trim().slice(1)}</div>
            <div class="modal__description">
                ${response.description.trim()[0].toUpperCase() + response.description.trim().slice(1)}
            </div>
            <div class="modal__price">
                Price: <span>${response.price}</span> $
            </div>
        `;
    }

    function closeModal() {
        document.body.addEventListener('click', (event) => {
            if (event.target && modal.classList.contains('open')) {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                modal.classList.remove('open');
                modal.innerHTML = ``;
            }
        })
    }

    function loadContent() {
        getData()
            .then(response => {
                createElement(response);
            })
            .then(() => {
                titles = document.querySelectorAll('.goods__description');
                goodsBtn = document.querySelectorAll('.goods__btn');
                goodsName = document.querySelectorAll('.goods__name');

                createSearch();
                openSearch();
                chooseCategory();
                sliceTitle(titles);
                openModal();
                closeModal();
            })
            .catch(error => console.log(error.message));
    }

    loadContent();
});