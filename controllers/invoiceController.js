// controllers/invoiceController.js
const pdfParse = require("pdf-parse")
const Invoice = require("../models/Invoice")

// Function to parse PDF and extract invoice data
const parseInvoicePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer)
    const text = data.text

    // Extract necessary data based on the patterns in the PDF
    const transactionNumber = text.match(/Invoice No\s*([A-Z0-9]+)/)?.[1]
    const payee = text.match(/Party Name\s*:\s*(.+)/)?.[1]?.trim()

    // Extract Grand Total correctly
    const grandTotalMatch = text.match(/TOTAL\s*\n.*\n.*([0-9,.]+)/)
    const grandTotal = grandTotalMatch
      ? parseFloat(grandTotalMatch[1]?.replace(",", ""))
      : null

    console.log("Extracted Grand Total:", grandTotal) // Debugging log

    // Extract date in DD-MM-YYYY format and convert it to a valid JavaScript Date object
    const invoiceDateString = text.match(
      /Invoice Date\s*(\d{2}-\d{2}-\d{4})/
    )?.[1]
    let invoiceDate = null
    if (invoiceDateString) {
      const [day, month, year] = invoiceDateString.split("-")
      invoiceDate = new Date(`${year}-${month}-${day}`) // Convert to YYYY-MM-DD format
    }

    const orderNumber = text.match(/Order No\.\s*(\S+)/)?.[1]
    const orderDateString = text.match(/Order Date\s*(\d{2}-\d{2}-\d{4})/)?.[1]
    let orderDate = null
    if (orderDateString) {
      const [day, month, year] = orderDateString.split("-")
      orderDate = new Date(`${year}-${month}-${day}`)
    }

    // Extract L.R. No., but handle the case where it's missing
    const lrNumberMatch = text.match(/L\.R\. No\.\s*([A-Za-z0-9]+)/)
    const lrNumber = lrNumberMatch ? lrNumberMatch[1] : null

    console.log("Extracted L.R. No.:", lrNumber) // Debugging log

    const lrDateString = text.match(/L\.R\. Date\s*(\d{2}-\d{2}-\d{4})/)?.[1]
    let lrDate = null
    if (lrDateString) {
      const [day, month, year] = lrDateString.split("-")
      lrDate = new Date(`${year}-${month}-${day}`)
    }

    console.log(
      transactionNumber,
      payee,
      invoiceDate,
      grandTotal,
      orderNumber,
      orderDate,
      lrNumber,
      lrDate
    )

    // Return the extracted data
    return {
      transactionNumber,
      payee,
      invoiceDate,
      grandTotal,
      orderNumber,
      orderDate,
      lrNumber,
      lrDate,
    }
  } catch (error) {
    throw new Error("Invalid PDF structure")
  }
}

// Function to check if the parsed invoice data is valid
const sanityCheckInvoice = (invoiceData) => {
  const errors = []

  if (!invoiceData.transactionNumber) errors.push("Invoice number is missing")
  if (!invoiceData.payee) errors.push("Party name is missing")
  if (!invoiceData.invoiceDate || isNaN(invoiceData.invoiceDate.getTime()))
    errors.push("Invoice date is missing or invalid")
  if (isNaN(invoiceData.grandTotal))
    errors.push("Grand Total is missing or invalid")
  if (!invoiceData.orderNumber) errors.push("Order number is missing")
  if (!invoiceData.orderDate || isNaN(invoiceData.orderDate.getTime()))
    errors.push("Order date is missing or invalid")
  if (!invoiceData.lrNumber) errors.push("L.R. No is missing")
  if (!invoiceData.lrDate || isNaN(invoiceData.lrDate.getTime()))
    errors.push("L.R. date is missing or invalid")

  return errors.length > 0 ? errors : null
}

// Process the uploaded invoice
const processInvoice = async (req, res) => {
  try {
    const fileBuffer = req.file.buffer

    // Parse the PDF file
    const invoiceData = await parseInvoicePDF(fileBuffer)

    // Sanity check the parsed invoice data
    const errors = sanityCheckInvoice(invoiceData)

    // Store the invoice in MongoDB
    const newInvoice = new Invoice({
      ...invoiceData,
      status: errors ? "sanity failed" : "sanity passed",
      errors: errors || [],
    })

    await newInvoice.save()

    res
      .status(200)
      .json({ message: "Invoice processed", status: newInvoice.status, errors })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ message: "Error processing invoice", error: error.message })
  }
}

module.exports = { processInvoice }
// const pdfParse = require("pdf-parse")
// const fs = require("fs")
// const csv = require("csv-parser")
// const Invoice = require("../models/Invoice")
// const { parse } = require("json2csv")

// // Function to parse PDF and convert it to CSV
// const pdfToCSV = async (buffer) => {
//   try {
//     const data = await pdfParse(buffer)
//     const text = data.text

//     // Split text by lines
//     const lines = text.split("\n")

//     // Process text to simulate table rows in CSV format
//     const csvData = lines.map((line) => ({
//       content: line.trim(),
//     }))

//     // Convert text data to CSV format
//     const csvString = parse(csvData)

//     // Save CSV to a temporary file (if needed) or return as a string
//     fs.writeFileSync("temp_invoice.csv", csvString) // Optional step

