import {
    verifyJwt,
    verifyJwtAdmin
} from '../functions/functions';

export const userAuthCheck = async (req, res, next) => {
    try {
        // console.log('request data',req.file)
        const cookie = req.signedCookies
        // console.log('cookie111', cookie)
        if (cookie) {
            const isCookieValid = await verifyJwt(cookie.token)
            // console.log('cookie', isCookieValid)
            if (isCookieValid) {
                req.body.tokenData = isCookieValid
                next()
            } else {
                res.send({
                    code: 400,
                    msg: 'Authentication is required'
                })
            }
        }

    } catch (e) {
        console.log(e)
        res.send({
            code: 444,
            msg: 'Some error has occured!'
        })
    }

}

export const adminAuthCheck = async (req, res, next) => {
    try {
        const cookie = req.signedCookies
        const isCookieValid = await verifyJwtAdmin(cookie.adminToken)
        if (isCookieValid) {
            console.log('here')
            next()
        } else {
            res.send({
                code: 400,
                msg: 'Authentication is required'
            })
        }
    } catch (e) {
        res.send({
            code: 444,
            msg: 'Some error has occured!'
        })
    }
}

export const adminAuthCheckParam = async (req, res, next) => {
    const tokenData = await verifyJwtAdmin(req.params.adminToken)
    if (tokenData) {
        next()
    } else {
        res.status(200).json({
            code: 400,
            msg: 'Not Authenticated'
        })
    }
}