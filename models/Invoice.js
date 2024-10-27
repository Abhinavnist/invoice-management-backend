const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema({
  transactionNumber: String, // Invoice No
  payee: String, // Party Name
  invoiceDate: Date, // Invoice Date
  grandTotal: Number, // Grand Total
  orderNumber: String, // Order No
  orderDate: Date, // Order Date
  lrNumber: String, // L.R. No
  lrDate: Date, // L.R. Date
  status: String, // OK or Invalid
  errors: [String], // Array of error messages
})

const Invoice = mongoose.model("Invoice", invoiceSchema)

module.exports = Invoice
