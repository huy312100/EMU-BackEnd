const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("mssql");

const Config = require("../middleware/rdbconfig");
const Account = require("../models/account");

exports.Get_All_Account =(req, res, next) => {
    Account.find()
      .exec()
      .then(docs => {
        console.log(docs);
        //   if (docs.length >= 0) {
        res.status(200).json(docs);
        //   } else {
        //       res.status(404).json({
        //           message: 'No entries found'
        //       });
        //   }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  };

exports.Get_One_Account =  (req,res,next)=>{
  const id = req.params.accountId;
  Account.findById(id)
  .exec()
  .then(doc=>{
    console.log("From DB",doc);
    if(doc){
      res.status(200).json(doc);
    }
    else{
      res.status(404).json({ message: "No Account from database"});
    }
  })
  .catch(err=>
    {
      console.log(err);
      res.status(500).json({error:err});
    });
};

exports.Post_Account_Signup = (req, res, next)=>
{
  Account.find({username:req.body.username})
  .exec()
  .then(user=>{
    if(user.length>=1){
      return res.status(409).json({
        message:"Username exists"
      });
    }else{
      bcrypt.hash(req.body.password,9, (err,hash)=>{
        if(err)
        {
          return res.status(500).json({
            error: err
          });
        }else{
          const account= new Account({
            _id: new mongoose.Types.ObjectId(),
            username: req.body.username,
            password: hash
          });
          account.save()
          .then(async results=>{
            //console.log(results);

            try {
              let pool = await sql.connect(Config);
      
              let MaTruongKhoa=await pool.request()
                  .input('Ma_Truong', sql.VarChar, req.body.MaTruong)
                  .input('Ma_Khoa', sql.VarChar, req.body.MaKhoa)
                  .query("Select uf.ID from University u,Faculty f, University_Faculty uf where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and u.MaTruong= @Ma_Truong and f.MaKhoa=@Ma_Khoa;");
      
              //console.log(MaTruongKhoa.recordsets[0][0]["ID"]);
              //res.status(200).json();
              let profile = await pool.request()
                  .input('IDSignin', sql.VarChar, account._id)
                  .input('HoTen', sql.NVarChar, req.body.HoTen)
                  .input('Email', sql.VarChar, account.username)
                  .input('IDTruongKhoa', sql.Int, MaTruongKhoa.recordsets[0][0]["ID"])
                  .input('AnhSV', sql.VarChar,req.body.AnhSV)
                  .execute('InsertProfile')
                  
                  res.status(201).json({
                    message: "account created"
                  });
              }
              catch (error) {
                  console.log(error);
                  res.status(500).json(error);
              }

            
          })
          .catch(err=>
            {
              console.log(err);
              res.status(500).json({
                error:err
              });
            });
        }
      });
    }
  });
};

exports.Post_Account_Signin = (req, res, next) => {
  Account.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              username: user[0].username,
              _id: user[0]._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: "2h"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.PutAccount = (req, res, next) => {
  const id = req.params.accountId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Account.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.Delete_Account = (req,res,next)=>{
  Account.remove({_id:req.params.username})
  .exec()
  .then(result=>{
    //if()
    console.log(req.userData);
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