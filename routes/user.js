const user_controller = require('../controller/user')
const jwt = require('../helpers/jwt')
const configuration = require('../config/config')
const multer  = require('multer')
const upload = multer({ dest: configuration.directory.tmp_dir})


module.exports = (router) => {

router.post('/register', upload.single('file'),user_controller.register)
router.post('/login',user_controller.login)
router.get('/profile',jwt.isAuthorized,user_controller.profile)
router.put('/profile',jwt.isAuthorized, upload.single('file') , user_controller.editProfile)
router.delete('/deleteuser',jwt.isAuthorized,user_controller.deleteUser)
router.post('/logout', jwt.isAuthorized,  user_controller.logout);
   
}
        