const isLogin = (req, res, next)=>{
    try {
        if (req.session.admin) {
            next()
        } else {
           res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = (req, res, next) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/dashboard')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}