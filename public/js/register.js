"use strict";

import { showToast } from './exports.js';

window.onload = () => {
    const button = document.getElementsByTagName('button')[0];
    
    document.getElementsByTagName("button")[0].onclick = () => {
        const username = document.querySelector('[name="username"]').value;
        const password = document.querySelector('[name="password"]').value;
        const invite = document.querySelector('[name="invite"]').value;

        if (username === "" || password === "" || invite === "") return showToast("Error", "Please fill in all fields");
        fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username, password: password, invite: invite })
        }).then(res => {
            switch (res.status) {
                case 204:
                    showToast('Success', `You may now login as ${username}. Redirecting...`);
                    setTimeout(() => window.location.href = '/', 3000);
                    break;
                case 400:
                    button.disabled = false;
                    res.text().then(data => showToast('Error', data));
                    break;
                case 401:
                    button.disabled = false;
                    res.text().then(data => showToast('Error', data));
                    break;
                case 409:
                    button.disabled = false;
                    res.text().then(data => showToast('Error', data));
                    break;
                default:
                    button.disabled = false;
                    showToast('Error', 'An unknown or internal error has occurred.');
                    break;
            }
        });
    };
}