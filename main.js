const puppeteer = require('puppeteer');
const fs = require('fs')

const startScrapper = async (query, pagesAmount) => {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 800
  })

  let memes = []

  for (let index = 0; index < pagesAmount; index++) {
    console.log(`Attempt page: ${index}`);
    if (index === 0)
      await page.goto(`https://search.cheezburger.com/#${query}/filter/image`);
    else await page.goto(`https://search.cheezburger.com/#${query}/page/${index + 1}/filter/image`);
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newMemes = await page.evaluate(() => {
      const imageElements = document.querySelectorAll('img:not(.lazyload)');
      return Array.from(imageElements).map(img => img.src)
    })

    memes.push(...newMemes)

    console.log(`Encontradas ${newMemes.length} imágenes en la página ${index + 1}.`)
    await page.$eval('button[aria-label="Go to next page"]', button => button.click())
  };
  memes = memes.filter((image, index, array) => array.indexOf(image) === index)

  let currentDate = new Date()
  currentDate = currentDate.getTime()
  await writeJsonFile(`${query}_${currentDate}.json`, memes)
  await console.log(`El resultado del scrapping ha sido de ${memes.length} resultados.`)
  await browser.close()
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
      console.log(jsonData);
    })

  } catch (error) {
    console.error('Error writing JSON file:', error);
  }
}

// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       let distance = 10000;
//       let timer = setInterval(() => {
//         let scrollHeight = document.body.scrollHeight;
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= scrollHeight - window.innerHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 100);
//     });
//   });
// }
// REPLACE CATS FOR THE KEYWORD OF THE MEME U WANT TO SEARCH FOR
startScrapper('cats', 50)