const { Company, Invoice, Estimate, Vat } = require('../models')
const { getCompanyId } = require('./context')
const globals = require('./globals.js')
const util = require('util')


exports.getLastCode = async (entity) => {
    let today = new Date()
    let thisYear = today.getFullYear()
    let start = new Date(thisYear, 0, 2)
    let end = new Date(thisYear, 11, 32)

    let search = {
        "date": {
            $lte: end,
            $gte: start
        }
    }

    let result = []
    let max = {}

    switch (entity) {
        case globals.INVOICE:
            result = await Invoice.sortInvoice(search)
            if (result && result.length > 0) {
                max = result[0];
                if (max.num_interne) {
                    return max.num_interne
                }
            }
            return 0


        case globals.ESTIMATE:
            result = await Estimate.sortEstimate(search)
            if (result && result.length > 0) {
                max = result[0];
                if (max.num_interne) {
                    return max.num_interne
                }
            }
            return 0
        default:
            break;
    }
}


exports.getNextCode = async (entity) => {
    let max = await this.getLastCode(entity) + 1
    let company = await Company.findById(getCompanyId())
    let invoice_name = company.invoice_name
    let estimate_name = company.estimate_name

    var today = new Date()
    var thisYear = today.getFullYear()

    switch (entity) {
        case globals.INVOICE:
            if (invoice_name) {
                return {
                    max: max,
                    next: util.format(`${invoice_name}-%s-%s`, thisYear, ("0000" + max).slice(-4))
                }
            } else {
                return {
                    max: max,
                    next: util.format('IN-%s-%s', thisYear, ("0000" + max).slice(-4))
                }
            }
        case globals.ESTIMATE:
            if (estimate_name) {
                return {
                    max: max,
                    next: util.format(`${estimate_name}-%s-%s`, thisYear, ("0000" + max).slice(-4))
                }
            } else {
                return {
                    max: max,
                    next: util.format('ES-%s-%s', thisYear, ("0000" + max).slice(-4))
                }
            }
    }
}


exports.convertToDecimal = async (amount) => {
    let company = await Company.findById(getCompanyId());
    if (company && company.digits) {
        let digits = company.digits
        if (digits > 0 && !isNaN(amount) && amount != null) {
            if (typeof amount === 'string') {
                amount = parseFloat(amount)
            }
            let decimal = await amount.toFixed(digits)
            return decimal
        } else {
            return amount
        }
    } else {
        return amount
    }
}


exports.quantityDigits = async (amount) => {
    let company = await Company.findById(getCompanyId());
    if (company && company.quantity_digits) {
        let quantity_digits = company.quantity_digits
        if (quantity_digits > 0 && !isNaN(amount) && amount != null) {
            if (typeof amount === 'string') {
                amount = parseFloat(amount)
            }
            let decimal = await amount.toFixed(quantity_digits)
            return decimal
        } else {
            return amount
        }
    } else {
        return amount
    }
}



exports.randomAlphabetic = async (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


exports.defaultDataService = async (company_id) => {
    //default tva 19%
    await Vat.defaultCreate({vat : 0.19 , company_id : company_id})
}