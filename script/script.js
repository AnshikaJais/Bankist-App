"use strict";

const account1 = {
    owner: "",
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2,
    pin: 1111,
    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2019-01-28T09:15:04.904Z",
        "2019-04-01T10:17:24.185Z",
        "2019-05-08T14:11:59.604Z",
        "2019-05-27T17:01:17.194Z",
        "2022-11-30T23:36:17.929Z",
        "2022-12-05T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "pt-PT",
};
const account2 = {
    owner: "Anshika Jaiswal",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2019-09-28T09:15:04.904Z",
        "2020-06-01T10:17:24.185Z",
        "2020-01-08T14:11:59.604Z",
        "2021-04-27T17:01:17.194Z",
        "2021-04-11T23:36:17.929Z",
        "2022-02-12T10:51:36.790Z",
    ],
    currency: "USD",
    locale: "en-US",
};

let accounts = [account1, account2];

//ELEMENTS

const labelNavbarHeading = document.querySelector(".navbar__heading");
const labelDate = document.querySelector(".balance__date span");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const app = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");
const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__transfer--btn");
const btnRequest = document.querySelector(".form__request--btn");
const btnClose = document.querySelector(".form__close--btn");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__transfer--to");
const inputTransferAmount = document.querySelector(".form__transfer--amount");
const inputRequestTo = document.querySelector(".form__request--to");
const inputCloseUsername = document.querySelector(".form__close--user");
const inputClosePin = document.querySelector(".form__close--pin");

// FUNCTIONS
const formatmovementDate = function (date, locale) {
    const calcDaysPassed = (date1, date2) =>
        Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDaysPassed(new Date(), date);
    if (daysPassed === 0) return "Today";
    else if (daysPassed === 1) return "Yesterday";
    else if (daysPassed <= 7) return `${daysPassed} days ago`;
    else {
        return new Intl.DateTimeFormat(locale).format(date);
    }
};
const formattedPrice = function (price, currency, locale) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(price);
};
// creating username for each account
const createUsername = function (account) {
    const username = account.owner
        .toLowerCase()
        .split(" ")
        .map((name) => name[0])
        .join("");
    account.username = username;
    console.log(account);
};
accounts.forEach((el) => createUsername(el));

const startLogoutTimer = function () {
    const tick = () => {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${min}:${sec}`;
        if (time === 0) {
            labelNavbarHeading.textContent = "Log in to get started.";
            app.style.opacity = 0;
            clearInterval(timer);
        }
        time--;
    };
    let time = 600;
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
};

//function for displaying movements,balance and summary
const displayMovBalSum = function (user) {
    displayMovements(user);
    calcDisplaySummary(user);
    calcDisplayBalance(user);
};

// WORKING
// displaying movements
const displayMovements = function (account, sort = false) {
    containerMovements.innerHTML = "";
    const movs = sort
        ? account.movements.slice().sort((a, b) => a - b)
        : account.movements;
    movs.forEach((element, i) => {
        const type = element < 0 ? "withdrawal" : "deposit";
        const html = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">
            ${i + 1} ${type.toUpperCase()}</div>
            <div class="movements__date">${formatmovementDate(
                new Date(account.movementsDates[i]),
                account.locale
            )}</div>    
            <div class="movements__value">${formattedPrice(
                element,
                account.currency,
                account.locale
            )}</div>
        </div>`;
        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

// calculating current balance
const calcDisplayBalance = function (account) {
    account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.innerHTML = `${formattedPrice(
        account.balance,
        account.currency,
        account.locale
    )}`;
};

// calculating summary
const calcDisplaySummary = function (account) {
    const income = account.movements
        .filter((mov) => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    const withdraw = account.movements
        .filter((mov) => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    const interest = account.movements
        .filter((mov) => mov > 0)
        .map((mov) => (mov * account.interestRate) / 100)
        .filter((int) => int >= 1)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = `${formattedPrice(
        income,
        account.currency,
        account.locale
    )}`;
    labelSumOut.textContent = `${formattedPrice(
        Math.abs(withdraw),
        account.currency,
        account.locale
    )}`;
    labelSumInterest.textContent = `${formattedPrice(
        interest,
        account.currency,
        account.locale
    )}`;
};

// Event listeners
let currentUser, timer;
btnLogin.addEventListener("click", function (event) {
    //preventing form from submitting
    event.preventDefault();
    currentUser = accounts.find(
        (acc) => acc.username === inputLoginUsername.value
    );
    if (currentUser?.pin === +inputLoginPin.value) {
        //display UI and Welcome message
        labelNavbarHeading.textContent = `Welcome back, ${
            currentUser.owner.split(" ")[0]
        }`;
        //displaying app
        app.style.opacity = 1;
        //create current date

        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        };
        labelDate.textContent = new Intl.DateTimeFormat(
            currentUser.locale,
            options
        ).format(new Date());
        //clear input field
        inputLoginUsername.value = inputLoginPin.value = "";
        //to lose focus in pin input field
        inputLoginPin.blur();
        //Timer
        if (timer) clearInterval(timer);
        timer = startLogoutTimer();
        //display movements, balance, summary
        displayMovBalSum(currentUser);
    }
});

btnTransfer.addEventListener("click", function (event) {
    event.preventDefault();
    const amount = +inputTransferAmount.value;
    const toAccount = accounts.find(
        (account) => account.username === inputTransferTo.value
    );
    //making changes
    if (
        amount > 0 &&
        currentUser.balance >= amount &&
        accounts.map((acc) => acc.username).includes(toAccount?.username) &&
        toAccount.username !== currentUser.username
    ) {
        currentUser.movements.push(-amount);
        toAccount.movements.push(amount);
        currentUser.movementsDates.push(new Date().toISOString());
        toAccount.movementsDates.push(new Date().toISOString());
        //displaying movements, balance, summary
        displayMovBalSum(currentUser);

        //reset timer
        clearInterval(timer);
        timer = startLogoutTimer();
    }
    //clearing input fields and removing blur
    inputTransferTo.value = inputTransferAmount.value = "";
    inputTransferAmount.blur();
});

btnRequest.addEventListener("click", function (event) {
    event.preventDefault();
    const amount = Math.floor(inputRequestTo.value);
    if (
        amount > 0 &&
        currentUser.movements.some((mov) => mov >= amount * 0.1)
    ) {
        setTimeout(() => {
            currentUser.movements.push(amount);
            currentUser.movementsDates.push(new Date().toISOString());

            displayMovBalSum(currentUser);
            //reset timer
            clearInterval(timer);
            timer = startLogoutTimer();
        }, 2500);
    }
    inputRequestTo.value = "";
});

btnClose.addEventListener("click", function (event) {
    event.preventDefault();
    if (
        currentUser.username === inputCloseUsername.value &&
        currentUser.pin === +inputClosePin.value
    ) {
        accounts = accounts.filter(
            (account) => account.username != currentUser.username
        );
        app.style.opacity = 0;
    }
    //clearing input fields and removing blur
    inputLoginPin.value = inputLoginUsername.value = "";
    inputLoginPin.blur();
});

let sorted = false;
btnSort.addEventListener("click", function (event) {
    event.preventDefault();
    displayMovements(currentUser, !sorted);
    sorted = !sorted;
});

const arr = [1, 2, 3, 4, 5];
let arr1;
arr1 = [arr.splice(1, 2)];
console.log(arr1, arr);
console.log([1, 2, 3] + [4, 5]);
