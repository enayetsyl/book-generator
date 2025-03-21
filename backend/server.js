const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

const upload = multer({ dest: 'temp/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send({
    Message: "Book Generator server is running correctly",
  });
});
// Endpoint to recepive the book creation request
app.post('/create-book', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pageImages', maxCount: 100 },
  { name: 'publisherLogo', maxCount: 1 }
]), async (req, res) => {
  let tempFiles = [];
  try {
    const { title, texts, language, leftMargin, textColor, publisherName, imageTextRatio, fontSize } = req.body;
    // console.log('Received data:', title, texts, language, leftMargin, textColor, publisherName, imageTextRatio, fontSize);
    // console.log(texts.length)
    console.log('left margin', leftMargin)
    console.log("Received leftMargin:", leftMargin, typeof leftMargin);

    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;
    const pageImages = req.files.pageImages || [];
    const publisherLogo = req.files.publisherLogo ? req.files.publisherLogo[0] : null;
    const tempDir = path.join(__dirname, 'temp');

    

    await fs.ensureDir(tempDir);
    console.log('Step 1: Ensure temp directory exists');

    const handleImage = async (image, newName, index) => {
      const imagePath = path.join(tempDir, newName);
      tempFiles.push(imagePath);

      const metadata = await sharp(image.path).metadata();
      if (metadata.width <= metadata.height) {
        throw new Error(`Image ${index + 1} is not in landscape orientation`);
      }

      if (image.mimetype === 'image/webp') {
        await sharp(image.path).toFormat('jpeg').toFile(imagePath);
      } else {
        await fs.rename(image.path, imagePath);
      }

      return imagePath;
    };

    const coverImagePath = coverImage ? await handleImage(coverImage, `${title}_cover_page.jpg`, -1) : null;
    const pageImagePaths = await Promise.all(pageImages.map((img, index) => handleImage(img, `${title}_page_${index + 1}.jpg`, index)));
    const publisherLogoPath = publisherLogo ? await handleImage(publisherLogo, `${title}_publisher_logo.jpg`, -1) : null;
    console.log('Step 1: Finished image handling and conversion');

    // console.log("Raw Texts:", texts);
    const textsArray = JSON.parse(texts);
    // console.log("Parsed Texts Array Length:", textsArray.length);
    


    if (textsArray.length !== pageImagePaths.length) {
      throw new Error('The number of texts and page images must be equal');
    }

    const imageHeightRatio = parseFloat(imageTextRatio.split('/')[0]) / 100;
    const textHeightRatio = parseFloat(imageTextRatio.split('/')[1]) / 100;

    const pdfPath = path.join(tempDir, `${title}.pdf`);
    tempFiles.push(pdfPath);

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, autoFirstPage: false });

    const bengaliFontPath = path.join(__dirname, 'fonts', 'kalpurush.ttf');
    doc.registerFont('Bengali', bengaliFontPath);

    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);

    console.log('Create PDF started');

    if (coverImagePath) {
      doc.addPage().image(coverImagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
      if (title) {
        const textWidth = doc.page.width * 0.7;
        const textX = (doc.page.width - textWidth) / 2;
        doc.rect(textX, doc.page.height * 0.6, textWidth, doc.page.height * 0.15).fillOpacity(0.8).fill('black');
        doc.fontSize(36)
          .fillColor('white')
          .font(language === 'bengali' ? 'Bengali' : 'Helvetica')
          .text(title, textX + 20, doc.page.height * 0.6 + 20, { align: 'center', width: textWidth - 40 });
      }
    }
    console.log('Cover Page created');

    pageImagePaths.forEach((imagePath, index) => {
      // Determine the printing page number.
      // If a cover exists, the first inner page becomes page 2.
      const pageNum = coverImagePath ? index + 2 : index + 1;
      const innerMargin = 40;
      let marginLeft = 0;
      // For odd pages, we want the margin on the left (binding side).
      // For even pages, the binding is on the right so no left margin is needed.
      if (pageNum % 2 === 1) {
        marginLeft = innerMargin;
      } else {
        marginLeft = 0;
      }
      
      // Calculate the available width by subtracting the inner margin.
      const availableWidth = doc.page.width - innerMargin;
    
      // Add a new page.
      doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 });
      
      // Place the image: start at marginLeft so that on odd pages the content is shifted right.
      doc.image(imagePath, marginLeft, 0, { width: availableWidth, height: doc.page.height * imageHeightRatio });
      
      // Draw a white rectangle for the text background.
      doc.rect(marginLeft, doc.page.height * imageHeightRatio, availableWidth, doc.page.height * textHeightRatio)
        .fill('white');
      
      // Write the text within the text area.
      doc.fontSize(fontSize || 18)
        .fillColor(textColor || 'black')
        .font(language === 'bengali' ? 'Bengali' : 'Helvetica')
        .text(textsArray[index], marginLeft, doc.page.height * imageHeightRatio + 15, { width: availableWidth - 30 });
    });
    
    console.log('Individual Pages created');

    if (coverImagePath) {
      doc.addPage().image(coverImagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
      doc.rect(0, 0, doc.page.width, doc.page.height).fillOpacity(0.6).fill('white');
      if (publisherLogoPath) {
        doc.image(publisherLogoPath, doc.page.width / 2 - 50, doc.page.height * 0.6 - 50, { fit: [100, 100], align: 'center' });
      }
      if (publisherName) {
        const textWidth = doc.widthOfString(publisherName);
        const rectWidth = textWidth + 40;
        const rectX = (doc.page.width - rectWidth) / 2;
        doc.rect(rectX, doc.page.height * 0.7, rectWidth, doc.page.height * 0.1).fillOpacity(0.8).fill('black');
        doc.fontSize(20)
          .fillColor('white')
          .font(language === 'bengali' ? 'Bengali' : 'Helvetica')
          .text(publisherName, rectX + 20, doc.page.height * 0.7 + 20, { align: 'center', width: textWidth + 10 });
      }
    }

    doc.end();
    console.log('Back Page created and PDF finalized');

    pdfStream.on('finish', async () => {
      console.log('PDF stream finished');
      const pdfData = await fs.readFile(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="book.pdf"`);
      res.send(pdfData);

      await cleanupFiles(tempFiles);
    });

    req.on('aborted', async () => {
      console.log('Request aborted by the client');
      await cleanupFiles(tempFiles);
    });

  } catch (error) {
    console.error('Error in processing:', error.message);
    res.status(400).send({ error: error.message });

    await cleanupFiles(tempFiles);
  }
});


const cleanupFiles = async (files) => {
  try {
    await Promise.all(files.map(async (file) => {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }));
    console.log('Temporary files cleaned up successfully.');
  } catch (cleanupError) {
    console.error('Error during cleanup:', cleanupError.message);
  }
};


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
