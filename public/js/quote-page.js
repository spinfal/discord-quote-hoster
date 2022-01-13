"use strict";

import { filter } from "./exports.js";


window.onload = () => {
    document.getElementById('file').addEventListener('change', (e) => {
        document.getElementsByTagName('label')[0].innerText = e.target.files[0].name;
    });

    document.getElementById('search').addEventListener('keyup', () => {
        filter();
    });
};