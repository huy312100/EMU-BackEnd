const mongoose = require("mongoose");
const crypto=require("crypto");
var request = require("request");

const CustomWeb =require("../models/customweb");

const resizedIV = Buffer.allocUnsafe(16);
const iv = crypto
      .createHash("sha256")
      .update(process.env.Cipheriv)
      .digest();

iv.copy(resizedIV);

const keyPass = crypto
        .createHash("sha256")
        .update(process.env.Key_SHA256_Crypo)
        .digest();

exports.Get_Website_Custom =(req,res,next)=>{
    CustomWeb.find({idUser: req.userData._id})
    .exec()
    .then(user=>{
        if(user === null){
            res.status(404).json({ message: "No Account from custom"});
        }
        else{
            // var decipherUsername = crypto.createDecipheriv("aes256", keyPass, resizedIV);
            // var decodeUsername =decipherUsername.update(user[0].username,"hex","utf-8");
            // decodeUsername+=decipherUsername.final("utf-8");

            // var decipherPassword = crypto.createDecipheriv("aes256", keyPass, resizedIV);
            // var decodePassword =decipherPassword.update(user[0].password,"hex","utf-8");
            // decodePassword+=decipherPassword.final("utf-8");
            
            res.status(200).json(user);
          }
    })
    .catch(err=>{
        res.status(500).json({error:err});
    });
};

exports.Post_Account_Custom =(req,res,next)=>{
    CustomWeb.find({$and:[{typeUrl:req.body.typeUrl},{idUser: req.userData._id}]})
    .exec()
    .then(user=>{
        if(user.length>=1){
            return res.status(409).json({
                message:"account exists"
              });
        }else{
            //web custom is moodle
            if(req.body.typeUrl=="Moodle")
            {
                //encode username
                var cipherUsername = crypto.createCipheriv("aes256", keyPass, resizedIV);
                var encodeUsername =cipherUsername.update(req.body.username,"utf-8","hex");
                encodeUsername+=cipherUsername.final('hex');
                //encode password
                var cipherPassword = crypto.createCipheriv("aes256", keyPass, resizedIV);
                var encodePassword =cipherPassword.update(req.body.password,"utf-8","hex");
                encodePassword+=cipherPassword.final("hex");

                //get token moodle => authentified
                var Urllogin= req.body.url.split(".edu.vn")[0];
                Urllogin+=".edu.vn/login/token.php";
                
                var UrlFetch = Urllogin+"?service=moodle_mobile_app&username="+ req.body.username + "&password=" + req.body.password;
                
                var options = {
                    "method": "GET",
                    "url": UrlFetch,
                    "headers": {
                    },
                    form: {
                  
                    }
                };
                request(options, function (error, response) {
                    if (error){
                        res.status(500).json({message: error})
                    }else{
                        if(response.statusCode===200)
                        {
                            var infouser =JSON.parse(response.body)
                            if (infouser.token !== undefined) {
                                const customweb=new CustomWeb({
                                    _id: new mongoose.Types.ObjectId(),
                                    idUser: req.userData._id,
                                    typeUrl: req.body.typeUrl,
                                    url: req.body.url,
                                    username: encodeUsername,
                                    password: encodePassword,
                                    token: infouser.token
                                });
                                
                                //save into database
                                customweb.save()
                                .then(results=>{
                                    res.status(201).json({
                                        message: "account Moodle custom created"
                                    });
                                })
                                .catch(err=>{
                                    res.status(500).json({
                                        error:err
                                    });
                                });
                            }else{
                                res.status(500).json({message:"Invalid fill your information"});
                            }
                        }else{
                            res.status(500).json({message:"Have error custom"});
                        }
                    }
                    
                });
            }
            //web custom is portal and save to DB not login equal username and password
            else if(req.body.typeUrl=="Portal")
            {
                const customweb=new CustomWeb({
                    _id: new mongoose.Types.ObjectId(),
                    idUser: req.userData._id,
                    typeUrl: req.body.typeUrl,
                    url: req.body.url,
                });
                
                //save into database
                customweb.save()
                .then(results=>{
                    res.status(201).json({
                        message: "account portal custom created"
                    });
                })
                .catch(err=>{
                    res.status(500).json({
                        error:err
                    });
                });
            }
            else if(req.body.typeUrl=="Classroom"){
                
                res.status(201).json({
                    message: "account custom created (Classroom) dont insert to DB"
                  });
            }
            else if(req.body.typeUrl=="Trello"){
                res.status(201).json({
                    message: "account custom created (Trello) dont insert to DB"
                  });
            }
            else if(req.body.typeUrl=="Slack"){
                res.status(201).json({
                    message: "account custom created (Slack) dont insert to DB"
                  });
            }else {
                return res.status(409).json({
                    message:"account doesnt custom"
                  });
            };
            
        }
    })
    .catch(err=>
    {
          //console.log(err);
        res.status(500).json({
        error:err
        });
    });
};



exports.Delete_Website =(req,res,next)=>{
   CustomWeb.remove({$and:[{typeUrl:req.body.typeUrl},{idUser: req.userData._id}]})
  .exec()
  .then(result=>{
    res.status(200).json({
      message:"account deleted"
    });
  })
  .catch(err=>
    {
      console.log(err);
      res.status(500).json({
        error:err
      });
    });
};