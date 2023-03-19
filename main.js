const puppeteer = require('puppeteer');
const fs = require('fs')

const startScrapper = async (query) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const scrappingSitesURL = {
      reddit: "https://www.reddit.com/r/memes/search/?q=",
      ninegag: "https://9gag.com/search?query=",
      memebase: "https://search.cheezburger.com/#"
    }
    const page = await browser.newPage();
    const memes = {
      reddit: [],
      ninegag: [],
      memebase: []
    }
    for (let key in scrappingSitesURL) {
      console.log(key);
      switch (key) {
        case "reddit":
          await page.goto(scrappingSitesURL[key] + query);
          await page.waitForSelector('img');
          memes[key].push(...new Set(await page.$$eval('img', img => img.map(img => img.src))));
          break;
        case "ninegag":
          await page.goto(scrappingSitesURL[key] + query);
          await page.waitForSelector('img');
          memes[key].push(...new Set(await page.$$eval('img', img => img.map(img => img.src))));
          break;
        case "memebase":
          await page.goto(scrappingSitesURL[key] + query);
          await page.waitForSelector('.resp-media');
          memes[key].push(...new Set(await page.$$eval('.resp-media', img => img.map(img => img.src))));
          break;
      }
    }
    // console.log(`Scrapping is done, number of memes collected is ${memes.reduce((acc, current) => { return acc + current.src.length })}`);
    // const memesJson = await JSON.parse(memes)
    let currentDate = new Date()
    currentDate = currentDate.getTime()
    writeJsonFile(`memes_${currentDate}.json`, memes)

  } catch (err) {
    console.log(err);
  }

}

async function writeJsonFile(filePath, data) {
  try {
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(data),
      { flag: 'wx' }
    );
    console.log('JSON file saved successfully.');
    fs.readFile(filePath, (err, data) => {
      if (err) throw err
      const jsonData = JSON.parse(data)
      console.table(jsonData);
    })

  } catch (error) {
    console.error('Error writing JSON file:', error);
  }
}

startScrapper('cats')
