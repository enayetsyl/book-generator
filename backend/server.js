const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req, res) => {
  res.send({
    Message: "Book Generator server is running correctly",
  });
});

// Book creation endpoint
app.post('/create-book', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pageImages', maxCount: 100 },
  { name: 'publisherLogo', maxCount: 1 }
]), async (req, res) => {
  let tempFiles = [];
  try {
    const { title, texts, language, leftMargin, textColor, publisherName, imageTextRatio, fontSize } = req.body;
    console.log('Received data:', title, texts, language, leftMargin, textColor, publisherName, imageTextRatio, fontSize);

    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;
    const pageImages = req.files.pageImages || [];
    const publisherLogo = req.files.publisherLogo ? req.files.publisherLogo[0] : null;
    const tempDir = path.join('/tmp'); // Use /tmp for Vercel

    await fs.ensureDir(tempDir);
    console.log('Step 1: Ensure temp directory exists');

    const handleImage = async (image, newName, index) => {
      const imagePath = path.join(tempDir, newName);
      tempFiles.push(imagePath);

      const metadata = await sharp(image.buffer).metadata();
      if (metadata.width <= metadata.height) {
        throw new Error(`Image ${index + 1} is not in landscape orientation`);
      }

      if (image.mimetype === 'image/webp') {
        await sharp(image.buffer)
          .toFormat('jpeg')
          .toFile(imagePath);
      } else {
        await fs.writeFile(imagePath, image.buffer);
      }

      return imagePath;
    };

    const coverImagePath = coverImage ? 
      await handleImage(coverImage, `${title}_cover_page.jpg`, -1) : null;
    const pageImagePaths = await Promise.all(
      pageImages.map((img, index) => 
        handleImage(img, `${title}_page_${index + 1}.jpg`, index)
      )
    );
    const publisherLogoPath = publisherLogo ? 
      await handleImage(publisherLogo, `${title}_publisher_logo.jpg`, -1) : null;
    console.log('Step 1: Finished image handling and conversion');

    const textsArray = JSON.parse(texts);
    if (textsArray.length !== pageImagePaths.length) {
      throw new Error('The number of texts and page images must be equal');
    }

    const imageHeightRatio = parseFloat(imageTextRatio.split('/')[0]) / 100;
    const textHeightRatio = parseFloat(imageTextRatio.split('/')[1]) / 100;

    const pdfPath = path.join(tempDir, `${title}.pdf`);
    tempFiles.push(pdfPath);

    const doc = new PDFDocument({ 
      size: 'A4', 
      layout: 'landscape', 
      margin: 0, 
      autoFirstPage: false 
    });

    // Load Bengali font
    const bengaliFontPath = path.join(process.cwd(), 'fonts', 'kalpurush.ttf');
    doc.registerFont('Bengali', bengaliFontPath);

    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);

    console.log('Create PDF started');

    // Create cover page
    if (coverImagePath) {
      doc.addPage().image(coverImagePath, 0, 0, { 
        width: doc.page.width, 
        height: doc.page.height 
      });
      if (title) {
        const textWidth = doc.page.width * 0.7;
        const textX = (doc.page.width - textWidth) / 2;
        doc.rect(textX, doc.page.height * 0.6, textWidth, doc.page.height * 0.15)
          .fillOpacity(0.8)
          .fill('black');
        doc.fontSize(36)
          .fillColor('white')
          .font(language === 'bengali' ? 'Bengali' : 'Helvetica')
          .text(title, textX + 20, doc.page.height * 0.6 + 20, { 
            align: 'center', 
            width: textWidth - 40 
          });
      }
    }
    console.log('Cover Page created');

    // Create content pages
    pageImagePaths.forEach((imagePath, index) => {
      const margin = leftMargin === 'on' ? 40 : 0;
      const textMargin = margin ? margin : 15;
      doc.addPage({ size: 'A4', layout: 'landscape', margin: 0 });
      doc.image(imagePath, margin, 0, { 
        width: doc.page.width - margin, 
        height: doc.page.height * imageHeightRatio 
      });
      doc.rect(margin, doc.page.height * imageHeightRatio, 
        doc.page.width - margin, doc.page.height * textHeightRatio)
        .fill('white');
      doc.fontSize(fontSize || 18)
        .fillColor(textColor || 'black')
        .font(language === 'bengali' ? 'Bengali' : 'Helvetica')
        .text(textsArray[index], textMargin, 
          doc.page.height * imageHeightRatio + 15, { 
            width: doc.page.width - textMargin - 30 
          });
    });
    console.log('Individual Pages created');

    // Create back page
    if (coverImagePath) {
      doc.addPage().image(coverImagePath, 0, 0, { 
        width: doc.page.width, 
        height: doc.page.height 
      });
      doc.rect(0, 0, doc.page.width, doc.page.height)
        .fillOpacity(0.6)
        .fill('white');
      if (publisherLogoPath) {
        doc.image(publisherLogoPath, 
          doc.page.width / 2 - 50, 
          doc.page.height * 0.6 - 50, 
          { fit: [100, 100], align: 'center' });
      }
      if (publisherName) {
        const textWidth = doc.widthOfString(publisherName);
        const rectWidth = textWidth + 40;
        const rectX = (doc.page.width - rectWidth) / 2;
        doc.rect(rectX, doc.page.height * 0.7, rectWidth, doc.page.height * 0.1)
          .fillOpacity(0.8)
          .fill('black');
        doc.fontSize(20)
          .fillColor('white')
          .font(language === 'bengali' ? 'Bengali' : 'Helvetica')
          .text(publisherName, rectX + 20, doc.page.height * 0.7 + 20, { 
            align: 'center', 
            width: textWidth + 10 
          });
      }
    }

    doc.end();
    console.log('Back Page created and PDF finalized');

    pdfStream.on('finish', async () => {
      console.log('PDF stream finished');
      const pdfData = await fs.readFile(pdfPath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
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

// Cleanup function for temporary files
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

// Only start the server if we're not in a Vercel environment
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export the Express app for Vercel
module.exports = app;