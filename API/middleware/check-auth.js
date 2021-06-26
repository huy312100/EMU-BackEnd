const e = require("cors");
const jwt = require("jsonwebtoken");
const account = require("../models/account");

module.exports = (req, res, next) => {
    try {
        const tokenTotal = req.headers.authorization.split(" ")[1];
        const role = tokenTotal.substr(tokenTotal.length - 2, tokenTotal.length);
        const token = tokenTotal.split(role)[0];
        
        if (role === "sT") {
            rolefilnal = "1";
        } else if (role === "tC") {
            rolefilnal = "2";
        } else if (role === "pR") {
            rolefilnal = "3";
        } else {
            rolefilnal = "0";
        }
        //console.log(rolefilnal);
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        account.find({ username: decoded.username })
            .exec()
            .then(re1 => {
                if (re1.length >= 1) {
                    
                    if (re1[0].role === rolefilnal) {
                        req.userData = decoded;
                        next();
                    } else {
                        return res.status(401).json({
                            message: 'Auth failed'
                        });
                    }
                } else {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
            })
            .catch(err=>{
                return res.status(401).json({
                    message: 'Auth failed'
                });
            })

    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};