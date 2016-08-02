'use strict'

const BASE_URL = process.env.URL || `https://angularjs.org/`
const NOW = Date.now()
const OUT_FILE = `./sitemap.json`
const TIMEOUT = 5000

const _ = require('lodash')
const async = require('async')
const fs = require('fs')
const path = require('path')
const selenium = require('selenium-standalone')
const webdriver = require('selenium-webdriver')
const by = webdriver.By
const until = webdriver.until

let urlsQueue = [BASE_URL]

selenium.start({}, (err, child) => {
  if (err) {
    console.error(err)
    return process.exit(1)
  }

  const driver = new webdriver.Builder()
                              .forBrowser('chrome')
                              .build()

  const findUrls = (url) => {
    driver.get(url)
    driver.findElements(by.css('[href], [src]'))
          .then((links) => {
            async.mapSeries(links, (link, done) => {
              link.getAttribute('href')
                  .then((url) => {
                    if (url) {
                      done(null, url)
                    } else {
                      link.getAttribute('src')
                          .then((url) => {
                            done(null, url)
                          })
                    }
                  })
            }, (err, urls) => {
              urlsQueue = urlsQueue.concat(urls)
            })
          })
  }
})

/* async.eachSeries(urls, (url, done) => {
                  let href = _.snakeCase(url)

                  driver.manage().window().setPosition(0, 0)
                  driver.get(url)
                        .then(() => {
                          driver.wait(() => {
                            return driver.findElement(by.id('webdriver-footer'))
                          }, TIMEOUT)
                                .then(() => {
                                  async.eachSeries(BREAKPOINTS, (breakpoint, done) => {
                                    driver.manage().window().setSize(breakpoint, HEIGHT)
                                    driver.wait(() => {
                                      return driver.manage().window().getSize().then((size) => {
                                        return size.width === breakpoint
                                      })
                                    }, TIMEOUT)
                                    .then(() => {
                                      return driver.executeScript(
                                        `var body = document.body, 
                                             html = document.documentElement; 
                                        return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)`
                                      )
                                    })
                                    .then((height) => {
                                      driver.manage().window().setSize(breakpoint, height)
                                      return driver.wait(() => {
                                        return driver.manage().window().getSize().then((size) => {
                                          return size.height === height
                                        })
                                      }, TIMEOUT)
                                    })
                                    .then(() => {
                                      driver.takeScreenshot()
                                            .then((data) => {
                                              let file = path.join(SCREENSHOT_DIR, `screenshot-${href}-${breakpoint}.png`)
                                              fs.writeFileSync(file, data.replace('data:image/png;base64,', ''), 'base64')
                                              done()
                                            })
                                    })
                                  }, done)
                                })
                        })
                }, (err) => {
                  if (err) {
                    console.error(err)
                  }

                  driver.quit()
                  child.kill()
                }) */
