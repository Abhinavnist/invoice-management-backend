var convertapi = require("convertapi")("secret_AxIEgIv1qZTWGgHG")
convertapi
  .convert(
    "csv",
    {
      File: "./INVOICE-AN00138-TROLLIUS (1).pdf",
    },
    "pdf"
  )
  .then(function (result) {
    result.saveFiles("../config")
  })
