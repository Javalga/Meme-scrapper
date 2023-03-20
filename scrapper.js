const puppeteer = require('puppeteer');
const fs = require('fs')

const startScrapper = async (query, memesAmount = 1) => {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 800
  })

  let memes = []

  for (let index = 0; memes.length < memesAmount; index++) {
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

    console.log(`Encontrados ${newMemes.length} memes en la página ${index + 1}.`)
    console.log(`Encontrados ${memes.length} de ${memesAmount}`)

    const nextPage = async () => {
      try {
        await page.waitForSelector('button[aria-label="Go to next page"]')
        await page.$eval('button[aria-label="Go to next page"]', button => button.click())
      } catch (err) {
        return err
      }
    }

    try {
      nextPage()
    } catch (err) {
      console.log(err);
      console.log(`Esperando...`);
      page.waitForSelector('button[aria-label="Go to next page"]')
      nextPage()
    }
  };

  memes = memes.filter((image, index, array) => array.indexOf(image) === index)

  let currentDate = new Date()
  currentDate = currentDate.getTime()

  await writeJsonFile(`./memelog/${query}_${currentDate}.json`, memes)
  await console.log(`El resultado del scrapping ha sido de ${memes.length} resultados.`)

  await browser.close()
  const jsonResult = await readJSONFile(`./memelog/${query}_${currentDate}.json`)
  return jsonResult
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

  async function readJSONFile(file) {
    try {
      const data = await fs.promises.readFile(file, 'utf8');
      const json = JSON.parse(data);
      return json;
    } catch (err) {
      throw err;
    }
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


// TEMA Y NÚMERO DE MEMESÑ
// startScrapper('developer', 1000)