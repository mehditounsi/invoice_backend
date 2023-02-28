const admin_controller = require('../controller/admin')
const jwt = require('../helpers/jwt')
const configuration = require('../config/config')
const multer = require('multer')
const upload = multer({ dest: configuration.directory.tmp_dir })

module.exports = (router) => {
    //--------------COMPANY--------------------------------

    router.get('/companies', jwt.isAdmin, admin_controller.getAllCompany)
    router.post('/company/create', jwt.isAdmin, admin_controller.createCompany)
    router.put('/company/:id/activate', jwt.isAdmin, admin_controller.activateCompany)
    router.put('/company/:id/deactivate', jwt.isAdmin, admin_controller.deactivateCompany)
    router.put('/company/:id/suspend', jwt.isAdmin, admin_controller.suspendCompany)
    router.put('/company/:id/delete', jwt.isAdmin, admin_controller.deleteCompany)
    router.put('/company/:id/admin', jwt.isAdmin, admin_controller.editCompany)

    //----------------TEMPLATES-----------------------

    router.post('/template/create', jwt.isAdmin, upload.single('file'), admin_controller.createTemplate)
    router.get('/template', jwt.isAdmin, admin_controller.getAllTemplates)
    router.get('/template/:id', jwt.isAdmin, admin_controller.getTemplate)
    router.put('/template/:id', jwt.isAdmin, admin_controller.editTemplate)
    router.delete('/template/:id', jwt.isAdmin, admin_controller.deleteTemplate)

    // ---------------------CONTACT---------------------------

    router.get('/contact', jwt.isAdmin, admin_controller.getContact)
    router.get('/contact/:id', jwt.isAdmin, admin_controller.getOneContact)
    router.put('/contact/:id', jwt.isAdmin, admin_controller.contactStatus)

    //------------------------NOTIFICATION--------------------

    router.post('/notification/create', jwt.isAdmin, admin_controller.createNotification)
    router.get('/notification', jwt.isAdmin, admin_controller.getAllNotifications)
    router.put('/notification/:id', jwt.isAdmin, admin_controller.editNotification)
    router.put('/notification/:id/deactivate', jwt.isAdmin, admin_controller.deactivateNotification)
    router.put('/notification/:id/activate', jwt.isAdmin, admin_controller.activateNotification)
    router.delete('/notification/:id', jwt.isAdmin, admin_controller.deleteNotification)

    // --------------------USERS--------------------------------------------------------

    router.get('/users',jwt.isAdmin, admin_controller.getAllUsers)
    router.post('/connect/:id',jwt.isAdmin, admin_controller.loginAsUser)

    //---------------------Admin----------------------------------------------------------------

    router.get('/admin/profile',jwt.isAdmin, admin_controller.getAdminProfile)
}