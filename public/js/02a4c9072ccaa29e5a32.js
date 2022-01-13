"use strict";

const invite = document.getElementsByTagName('button')[0];
const deleteUser = document.getElementsByTagName('button')[1];
const wipeFiles = document.getElementsByTagName('button')[2];

window.onload = () => {
    // create invite
    invite.onclick = () => {
        fetch('/api/create/invites').then(res => {
            switch (res.status) {
                case 200:
                    res.text().then(invite => alert(`Generated new invite code: ${invite}`));
                    break;
                default:
                    alert('Something went wrong');
                    break;
            }
        });
    }
}