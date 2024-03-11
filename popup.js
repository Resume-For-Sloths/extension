// window.open('http://resumeforsloths.info:8501/')

let domain = 'http://resumeforsloths.info'
let cookie_name = 'userdetails'

function getCookies(domain, cookie_name, callback) {
    chrome.cookies.get({"url": domain, "name": cookie_name}, function(cookie) {
        if(callback) {
            callback(cookie);
        }
    });
}

getCookies(domain, cookie_name, function(cookie) {
    console.dir(decodeURIComponent(cookie.value));
});
