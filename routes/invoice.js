const invoice_controller = require('../controller/invoice')
const configuration = require('../config/config')
const jwt = require('../helpers/jwt')
const multer = require('multer')
const upload = multer({ dest: configuration.directory.tmp_dir })



module.exports = (router) => {


    //---------------- INVOICES ------------------------------//


    router.post('/invoice/create', jwt.isAuthorized, upload.single('file'), invoice_controller.createInvoice)
    router.get('/invoice/monthly', jwt.isAuthorized, invoice_controller.getInvoiceMonthly)
    router.get('/invoice/year', jwt.isAuthorized, invoice_controller.getInvoiceYears)
    router.post('/invoiceline/:id/create', jwt.isAuthorized, invoice_controller.createInvoiceLine)
    router.get('/invoice/:id', jwt.isAuthorized, invoice_controller.getInvoice)
    router.get('/invoiceline/:id', jwt.isAuthorized, invoice_controller.getInvoiceLine)
    router.get('/hydratedinvoice/:id', jwt.isAuthorized, invoice_controller.getHydratedInvoice)
    router.get('/invoice', jwt.isAuthorized, invoice_controller.getAllInvoice)
    router.put('/invoice/:id', jwt.isAuthorized, invoice_controller.updateInvoice)
    router.put('/hydratedinvoice/:id', jwt.isAuthorized, upload.single('file'), invoice_controller.updateHydratedInvoice)
    router.put('/invoiceline/:id', jwt.isAuthorized, invoice_controller.updateInvoiceLine)
    router.delete('/invoice/:id', jwt.isAuthorized, invoice_controller.deleteInvoice)
    router.put('/invoice/:id/draft', jwt.isAuthorized, invoice_controller.draftInvoice)
    router.put('/invoice/:id/validate', jwt.isAuthorized, invoice_controller.validateInvoice)
    router.post('/invoice/:id/duplicate', jwt.isAuthorized, invoice_controller.duplicateInvoice)
    router.post('/invoice/export', jwt.isAuthorized, invoice_controller.exportInvoice)

    //share invoice
    router.get('/invoice/:id/share', jwt.isAuthorized, invoice_controller.getInvoiceShareUrl)

    //print invoice
    router.post('/invoice/:id/print', jwt.isAuthorized, invoice_controller.printInvoice)
    //------------------ ESTIMATES ------------------------------//


    router.post('/estimate/create', jwt.isAuthorized, upload.single('file'), invoice_controller.createEstimate)
    router.post('/estimateline/:id/create', jwt.isAuthorized, invoice_controller.createEstimateLine)
    router.get('/estimate/:id', jwt.isAuthorized, invoice_controller.getEstimate)
    router.get('/estimateline/:id', jwt.isAuthorized, invoice_controller.getEstimateLine)
    router.get('/hydratedestimate/:id', jwt.isAuthorized, invoice_controller.getHydratedEstimate)
    router.get('/estimate', jwt.isAuthorized, invoice_controller.getAllEstimate)
    router.put('/estimate/:id', jwt.isAuthorized, invoice_controller.updateEstimate)
    router.put('/hydratedestimate/:id', jwt.isAuthorized, upload.single('file'), invoice_controller.updateHydratedEstimate)
    router.put('/estimateline/:id', jwt.isAuthorized, invoice_controller.updateEstimateLine)
    router.delete('/estimate/:id', jwt.isAuthorized, invoice_controller.deleteEstimate)
    router.put('/estimate/:id/draft', jwt.isAuthorized, invoice_controller.draftEstimate)
    router.put('/estimate/:id/validate', jwt.isAuthorized, invoice_controller.validateEstimate)
    router.post('/estimate/:id/duplicate', jwt.isAuthorized, invoice_controller.duplicateEstimate)
    router.post('/estimate/:id/invoice', jwt.isAuthorized, invoice_controller.convertEstimateToInvoice)
    //share estimate
    router.get('/estimate/:id/share', jwt.isAuthorized, invoice_controller.getEstimateShareUrl)

    //print estimate
    router.post('/estimate/:id/print', jwt.isAuthorized, invoice_controller.printEstimate)

    //---------------- CLIENTS  ----------------------//

    router.post('/client/create', jwt.isAuthorized, invoice_controller.createClient)
    router.get('/client/total', jwt.isAuthorized, invoice_controller.totalByClient)
    router.get('/client/verifytaxid', jwt.isAuthorized, invoice_controller.verifyTaxId)
    router.get('/client/:id', jwt.isAuthorized, invoice_controller.getClient)
    router.get('/client', jwt.isAuthorized, invoice_controller.getAllClient)
    router.put('/client/:id', jwt.isAuthorized, invoice_controller.updateClient)
    router.delete('/client/:id', jwt.isAuthorized, invoice_controller.deleteClient)



    //---------------- ARTICLES  ----------------------//

    router.post('/article/create', jwt.isAuthorized, invoice_controller.createArticle)
    router.get('/article/total', jwt.isAuthorized, invoice_controller.totalByArticle)
    router.get('/article/verifycode', jwt.isAuthorized, invoice_controller.verifyCode)
    router.get('/article/:id', jwt.isAuthorized, invoice_controller.getArticle)
    router.get('/article', jwt.isAuthorized, invoice_controller.getAllArticle)
    router.put('/article/:id', jwt.isAuthorized, invoice_controller.updateArticle)
    router.delete('/article/:id', jwt.isAuthorized, invoice_controller.deleteArticle)
    router.put('/article/:id/activate', jwt.isAuthorized, invoice_controller.activateArticle)
    router.put('/article/:id/deactivate', jwt.isAuthorized, invoice_controller.deactivateArticle)
    router.put('/article/:id/suspend', jwt.isAuthorized, invoice_controller.suspendArticle)

    //----------------VAT-----------------------------------//

    router.get('/vat', jwt.isAuthorized, invoice_controller.getVat)
    router.post('/vat/create', jwt.isAuthorized, invoice_controller.createVat)
    router.put('/vat/:id', jwt.isAuthorized, invoice_controller.updateVat)
    router.delete('/vat/:id', jwt.isAuthorized, invoice_controller.deleteVat)


    //----------------COMPANY-----------------------//



    // router.post('/company/create' , jwt.isAuthorized ,upload.single('file'),invoice_controller.createCompany)
    // router.get('/company/:id' , jwt.isAuthorized ,invoice_controller.getCompany)
    router.put('/company/:id', jwt.isAuthorized, upload.single('file'), invoice_controller.editCompany)

    //----------------contact-----------------------//

    router.post('/contact/create', jwt.isAuthorized, upload.single('file'), invoice_controller.postContact)


    //----------------send mail--------------------------------//

    router.post('/sendmail', jwt.isAuthorized, invoice_controller.sendMail)

}