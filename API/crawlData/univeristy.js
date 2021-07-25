const puppeteer = require("puppeteer");

exports.Univeristy_QST = async () => {
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

    async function getMainPageNews(url) {
        list_page = ['hcmut.edu.vn', 'hcmus.edu.vn', 'hcmussh.edu.vn', 'hcmiu.edu.vn', 'uit.edu.vn', 'uel.edu.vn', 'agu.edu.vn']
        let index = 0;
        for (var i = 0; i < list_page.length; i++) {
            if (url.includes(list_page[i])) {
                index = i;
                break;
            }
        }
        selector_url = "";
        selector_date = "";
        switch (index) {
            case 0:
                selector_url = ".style1_ex1"
                selector_date = ".date"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url)
                    let articles = []
                    let urls = await page.evaluate(async ({ selector_url, selector_date }) => {
                        let items = await document.querySelectorAll(selector_url)
                        let links = []
                        for (var i = 0; i < items.length; ++i) {
                            let head = items[i].getAttribute("href")
                            links.push({
                                link: head,
                                selector_date: selector_date
                            });
                        };
                        return links
                    }, { selector_url, selector_date })
                    let pagePromise = (link, selector_date) => new Promise(async (resolve) => {
                        let dataObj = {}
                        let newPage = await browser.newPage()
                        await newPage.goto(link)
                        let date = await newPage.evaluate(({ selector_date }) => {
                            let element = document.querySelector(selector_date)
                            if (element) {
                                return element.innerText
                            }
                            return ''
                        }, { selector_date })
                        date = date.split(" ")[3] + " " + date.split(" ")[4].slice(0, -1)
                        dataObj['Title'] = await newPage.title()
                        dataObj['Link'] = await newPage.url()
                        dataObj['Date'] = await date
                        resolve(dataObj)
                        await newPage.close();
                    }, { selector_date })
                    for (var i = 0; i < urls.length; i++) {
                        let currentPageData = await pagePromise(urls[i].link, urls[i].selector_date);
                        articles.push(
                            {
                                Title: currentPageData.Title,
                                Link: currentPageData.Link,
                                Date: currentPageData.Date
                            });
                    }
                    await page.close()
                    await browser.close()
                    return articles
                }
            case 1:
                selector_url = ".mod-articles-category-title"
                selector_date = ".mod-articles-category-date"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url)
                    const articles = await page.evaluate(({ selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url)
                        let dates = document.querySelectorAll(selector_date)
                        let links = []
                        for (var i = 0, j = 0; i < items.length, j < dates.length, i <= 15, j <= 15; i++, j++) {
                            title_post = items[i].innerText
                            url_post = "https://hcmus.edu.vn" + items[i].getAttribute("href");
                            date_post = dates[j].innerText.split(" ")[1].slice(0, -1)
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            })
                        }
                        return links;
                    }, { selector_url, selector_date })
                    await page.close()
                    await browser.close()
                    console.log(articles)
                    return articles;
                }
            case 2:
                selector_url = ".d-flex.flex-column.justify-content-between"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url)
                    await page.waitForTimeout(2000)
                    const finishTime = new Date().getTime() + (10 * 1000)
                    await autoScroll(page, finishTime)
                    const articles = await page.evaluate(({ selector_url }) => {
                        let items = document.querySelectorAll(selector_url)
                        let links = []
                        for (var i = 0; i < items.length, i <= 10; i++) {
                            title_post = items[i].querySelector("div.text.mb-2 > a > h4").innerText
                            url_post = "https://hcmussh.edu.vn/" + items[i].querySelector("div.text.mb-2 > a").getAttribute("href")
                            date_post = items[i].querySelector("div:nth-child(3) > a").innerText.trimStart()
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            });
                        }
                        return links
                    }, { selector_url })
                    await page.close()
                    await browser.close()
                    console.log(articles)
                    return articles
                }
            case 3:
                selector_url = "div.item-content h3 a"
                selector_date = "div.date-block.main-color-2-bg.dark-div"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url)
                    const articles = await page.evaluate(({ selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url)
                        let dates = document.querySelectorAll(selector_date)
                        let links = []
                        for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                            title_post = items[i].innerText
                            url_post = items[i].getAttribute("href")
                            date_post = dates[j].querySelector("div.month").innerText + " " + dates[j].querySelector("div.day").innerText
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            })
                        }
                        return links;
                    }, { selector_url, selector_date })
                    await page.close()
                    await browser.close()
                    return articles;
                }
            case 4:
                selector_url = "div.post-title h2 a";
                selector_date = ".post-date";
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage();
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url);
                        let dates = document.querySelectorAll(selector_date);
                        let links = [];
                        for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                            title_post = items[i].innerText
                            url_post = items[i].getAttribute("href")
                            date_post = dates[j].innerText.trimStart()
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
                    console.log(articles)
                    return articles;
                }
            case 5:
                selector_url = ".title_topicdisplay"
                selector_date = "h4 > span"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url, { waitUntil: 'networkidle2' })
                    const articles = await page.evaluate(({ selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url)
                        let dates = document.querySelectorAll(selector_date)
                        let links = []
                        for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                            title_post = items[i].innerText
                            url_post = "https://www.uel.edu.vn/" + items[i].getAttribute("href")
                            date_post = dates[j].innerText.slice(0, -1).substring(1);
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            });
                        }
                        return links
                    }, { selector_url, selector_date })
                    await page.close()
                    await browser.close()
                    console.log(articles)
                    return articles;
                }
            case 6:
                selector_url = ".blog-details h4 a"
                selector_date = ".blog-meta"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage();
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url);
                        let dates = document.querySelectorAll(selector_date);
                        let links = [];
                        for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                            title_post = items[i].innerText
                            url_post = "https://www.agu.edu.vn/" + items[j].getAttribute("href")
                            date_post = dates[j].innerText
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
                    //console.log(articles)
                    return articles;
                }
        }
    }
};