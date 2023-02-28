const { User, Company, Attachment, DeletedUsers, Template } = require('../models')
const tools = require('../helpers/tools')
const Errors = require('../helpers/errors');
const configuration = require('../config/config')
const jwt_decode = require('jwt-decode');
// const redis_client = require('../config/redis');
let invoiceService = require('../services/invoice')

const { getUser, getToken, getUserId } = require('../helpers/context')

const Logger = require('winston');
const { log } = require('util');



exports.register = async (data, filename) => {
    try {
        // Logger.debug("user to register : ", data)
        let found = await User.find({ login: data.user.login })

        if (!found || found.length <= 0) {
            let template = await Template.findAll()
            for (var i = 0; i < template.length; i++) {
                if (template[i].type == 'invoice' && template[i].isDefault == 1 && template[i].language == "EN") {
                    data.company.invoice_template_id = template[i].id
                }
                if (template[i].type == 'invoice' && template[i].isDefault == 1 && template[i].language == "FR") {
                    data.company.invoice_template_id_fr = template[i].id
                }
                if (template[i].type == 'invoice' && template[i].isDefault == 1 && template[i].language == "AR") {
                    data.company.invoice_template_id_ar = template[i].id
                }
                if (template[i].type == 'estimate' && template[i].isDefault == 1 && template[i].language == "EN") {
                    data.company.estimate_template_id = template[i].id
                }
                if (template[i].type == 'estimate' && template[i].isDefault == 1 && template[i].language == "FR") {
                    data.company.estimate_template_id_fr = template[i].id
                }
                if (template[i].type == 'estimate' && template[i].isDefault == 1 && template[i].language == "AR") {
                    data.company.estimate_template_id_ar = template[i].id
                }
            }


            if (data.company.logo) {
                let attachment = await Attachment.create({ attachment: data.company.logo, filename: filename })
                data.company['logo'] = attachment.id
            }

            let company = await Company.create(data.company)

            if (company.logo) {
                await Attachment.update(company.logo, { company_id: company.id })
            }





            data.user["company_id"] = company.id
            let user = await User.create(data.user)

            await tools.defaultDataService(company.id)

            Logger.info(`Register: ${user, company}`)

            if (user && company) {
                return {
                    user: user,
                    company: company
                }
            }

        } else {
            throw new Errors.InvalidDataError('login already exists')

        }

    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError(error)
    }

}



exports.login = async () => {
    try {
        let user = getUser()
        if (user) {
            let company = await Company.findById(user.company_id)
            if (company) {
                if (company.logo) {
                    let attachment = await Attachment.findById(company.logo)
                    if (attachment) {
                        company.logo = attachment;
                    }
                }
                if (user.signature) {
                    let attach = await Attachment.findById(user.signature)

                    user.signature = attach
                }

                return {
                    user: user,
                    company: company
                }
            } else {
                throw new Errors.NotFoundError('company not found')
            }
        } else {
            throw new Errors.NotFoundError('User not found')
        }
    } catch (error) {
        Logger.error(error)
        console.log(error);
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.profile = async () => {
    try {
        let user_id = getUserId()
        let user = await User.findById(user_id)
        if (user) {
            let company = await Company.findById(user.company_id)
            if (company) {
                if (company.logo) {
                    let attachment = await Attachment.findById(company.logo)
                    if (attachment) {
                        company.logo = attachment;
                    }
                }
                if (user.signature) {
                    let attach = await Attachment.findById(user.signature)

                    user.signature = attach
                }
                return {
                    user: user,
                    company: company
                }
            } else {
                throw new Errors.NotFoundError('company not found')
            }
        } else {
            throw new Errors.NotFoundError('User not found')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.editProfile = async (data, filename) => {
    try {
        if (data) {
            let user_id = getUserId()
            let user = await User.findById(user_id)
            let profile
            try {

                if (data.signature) {
                    let attachment = await Attachment.create({ attachment: data.signature, filename: filename, company_id: user.company_id })
                    data.signature = attachment.id
                }
                profile = await User.update(user.id, data)
            } catch (e) {
                console.log(e);
            }
            if (profile) {
                Logger.info("update profile", profile)
                return profile
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.deleteUser = async () => {
    try {
        let user_id = getUserId()
        let user = await User.findById(user_id)
        if (user) {
            let deleted_data = {
                old_id: user.id,
                login: user.login,
                role: user.role,
                name: user.name,
                uid: user.uid,
                signature: user.signature ?? null,
                company_id: user.company_id
            }
            let deleted_user = await DeletedUsers.create(deleted_data)
            if (deleted_user) {
                let delete_user = await User.destroy(user.id)
                if (delete_user) {
                    return deleted_user
                } else {
                    throw new Errors.InvalidDataError('User not deleted')
                }
            } else {
                throw new Errors.InvalidDataError('Invalid data')
            }

        } else {
            throw new Errors.NotFoundError('User not found')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.logout = async () => {
    try {
        let token = getToken()
        if (token) {
            // try {
            //     const token_key = `BL_${token}`;
            //     await redis_client.set(token_key, token);
            // } catch (error) {
            //     console.log(error)
            // }
        } else {
            throw new Errors.NotFoundError('token not found')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.adminLogin = async (username, password) => {
    try {
        if (username && password) {
            let admin = await User.findOne({ login: username, password: password })
            if (admin) {
                Logger.info('admin login', admin)
                return admin
            } else {
                throw new Errors.InvalidDataError('incorrect username or password')
            }
        } else {
            throw new Errors.InvalidDataError('Missing credentials')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}