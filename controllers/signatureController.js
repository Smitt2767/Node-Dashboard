const { PDFDocument } = require("pdf-lib");
const moment = require("moment");
const fs = require("fs/promises");

exports.createSignatureIntoNewPdf = async (req, res, next) => {
  try {
    if (!req.body.signature) {
      return res.status(400).json({
        success: false,
        message: "Signature must be required...",
      });
    }

    const pdfDoc = await PDFDocument.create();
    const page = await pdfDoc.addPage();

    const img = await pdfDoc.embedPng(req.body.signature);
    const { width, height } = img.scale(0.3);

    page.drawImage(img, {
      x: page.getWidth() / 2 - width / 2,
      y: page.getHeight() / 2 - height / 2,
      width: width,
      height: height,
    });

    const fileName = `signature_${moment().format(`YYYY-MM-DD hh-mm a`)}.pdf`;

    await fs.writeFile(`./public/${fileName}`, await pdfDoc.save());

    return res.json({
      success: true,
      message: "Pdf generated with your signature successfully...",
      fileName,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error...",
    });
  }
};

exports.createSignatureIntoExistingPdf = async (req, res, next) => {
  try {
    if (!req.body.signature) {
      return res.status(400).json({
        success: false,
        message: "Signature must be required...",
      });
    }

    const pdf = await fs.readFile("./public/signature.pdf");

    const pdfDoc = await PDFDocument.load(pdf);
    const img = await pdfDoc.embedPng(req.body.signature);
    const { width, height } = img.scale(0.2);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawImage(img, {
      x: firstPage.getWidth() * 0.84 - width / 2,
      y: firstPage.getHeight() * 0.125,
      width,
      height,
    });

    const fileName = `signature_${moment().format(`YYYY-MM-DD hh-mm a`)}.pdf`;

    await fs.writeFile(`./public/${fileName}`, await pdfDoc.save());

    return res.json({
      success: true,
      message: "Pdf generated with your signature successfully...",
      fileName,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error...",
    });
  }
};
