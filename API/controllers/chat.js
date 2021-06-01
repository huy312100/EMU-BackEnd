//const io = require("socket.io-client");
//const server = require("../../server");
const puppeteer = require("puppeteer");
exports.User_connect = async (req, res, next) => {

    async function autoScroll(page, finishTime) {
        await page.evaluate(async (finishTime) => {

            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || new Date().getTime() > finishTime) {

                        clearInterval(timer);
                        resolve();
                    }

                }, 120);
            });
        }, finishTime);
    }
    async function UI(url) {
        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url);
        selector_url = "";
        selector_date = "";
        if (url.includes("https")) {
            if (url.includes("bs.hcmiu")) { selector_url = ".news-list-header" }
            else { selector_url = ".entry-title a"; }
            if (url.includes("bt.hcmiu") || url.includes("it.hcmiu") || url.includes("math")) {
                selector_date = ".entry-date";
            }
            else if (url.includes("bm.hcmiu")) { selector_date = ".td-post-date" }
            else if (url.includes("iem.hcmiu") || (url.includes("ev.hcmiu"))) { selector_date = ".entry-date.published"; }
            else if (url.includes("bs.hcmiu")) { selector_date = ".new-date" }
        }
        else if (url.includes("see.hcmiu")) {
            selector_url = ".list-title a";
            selector_date = ".list-date.small";
        }
        else {
            selector_url = ".Title";
            selector_date = ".Date";
        }
        const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
            let items = document.querySelectorAll(selector_url);
            let dates = document.querySelectorAll(selector_date);
            let links = [];

            for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                if (items[i].hasAttribute("href") == false || dates[j].innerText == null) {
                    i++;
                    j++;
                }
                title_post = items[i].innerText;
                url_post = "";
                if (items[i].getAttribute("href").includes("edu.vn") == false) {
                    if (url.includes("bs.hcmiu")) {
                        url_post = url;
                    }
                    else {
                        url_post = url + items[i].getAttribute("href");
                    }
                }
                else {
                    url_post = items[i].getAttribute("href");
                }
                date_post = ""
                if (url.includes("it.hcmiu") || url.includes("math.hcmiu")) {
                    date_post = dates[j].querySelector(".day").innerText + "/" + dates[j].querySelector(".month").innerText + "/" + dates[j].querySelector(".year").innerText;
                }
                else {
                    date_post = dates[j].innerText;
                }
                links.push({
                    Title: title_post,
                    Link: url_post,
                    Date: date_post
                });
            }
            return links;
        }, { url, selector_url, selector_date });
        await page.close();
        await browser.close();
        return articles;
    }
    async function UT(url) {
        var has_date = ['fme.hcmut', 'che.hcmut', 'fenr.hcmut', 'cse.hcmut', 'fas.hcmut', 'iut.hcmut'];
        var non_date = ['geopet.hcmut', 'dee.hcmut', 'sim.edu', 'fmt.hcmut', 'dte.hcmut', 'pfiev.hcmut', 'fce.hcmut'];

        data_ut = has_date.concat(non_date);
        var selector_url = "";
        var selector_date = "";
        var head_data = url.split(".")
        var search = "";
        var selector_title = "";
        if (url.includes("www")) {
            search = head_data[1] + "." + head_data[2];
        }
        else {
            search = head_data[0].substring(head_data[0].indexOf('//') + 2) + "." + head_data[1];
        }
        index = data_ut.indexOf(search);
        switch (index) {
            case 0:
                selector_url = ".entry-title a"
                selector_date = ".entry-date.published"
                break;
            case 1:
                selector_url = ".heading.mt-3 a"
                selector_date = ".meta.mb-3 div:nth-child(1)"
                break;
            case 2:
                selector_url = ".no-padding"
                break;
            case 3:
                selector_url = ".post-title.justify-content a"
                selector_date = ".post-date"
                break;
            case 4:
                selector_url = ".heading.mt-3 a"
                selector_date = ".meta.mb-3"
                break;
            case 5:
                selector_url = ".entry-title.td-module-title a"
                selector_date = ".td-post-date"
                break;
            case 6:
                selector_url = ".title_post a"
                selector_date = ".date"
                break;
            case 7:
                selector_url = ".button1"
                selector_date = ".ngaydang"
                break;
            case 8:
                selector_url = ".blogsection";
                selector_date = ".createdate"
                break;
            case 9:
                selector_url = ".latestnews";
                selector_date = ".createdate"
                break;
            case 10:
                selector_url = ".title";
                selector_date = ".date";
                selector_title = ".tin_title"
                break;
            case 11:
                selector_url = ".title";
                selector_date = ".date";
                selector_title = ".tin_title"
                break;
        }
        if (url.includes("geopet") || url.includes("dee") || url.includes("sim.edu") || url.includes("fmt.hcmut") ||
            url.includes("dte.hcmut") || url.includes("pfiev.hcmut")) {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url);
            let articles = [];
            let urls = await page.evaluate(async ({ selector_url, selector_date, selector_title, url }) => {
                let items = await document.querySelectorAll(selector_url);

                let links = [];
                for (var i = 0; i < items.length && i < 10; ++i) {
                    if (!items[i].hasAttribute("href")) { i++; }
                    let head = items[i].getAttribute("href");
                    if (head.includes("edu.vn") == false) {
                        let head_url = url.split(".");
                        head = "";
                        if (url.includes("sim.edu")) {
                            head = "http://www.sim.edu.vn/" + items[i].getAttribute("href");
                        }
                        else if (url.includes("dte.hcmut")) {
                            head = "http://www.dte.hcmut.edu.vn/dte/" + items[i].getAttribute("href");
                        }
                        else if (url.includes("pfiev")) {
                            head = "http://www.pfiev.hcmut.edu.vn/pfiev/" + items[i].getAttribute("href");
                        }
                        else {
                            head = head_url[0] + "." + head_url[1] + "." + head_url[2] + ".edu.vn" + items[i].getAttribute("href");
                        }
                    }
                    links.push({
                        link: head,
                        selector_date: selector_date,
                        selector_title: selector_title
                    });
                };
                return links;
            }, { selector_url, url, selector_date });
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].link.includes("vnnull")) {
                    urls.splice(i, 1);
                    i--;
                }
            }
            let pagePromise = (link, selector_date, selector_title) => new Promise(async (resolve) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);
                const date = await newPage.evaluate(({ selector_date }) => {
                    let element = document.querySelector(selector_date)
                    if (element) {
                        return element.innerText
                    }
                    return '';
                }, { selector_date })
                let title = "";
                if (link.includes("dte.hcmut") || link.includes("pfiev")) {
                    title = await newPage.evaluate(({ selector_title }) => {
                        let element = document.querySelector(selector_title)
                        if (element) {
                            return element.innerText
                        }
                        return '';
                    }, { selector_title })
                }
                else {
                    title = await newPage.title();
                }

                dataObj['Title'] = await title;
                dataObj['Link'] = await newPage.url();
                dataObj['Date'] = await date;
                resolve(dataObj);
                await newPage.close();
            }, { selector_date, selector_title });
            for (var i = 0; i < urls.length && i < 10; i++) {
                let currentPageData = await pagePromise(urls[i].link, urls[i].selector_date, selector_title);
                date = currentPageData.Date;
                if (url.includes("geopet")) { date = date.split(" ")[3] }
                articles.push(
                    {
                        Title: currentPageData.Title,
                        Link: currentPageData.Link,
                        Date: date
                    });
            }
            await page.close();
            await browser.close();

            return articles;
        }
        else if (url.includes("che.hcmut") || url.includes("fas.hcmut")) {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url);
            await page.waitForTimeout(2 * 1000);
            let finishTime = new Date().getTime() + (15 * 1000);
            await autoScroll(page, finishTime);
            const articles = await page.evaluate(async ({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                head_url = url.split("/")[0] + "/" + url.split("/")[1];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                    title_post = items[i].innerText;
                    url_post = head_url + items[i].getAttribute("href");
                    date_post = dates[j].innerText;
                    if (date_post.includes("edu.vn") == false) {
                        date_post = date_post.split(" ")[0] + " " + date_post.split(" ")[1] + " " + date_post.split(" ")[2] + " " + date_post.split(" ")[3]
                    }
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { selector_url, selector_date, url });
            for (var i = 0; i < articles.length; i++) {
                if (articles[i].Title == "" || articles[i].Date == "") {
                    articles.splice(i, 1);
                    i--;
                }
            }
            await page.close();
            await browser.close();
            return articles;
        }
        else if (url.includes("fenr.hcmut")) {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto("http://fenr.hcmut.edu.vn/hl57/tin-tuc");
            const articles = await page.$eval("#wrapper > div > div > div > div > div.list_baiviet > ul",
                (ul, url) => {
                    let links = [];
                    for (let i = 0; i < ul.children.length; i++) {
                        links.push({
                            Title: ul.children[i].querySelector("a").innerText,
                            Link: "http://fenr.hcmut.edu.vn/" + ul.children[i].querySelector("a").getAttribute("href"),
                            Date: ul.children[i].querySelector("span").innerText
                        });
                    }
                    return links;
                }, url);
            await page.close();
            await browser.close();
            return articles;
        }
        else {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url);
            const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                    var title_post = items[i].innerText;
                    var url_post = "";
                    if (items[i].getAttribute("href").includes("edu.vn") == false) {
                        url_post = url + items[i].getAttribute("href");
                    }
                    else {
                        url_post = items[i].getAttribute("href");
                    }

                    var date_post = ""
                    if (url.includes("cse.hcmut")) {
                        date_post = dates[j].querySelector("span.post-date-day").innerText + " - " + dates[j].querySelector("span.post-date-month").innerText
                    }
                    else {
                        date_post = dates[j].innerText;
                    }
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post.slice(0, 18)
                    });
                }
                return links;
            }, { url, selector_url, selector_date });
            await page.close();
            await browser.close();
            return articles;
        }
    }
    async function US(url) {
        data = ['phys', 'geology', 'math', 'fit', 'fetel', 'mst', 'chemistry', 'fbb', 'environment', 'www.hcmus.edu.vn'];
        selector_url = "";
        selector_date = "";
        head_data = url.split(".")
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = ".blogpost.shadow-2.light-gray-bg.bordered header h2 a"
                selector_date = ".day"
                break;
            case 1:
                selector_url = ".sppb-articles-scroller-content a"
                selector_date = ".sppb-articles-scroller-meta-date-left"
                break;
            case 2:
                selector_url = ".mod-articles-category-title"
                selector_date = ".mod-articles-category-date"
                break;
            case 3:
                selector_url = ".post_title a"
                selector_date = ".day_month"
                break;
            case 4:
                selector_url = ".entry-title a"
                selector_date = ".entry-date.published"
                break;
            case 5:
                selector_url = ".show"
                selector_date = ".h5"
                break;
            case 6:
                selector_url = ".ns2-title"
                break
            case 7:
                selector_url = ".news_info";
                break;
            case 8:
                selector_url = ".name";
                break;
            case 9:
                selector_url = ".mod-articles-category-title";
                selector_date = ".mod-articles-category-date"
                break;
        }
        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url);
        if (url.includes("mst")) {
            let articles = [];
            let urls = await page.evaluate(async ({ selector_url, url }) => {
                let items = await document.querySelectorAll(selector_url);

                let links = [];
                for (var i = 0; i < items.length; ++i) {
                    let head = items[i].getAttribute("href");
                    let head_url = url.split(".");
                    head = head_url[0] + "." + head_url[1] + "." + head_url[2] + ".edu.vn" + head;
                    links.push(head);
                };
                return links;
            }, { selector_url, url });
            let pagePromise = (link) => new Promise(async (resolve) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);
                const elementTextContent = await newPage.evaluate(() => {
                    const element = document.querySelector('.h5')
                    if (element) {
                        return element.textContent
                    }
                    return '';
                })
                dataObj['Title'] = await newPage.title();
                dataObj['Link'] = await newPage.url();
                dataObj['Date'] = await elementTextContent;
                resolve(dataObj);
                await newPage.close();
            });
            for (link in urls) {
                let currentPageData = await pagePromise(urls[link]);
                articles.push(
                    {
                        Title: currentPageData.Title,
                        Link: currentPageData.Link,
                        Date: currentPageData.Date.split(" ")[3]
                    });
            }
            await page.close();
            await browser.close();
            return articles;
        }
        else if (url.includes("chemistry") || url.includes("environment") || url.includes("fbb")) {
            const articles = await page.evaluate(async ({ selector_url, url }) => {
                let items = await document.querySelectorAll(selector_url);

                let links = [];
                for (var i = 0; i < items.length; ++i) {
                    let title;
                    if (url.includes("environment") || url.includes("chemistry")) {
                        title = items[i].querySelector("a").innerText
                    }
                    else { title = items[i].querySelector("h3 a").innerText }
                    if (!items[i].querySelector("span") && (url.includes("environment") || url.includes("chemistry"))) { i++ }
                    let head;
                    if (url.includes("fbb")) {
                        head = items[i].querySelector("h3 a").getAttribute("href");
                    }
                    else { head = items[i].querySelector("a").getAttribute("href"); }
                    if (!head.includes("edu.vn")) {
                        let head_url = url.split(".");
                        head = head_url[0] + "." + head_url[1] + "." + head_url[2] + ".vn" + head;
                    }
                    let time;
                    if (url.includes("environment") || url.includes("chemistry")) { time = items[i].querySelector("span").innerText }
                    else { time = items[i].querySelector('div.news_dc div.date_news').innerText.slice(7, 17) }
                    if (url.includes("chemistry")) {
                        time = time.split(" ")[1]
                    }
                    else if (url.includes("environment")) {
                        time = time.split(" ")[0].slice(1);
                    }
                    links.push({
                        Title: title,
                        Link: head,
                        Date: time
                    });
                };
                return links;
            }, { selector_url, url });
            await page.close();
            await browser.close();
            return articles;
        }
        else {
            const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i = i + 1, j = j + 1) {
                    var url_post = "";
                    url_post = items[i].getAttribute("href");
                    if (url_post.includes("edu.vn") == false) {

                        if (url.includes("geology")) {
                            url_post = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + ".vn" + url_post;
                        }
                        else if (url.includes("fit")) {
                            url_post = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + "." + url.split(".")[3] + ".vn/vn/" + url_post;
                        }
                        else {
                            url_post = url + url_post;
                        }
                    }

                    var title_post = "";
                    if (url.includes("geology")) {
                        title_post = items[i].querySelector("div > div.sppb-articles-scroller-date-left-content > div.sppb-addon-articles-scroller-title").innerText;
                    }
                    else {
                        title_post = items[i].innerText;
                    }

                    var date_post = "";
                    if (url.includes("phys")) {
                        date_post = (dates[j].innerText);
                        date_post = date_post.split(" ")[0];
                    }
                    else if (url.includes("geology")) {
                        date_post = dates[j].querySelector("span.sppb-articles-scroller-day").innerText + "/" + dates[j].querySelector("span.sppb-articles-scroller-month").innerText + "/2021";
                    }
                    else {
                        date_post = dates[j].innerText;
                    }
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { url, selector_url, selector_date });
            await page.close();
            await browser.close();
            return articles;
        }
    }
    async function USSH(url) {
        data = ['baochi', 'dulich', 'dongphuong', 'managementscience', 'luutru', 'nhh', 'lichsu', 'nhanhoc', 'fir', 'tamly',
            'lib', 'triethoc', 'khoavanhoc', 'vns', 'xhh', 'tttongiao', '']
        var selector_url = "";
        var selector_date = "";
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = ".title_topicdisplay"
                break;
            case 1:
                selector_url = ".title_topicdisplay"
                break;
            case 2:
                selector_url = ".title_topicdisplay"
                break;
            case 3:
                selector_url = ".title_tt a";
                selector_date = ".datetime";
                break;
            case 4:
                selector_url = ".title_topicdisplay"
                break;
            case 5:
                selector_url = ".title_topicdisplay"
                break;
            case 6:
                selector_url = ".title_topicdisplay"
                break;
            case 7:
                selector_url = ".title_topicdisplay"
                break;
            case 8:
                selector_url = ".title_topicdisplay"
                break;
            case 9:
                selector_url = ".title_topicdisplay"
                break;
            case 10:
                selector_url = ".title_topicdisplay"
                break;
            case 11:
                selector_url = ".text.p-4.d-block a"
                selector_date = ".meta.mb-3 div:nth-child(1) a";
                break;
            case 12:
                selector_url = ".entry-header h2 a";
                selector_date = ".create time";
                break;
            case 13:
                selector_url = ".page-header h2 a";
                selector_date = ".published.hasTooltip time";
                break;
            case 14:
                selector_url = ".title_topicdisplay"
                break;
            case 15:
                selector_url = ".title_topicdisplay"
                break;

        }
        if (index = 11) {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            await page.waitForTimeout(2000);
            const finishTime = new Date().getTime() + (11 * 1000);
            await autoScroll(page, finishTime);
            const articles = await page.evaluate(({ selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i += 2, j += 2) {
                    title_post = items[i].querySelector("h3").innerText;
                    url_post = "https://hcmussh.edu.vn" + items[i].getAttribute("href");
                    date_post = dates[j].innerText;
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { selector_url, selector_date });
            await page.close();
            await browser.close();
            return articles;
        }
        else if (index in [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 14, 15]) {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url);
            const articles = await page.evaluate(async ({ url, selector_url }) => {
                let items = document.querySelectorAll(selector_url);
                let links = [];
                for (var i = 0; i < items.length; i++) {

                    var title_post = items[i].innerText;
                    var url_post = "";
                    if (items[i].getAttribute("href").includes("edu.vn") == false) {
                        url_post = url.split("/")[0] + "/" + url.split("/")[1] + "/" + url.split("/")[2] + items[i].getAttribute("href");
                    }
                    else {
                        url_post = items[i].getAttribute("href");
                    }
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: ""
                    });
                }
                return links;
            }, { url, selector_url });
            await page.close();
            await browser.close();
            return articles;
        }
        else if (index == 3 || index == 12 || index == 13) {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                    title_post = items[i].innerText;
                    url_post = url + items[i].getAttribute("href");
                    date_post = dates[j].innerText;
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { url, selector_url, selector_date });
            await page.close();
            await browser.close();
            return articles;
        }
    }

    async function UIT(url) {
        data = ['fit', 'httt', 'cs', 'se', 'ktmt', 'nc', 'ecommerce']
        var selector_url = "";
        var selector_date = "";
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = ".title a";
                selector_date = ".meta time"
                break;
            case 1:
                selector_url = ".thumb.thumb-lay-two.cat-3 h3 a";
                selector_date = ".thumb.thumb-lay-two.cat-3 span";
                break;
            case 2:
                selector_url = ".entry-header > a";
                selector_date = ".entry-date > a"
                break;
            case 3:
                selector_url = ".gn_static.gn_static_1 > span > a";
                selector_date = ".gn_static.gn_static_1";
                break;
            case 4:
                selector_url = ".list-title a";
                selector_date = ".list-date";
                break;
            case 5:
                selector_url = ".entry-title.td-module-title a";
                selector_date = ".entry-date.updated.td-module-date"
                break;
            case 6:
                selector_url = ".entry-title a";
                selector_date = ".entry-date.published"
                break;
        }
        if (index in [0, 1, 2, 3, 4, 5, 6]) {
            const browser = await puppeteer.launch({
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                head = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + ".vn"
                for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                    title_post = "";
                    if (url.includes("cs")) {
                        title_post = items[i].querySelector("h1").innerText;
                    }
                    else {
                        title_post = items[i].innerText;
                    }
                    url_post = items[i].getAttribute("href");
                    if (url_post.includes("edu.vn") == false) {
                        url_post = head + url_post;
                    }
                    date_post = dates[j].innerText;
                    if (url.includes("se")) {
                        date_post = date_post.slice(-13).replace("\n", "");
                    }
                    links.push({
                        Title: title_post,
                        Link: head + url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { url, selector_url, selector_date });
            for (var i = 0; i < articles.length; i++) {
                if (articles[i].Title == "") {
                    articles.splice(i, 1);
                    i--;
                }
            }
            await page.close();
            await browser.close();
            return articles;
        }

    }

    async function UEL(url) {
        data = ['//kt.uel', 'ktdn', 'fb.uel', 'ktkt', 'is', 'qtkd', 'law', 'lkt', 'maths']


        var selector_url = "";
        var selector_date = "";
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = "a.title_topicdisplay";
                selector_date = "h4 > span";
                break;
            case 1:
                selector_url = "a.title_topicdisplay";
                selector_date = "h4 > span";
                break;
            case 2:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 3:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 4:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 5:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 6:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 7:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 8:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
        }
        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
            let items = document.querySelectorAll(selector_url);
            let dates = document.querySelectorAll(selector_date);
            let links = [];
            //head = url.split(".")[0]+ "." + url.split(".")[1] + "." +url.split(".")[2]+ ".vn"
            for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                title_post = items[i].innerText;
                url_post = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + ".vn" + items[i].getAttribute("href");
                date_post = dates[j].innerText;
                links.push({
                    Title: title_post,
                    Link: url_post,
                    Date: date_post
                });
            }
            return links;
        }, { url, selector_url, selector_date });

        await page.close();
        await browser.close();
        return articles;
    }

    async function MEDVNU(url) {
        var selector_url = ".news-title a";
        var selector_date = ".date";
        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
            let items = document.querySelectorAll(selector_url);
            let dates = document.querySelectorAll(selector_date);
            let links = [];
            for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                title_post = items[i].innerText;
                url_post = items[i].getAttribute("href");
                date_post = dates[j].innerText;
                links.push({
                    Title: title_post,
                    Link: url_post,
                    Date: date_post
                });
            }
            return links;
        }, { url, selector_url, selector_date });

        await page.close();
        await browser.close();
        return articles;
    }

    async function AGU(url) {
        data = ['agri', 'tech', 'fit', 'peda', 'feba', 'fpe', 'ffl', 'fac']


        var selector_url = "";
        var selector_date = "";
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = ".entry-title a";
                selector_date = ".entry-date.published";
                break;
            case 1:
                selector_url = ".title a";
                selector_date = ".meta_date";
                break;
            case 2:
                selector_url = ".post-entry-meta-title > h2 > a";
                selector_date = ".post-date"
                break;
            case 3:
                selector_url = ".blog-details > h4 > a";
                selector_date = ".blog-meta"
                break;
            case 4:
                selector_url = ".feba-postheader span a";
                selector_date = ".art-postdateicon"
                break;
            case 5:
                selector_url = ".node.node-article.node-promoted.node-teaser.clearfix  > header > h4 > a";
                selector_date = ".submitted > span:nth-child(2)"
                break;
            case 6:
                selector_url = "h2.title > a";
                selector_date = "span.submitted > span"
                break;
            case 7:
                selector_url = ".art-postheader a";
                selector_date = ".art-postheadericons.art-metadata-icons"
                break;
        }
        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
            let items = document.querySelectorAll(selector_url);
            let dates = document.querySelectorAll(selector_date);
            let links = [];
            head = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + ".vn"
            for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                title_post = "";
                if (url.includes("feba")) {
                    title_post = items[i].getAttribute("title");
                }
                else {
                    title_post = items[i].innerText;
                }
                url_post = items[i].getAttribute("href");
                if (title_post.includes("edu.vn") == false) {
                    url_post = head + url_post;
                }
                date_post = dates[j].innerText;
                if (url.includes("ffl")) {
                    date_post = date_post.slice(-18);
                }
                else if (url.includes("fac")) {
                    date_post = date_post.slice(0, -7);
                }
                links.push({
                    Title: title_post,
                    Link: url_post,
                    Date: date_post
                });
            }
            return links;
        }, { url, selector_url, selector_date });

        await page.close();
        await browser.close();
        return articles;
    }

    async function Crawl_Data(url) {
        let articles = [];
        if (url.includes("hcmut") || url.includes("www.sim.edu.vn")) {
            articles = await UT(url);
        }
        else if (url.includes("hcmus")) {
            articles = await US(url)
        }
        else if (url.includes("hcmussh") || url.includes("www.managescience.edu") || url.includes("www.khoahoc-ngonngu.edu.vn") || url.includes("vns.edu.vn")) {
            articles = await USSH(url);
        }
        else if (url.includes("hcmui")) {
            articles = await UI(url);
        }
        else if (url.includes("uit")) {
            articles = await UIT(url);
        }
        else if (url.includes("uel")) {
            articles = await UEL(url);
        }
        else if (url.includes("medvnu")) {
            articles = await MEDVNU(url);
        }
        else if (url.includes("agu.edu.vn")) {
            articles = await AGU(url);
        }
        //console.log(articles);
        return articles;

    }
    try{
        var a = await Crawl_Data(req.body.url);
    console.log(a);
    if (a !== undefined) {
        res.status(200).json(a);
    }
    else {
        res.status(500).json({ error: "err" });
    }
    }catch(error){
        res.status(500).json({ error: "err" });
    }
    


};

exports.Client_Socket = (req, res, next) => {

}
