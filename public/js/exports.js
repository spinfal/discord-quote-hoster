export function showToast(title, text) {
    const wrapper = document.querySelector("#toast-wrapper");

    const toast = document.createElement("div");
    toast.classList = "toast";
    toast.innerHTML = `<div class="toast-title">${title}</div>
    <div class="toast-content">${text}</div>
    <div class="toast-timeline"></div>`;
    wrapper.appendChild(toast);
    setTimeout(() => wrapper.removeChild(toast), 3000);
}

export function filter() {
    var input, radios, radio_filter, text_filter, td0, i, divList;
    input = document.getElementById("search");
    text_filter = input.value.toUpperCase();
    divList = document.getElementsByTagName("div");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < divList.length; i++) {
        td0 = divList[i].getAttribute('data-users');
        if (td0) {
            if (td0.toUpperCase().indexOf(text_filter) > -1) {
                divList[i].style.display = "";
            } else {
                divList[i].style.display = "none";
            }
        }
    }
}