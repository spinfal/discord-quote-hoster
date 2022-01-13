"use strict";

import { showToast } from './exports.js';

const username = document.querySelector('[name="username"]');
const password = document.querySelector('[name="password"]');
const button = document.getElementsByTagName('button')[0];

button.addEventListener('click', (e) => {
    button.disabled = true;
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            event: e,
            username: username.value,
            password: password.value
        })
    }).then(res => {
        switch (res.status) {
            case 204:
                showToast('Success', 'You have successfully logged in. Redirecting...');
                setTimeout(() => window.location.href = '/quotes', 3000);
                break;
            case 401:
                button.disabled = false;
                res.text().then(data => showToast('Error', data));
                break;
            default:
                button.disabled = false;
                showToast('Error', 'An unknown or internal error has occurred.');
                break;
        }
    });
});