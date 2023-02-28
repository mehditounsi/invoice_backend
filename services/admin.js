const { Company, Attachment, Contact, Template, Notification, User } = require('../models')
const { getCompanyId, getUserId } = require('../helpers/context')
const tools = require('../helpers/tools')
const Errors = require('../helpers/errors');
const configuration = require('../config/config')
var jwt = require('jsonwebtoken');
const Logger = require('winston')



//-----------companies----------------

exports.getAllCompany = async () => {
    try {
        let companies = await Company.findAll()
        if (companies) {
            return companies
        } else {
            throw new Errors.NotFoundError('no companies found')
        }
    } catch (error) {
        console.log(error);
        throw error
    }
}

exports.createCompany = async (data) => {
    try {
        if (data) {
            data["invoice_template_id"] = 1
            data["estimate_template_id"] = 2
            data["invoice_template_id_fr"] = 3
            data["estimate_template_id_fr"] = 4
            data["invoice_template_id_ar"] = 5
            data["estimate_template_id_ar"] = 6
            let company = await Company.create(data);
            Logger.info('create company', company)
            return company
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.activateCompany = async (id) => {
    try {
        if (id) {
            let company = await Company.findById(id)
            if (company) {
                if (company.status != 1) {
                    await Company.update(id, { status: 1 })
                    return { message: "company has been successfully activated" }
                } else {
                    return { message: "company is already activated" }
                }
            } else {
                throw new Errors.NotFoundError('no companies found')
            }
        } else {
            throw new Errors.InvalidDataError('Invalid data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.deactivateCompany = async (id) => {
    try {
        if (id) {
            let company = await Company.findById(id)
            if (company) {
                if (company.status !== 0) {
                    await Company.update(id, { status: 0 })
                    return { message: "company has been deactivated" }
                } else {
                    return { message: "company is already deactivated" }
                }
            } else {
                throw new Errors.NotFoundError('no companies found')
            }
        } else {
            throw new Errors.InvalidDataError('Invalid data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.suspendCompany = async (id) => {
    try {
        if (id) {
            let company = await Company.findById(id)
            if (company) {
                if (company.status !== 2 && company.status !== 0) {
                    await Company.update(id, { status: 2 })
                    return { message: "company has been suspended" }
                } else {
                    return { message: "company is already suspended" }
                }
            } else {
                throw new Errors.NotFoundError('no companies found')
            }
        } else {
            throw new Errors.InvalidDataError('Invalid data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.deleteCompany = async (id) => {
    try {
        if (id) {
            let company = await Company.findById(id)
            if (company) {
                if (company.status !== 3) {
                    await Company.update(id, { status: 3 })
                    return { message: "company has been deleted" }
                } else {
                    return { message: "company is already deleted" }
                }
            } else {
                throw new Errors.NotFoundError('no companies found')
            }
        } else {
            throw new Errors.InvalidDataError('Invalid data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.editCompany = async (id, update) => {
    try {
        if (id && update) {
            let company = await Company.update(id, update)
            if (company) {
                Logger.info("update company", company)
                return company
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


//-----------------Template------------------------------------------------


exports.createTemplate = async (data, file) => {
    try {
        if (data) {
            data.template = file
            let template = await Template.create(data)
            return template
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getAllTemplates = async () => {
    try {
        let templates = await Template.findAll()
        if (templates) {
            Logger.info("get all Templates", templates)
            return templates
        } else {
            throw new Errors.NotFoundError('Templates not found')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.getTemplate = async (id) => {
    try {
        if (id) {
            let template = await Template.findById(id)
            if (template) {
                Logger.info('get template', template)
                return template
            } else {
                throw new Errors.NotFoundError('template not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.editTemplate = async (id, update) => {
    try {
        if (id && update) {
            let template = await Template.update(id, update)
            if (template) {
                Logger.info("update vat", template)
                return template
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


exports.deleteTemplate = async (id) => {
    try {
        if (id) {
            let template = await Template.findById(id)
            if (template) {
                Logger.info("delete template", template)
                return await Template.destroy(id)
            } else {
                throw new Errors.NotFoundError('no template to delete')
            }
        }
        else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}



//-------------------- Contact--------------------



exports.getContact = async () => {
    try {
        let contacts = await Contact.findAllContact()
        if (contacts) {
            Logger.info("All Contacts", contacts)
            return contacts
        } else {
            throw new Errors.NotFoundError('no contacts found')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getOneContact = async (id) => {
    try {
        let contact = await Contact.findOneContact(id)
        if (contact) {
            Logger.info("Get One Contact", contact)
            return contact
        } else {
            throw new Errors.NotFoundError('no contacts found')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.contactStatus = async (id) => {
    try {
        if (id) {
            let contact = await Contact.findById(id)
            if (contact) {
                if (contact.status == 1) {
                    await Contact.update(id, { status: 0 })
                }
            } else {
                throw new Errors.InvalidDataError('Invalid data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


//-----------notification --------------------------------


exports.createNotification = async (data) => {
    try {
        if (data) {
            let notification = await Notification.create(data)
            if (notification) {
                Logger.info("Create new notification", notification)
                return notification
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

exports.editNotification = async (id, update) => {
    try {
        if (id && update) {
            let notification = await Notification.update(id, update)
            if (notification) {
                Logger.info("Edit notification", notification)
                return notification
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}



exports.activateNotification = async (id) => {
    try {
        if (id) {
            let notification = await Notification.findById(id)
            if (notification) {
                if (notification.status !== 1) {
                    await Notification.update(id, { status: 1 })
                    return { message: "this notification has been activated" }
                } else {
                    return { message: "Notification already activated" }
                }
            } else {
                throw new Errors.NotFoundError('notification not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.deactivateNotification = async (id) => {
    try {
        if (id) {
            let notification = await Notification.findById(id)
            if (notification) {
                if (notification.status !== 0) {
                    await Notification.update(id, { status: 0 })
                    return { message: "this notification has been deactivated" }
                } else {
                    return { message: "Notification already deactivated" }
                }
            } else {
                throw new Errors.NotFoundError('notification not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.deleteNotification = async (id) => {
    try {
        if (id) {
            let notification = await Notification.findById(id)
            if (notification) {
                Logger.info("delete notification", notification)
                return await Notification.destroy(id)
            } else {
                throw new Errors.NotFoundError('no notification to delete')
            }
        }
        else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}

exports.getAllNotifications = async () => {
    try {
        let notifications = await Notification.findAllNotifications()
        if (notifications) {
            Logger.info("get all notification", notifications)
            return notifications
        } else {
            throw new Errors.NotFoundError('no notification to delete')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}

//----------------- Users ------------------------------


exports.getAdminProfile = async (username = "root") => {
    try {
        if (username == "root") {
            let admin = await User.findByLogin(username)
            if (admin) {
                Logger.info("get admin profile", admin)
                return admin
            } else {
                throw new Errors.InvalidDataError('no admin found')
            }
        } else {
            throw new Errors.InvalidDataError('invalid data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}


exports.getAllUsers = async () => {
    try {
        let users = await User.findAllUsers()
        if (users) {
            Logger.info("get all notification", users)
            return users
        } else {
            throw new Errors.NotFoundError('no notification to delete')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}

exports.loginAsUser = async (id) => {
    try {
        const JWT_SIGN_SECRET = "" + configuration.jwt.jwt_secret;
        let user = await User.findByIdForAdmin(id)
        if (user) {
            let company = await Company.findById(user.company_id)
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
            let token = jwt.sign({
                userId: user.id,
                role: user.role,
                userUID: user.uid,
                companyId: user.company_id,
                login: user.login
            },
                JWT_SIGN_SECRET,
                {
                    expiresIn: '1200h'
                })

                user.token = token

            return {
                user: user,
                company: company,
            }
        } else {
            throw new Errors.NotFoundError('no user found')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}