//     console.log("PDF converted to CSV successfully.")

//     return csvString
//   } catch (error) {
//     throw new Error("Failed to convert PDF to CSV")
//   }
// }

// // Function to extract invoice data from CSV
// const parseInvoiceCSV = async (csvString) => {
//   try {
//     const data = []

//     // Parse CSV and push each row to `data` array
//     fs.createReadStream("temp_invoice.csv")
//       .pipe(csv())
//       .on("data", (row) => data.push(row))
//       .on("end", () => {
//         // Extract necessary data from CSV
//         const transactionNumber = data
//           .find((row) => row.content.includes("Invoice No"))
//           ?.content.match(/Invoice No\s*([A-Z0-9]+)/)?.[1]

//         const payee = data
//           .find((row) => row.content.includes("Party Name"))
//           ?.content.split(":")[1]
//           ?.trim()

//         const grandTotalMatch = data
//           .find((row) => row.content.includes("Grand Total"))
//           ?.content.match(/Grand Total\s*([0-9,.]+)/)
//         const grandTotal = grandTotalMatch
//           ? parseFloat(grandTotalMatch[1].replace(",", ""))
//           : null

//         // Extract dates in DD-MM-YYYY format and convert them to Date objects
//         const invoiceDateString = data
//           .find((row) => row.content.includes("Invoice Date"))
//           ?.content.match(/(\d{2}-\d{2}-\d{4})/)?.[0]
//         const invoiceDate = invoiceDateString
//           ? new Date(
//               `${invoiceDateString.split("-")[2]}-${
//                 invoiceDateString.split("-")[1]
//               }-${invoiceDateString.split("-")[0]}`
//             )
//           : null

//         const orderNumber = data
//           .find((row) => row.content.includes("Order No."))
//           ?.content.split(":")[1]
//           ?.trim()

//         const orderDateString = data
//           .find((row) => row.content.includes("Order Date"))
//           ?.content.match(/(\d{2}-\d{2}-\d{4})/)?.[0]
//         const orderDate = orderDateString
//           ? new Date(
//               `${orderDateString.split("-")[2]}-${
//                 orderDateString.split("-")[1]
//               }-${orderDateString.split("-")[0]}`
//             )
//           : null

//         const lrNumber = data
//           .find((row) => row.content.includes("L.R. No"))
//           ?.content.split(":")[1]
//           ?.trim()

//         const lrDateString = data
//           .find((row) => row.content.includes("L.R. Date"))
//           ?.content.match(/(\d{2}-\d{2}-\d{4})/)?.[0]
//         const lrDate = lrDateString
//           ? new Date(
//               `${lrDateString.split("-")[2]}-${lrDateString.split("-")[1]}-${
//                 lrDateString.split("-")[0]
//               }`
//             )
//           : null

//         // Return the extracted data
//         return {
//           transactionNumber,
//           payee,
//           invoiceDate,
//           grandTotal,
//           orderNumber,
//           orderDate,
//           lrNumber,
//           lrDate,
//         }
//       })
//   } catch (error) {
//     throw new Error("Error parsing CSV data")
//   }
// }

// // Process the uploaded invoice
// const processInvoice = async (req, res) => {
//   try {
//     const fileBuffer = req.file.buffer

//     // Convert PDF to CSV format
//     const csvData = await pdfToCSV(fileBuffer)

//     // Parse the CSV to extract invoice data
//     const invoiceData = await parseInvoiceCSV(csvData)
//     console.log("Extracted Data:", invoiceData)

//     // Validate extracted data
//     const errors = sanityCheckInvoice(invoiceData)

//     // Store invoice in MongoDB
//     const newInvoice = new Invoice({
//       ...invoiceData,
//       status: errors ? "Invalid" : "OK",
//       errors: errors || [],
//     })

//     await newInvoice.save()

//     res
//       .status(200)
//       .json({ message: "Invoice processed", status: newInvoice.status, errors })
//   } catch (error) {
//     console.error(error)
//     res
//       .status(500)
//       .json({ message: "Error processing invoice", error: error.message })
//   }
// }

// // Function to check if the parsed invoice data is valid
// const sanityCheckInvoice = (invoiceData) => {
//   const errors = []

//   if (!invoiceData.transactionNumber) errors.push("Invoice number is missing")
//   if (!invoiceData.payee) errors.push("Party name is missing")
//   if (!invoiceData.invoiceDate || isNaN(invoiceData.invoiceDate.getTime()))
//     errors.push("Invoice date is missing or invalid")
//   if (isNaN(invoiceData.grandTotal))
//     errors.push("Grand Total is missing or invalid")
//   if (!invoiceData.orderNumber) errors.push("Order number is missing")
//   if (!invoiceData.orderDate || isNaN(invoiceData.orderDate.getTime()))
//     errors.push("Order date is missing or invalid")
//   if (!invoiceData.lrNumber) errors.push("L.R. No is missing")
//   if (!invoiceData.lrDate || isNaN(invoiceData.lrDate.getTime()))
//     errors.push("L.R. date is missing or invalid")

//   return errors.length > 0 ? errors : null
// }

// module.exports = { processInvoice }
