const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const nodemailer = require("nodemailer");
const configNeo4j = require("../middleware/neo4jconfig");

const Config = require("../middleware/rdbconfig");
const Account = require("../models/account");
const EmailConfig = require("../middleware/mailConfig");

exports.Get_All_Account = (req, res, next) => {
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

exports.Get_One_Account = (req, res, next) => {
  const id = req.params.accountId;
  Account.findById(id)
    .exec()
    .then(doc => {
      console.log("From DB", doc);
      if (doc) {
        res.status(200).json(doc);
      }
      else {
        res.status(404).json({ message: "No Account from database" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.Post_Account_Signup = (req, res, next) => {
  Account.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Username exists"
        });
      } else {
        bcrypt.hash(req.body.password, 9, async (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const account = new Account({
              _id: new mongoose.Types.ObjectId(),
              username: req.body.username,
              password: hash,
              firstsign: true,
              role: "1"
            });

            try {
              let pool = await sql.connect(Config);

              account.save()
                .then(async (results) => {
                  //console.log(results);
                  let MaTruongKhoa = await pool.request()
                    .input('Ma_Truong', sql.VarChar, req.body.MaTruong)
                    .input('Ma_Khoa', sql.VarChar, req.body.MaKhoa)
                    .query("Select uf.ID from University u,Faculty f, University_Faculty uf where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and u.MaTruong= @Ma_Truong and f.MaKhoa=@Ma_Khoa;");

                  //console.log(MaTruongKhoa.recordsets[0][0]["ID"]);
                  //res.status(200).json();
                  if (MaTruongKhoa.recordsets[0]) {
                    console.log(account._id);
                    let profile = await pool.request()
                      .input('IDSignin', sql.VarChar, account._id)
                      .input('HoTen', sql.NVarChar, req.body.HoTen)
                      .input('Email', sql.VarChar, req.body.username)
                      .input('IDTruongKhoa', sql.Int, MaTruongKhoa.recordsets[0][0]["ID"])
                      .execute('InsertProfile')

                    const session = configNeo4j.getSession(req);
                    const query = "match (n:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u:University{code:$Ma_Truong}) " +
                      "merge (s:STUDENT {name: $Ho_Ten, email:$Email})  " +
                      "MERGE (s)-[:STUDY_AT]->(n)  ";
                    var result = session.readTransaction(tx => {
                      return tx.run(query, {
                        Ma_Khoa: req.body.MaKhoa,
                        Ma_Truong: req.body.MaTruong,
                        Email: req.body.username,
                        Ho_Ten: req.body.HoTen
                      })
                        .then(async (re1) => {

                        })
                        .catch(err => {
                          console.log(err);
                          res.status(500).json({ error: err });
                        })
                    });

                    res.status(201).json({
                      message: "account created"
                    });
                  } else {
                    Account.remove({ _id: account._id })
                      .exec().then(re2 => {
                        //console.log("oke deleted");
                      })
                      .catch(err => {
                        res.status(500).json(err);
                      })
                  }
                })
                .catch(err => {
                  console.log(err);
                  Account.remove({ _id: account._id })
                    .exec().then(re2 => {
                      //console.log("oke deleted");
                    })
                    .catch(err => {
                      res.status(500).json(err);
                    })
                  res.status(500).json({
                    error: err
                  });
                });
            }
            catch (error) {
              console.log(error);
              Account.remove({ _id: account._id })
                .exec().then(re2 => {
                  //console.log("oke deleted");
                })
                .catch(err => {
                  res.status(500).json(err);
                })
              res.status(500).json(error);
            }
          }
        });
      }
    });
};

exports.Post_Account_Signup_For_Parents = (req, res, next) => {

  Account.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Username exists"
        });
      } else {
        bcrypt.hash(req.body.password, 9, async (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const account = new Account({
              _id: new mongoose.Types.ObjectId(),
              username: req.body.username,
              password: hash,
              firstsign: true,
              role: "3"
            });
            Account.find({ username: req.userData.username })
              .exec()
              .then(async (re1) => {
                if (re1.length >= 1) {
                  if (re1[0].parent === undefined) {
                    try {
                      let pool = await sql.connect(Config);
                      account.save()
                        .then(async (results) => {
                          //console.log(results);
                          let MaTruongKhoa = await pool.request()
                            .input('IDSignin', sql.VarChar, req.userData._id)
                            .query(" select i.ID from InfoSinhVien i where i.IDSignin = @IDSignin");

                          //console.log(MaTruongKhoa.recordsets[0][0]["ID"]);
                          //res.status(200).json();
                          if (MaTruongKhoa.recordsets[0]) {
                            console.log(account._id);
                            let profile = await pool.request()
                              .input('IDSignin', sql.VarChar, account._id)
                              .input('HoTen', sql.NVarChar, req.body.HoTen)
                              .input('Email', sql.VarChar, req.body.username)
                              .input('IDSinhVien', sql.Int, MaTruongKhoa.recordsets[0][0]["ID"])
                              .execute('InsertProfileParent')

                            Account.updateOne({
                              _id: re1[0]._id
                              //"User": { $all: [UserOwner, chatmessage2.from] }
                            },
                              {
                                $set: { parent: account._id }
                              }, (err, doc) => {
                                if (err) {
                                  console.log(err);
                                  res.status(500).json({ error: err });
                                }
                                if (doc) {
                                  //console.log(doc);
                                  //res.status(200).json({ message: "Token Notification is pushed" });
                                }
                              });

                            res.status(201).json({
                              message: "account created"
                            });

                          } else {
                            //chi remove
                            Account.remove({ _id: account._id })
                              .exec().then(re2 => {
                                //console.log("oke deleted");
                              })
                              .catch(err => {
                                console.log(err);
                                res.status(500).json(err);
                              })
                          }
                        })
                        .catch(err => {
                          //remove and update
                          console.log(err);
                          Account.remove({ _id: account._id })
                            .exec().then(re2 => {
                              //console.log("oke deleted");
                            })
                            .catch(err => {
                              console.log(err);
                              res.status(500).json(err);
                            })

                          Account.updateOne({
                            _id: re1[0]._id
                            //"User": { $all: [UserOwner, chatmessage2.from] }
                          },
                            {
                              $unset: { parent: 1 }
                            }, (err, doc) => {
                              if (err) {
                                res.status(500).json({ error: err });
                              }
                              if (doc) {
                                //console.log(doc);
                                //res.status(200).json({ message: "account signed out" });
                              }
                            });

                          res.status(500).json({
                            error: err
                          });

                        });
                    } catch (error) {
                      //remove and update
                      console.log(error);
                      Account.remove({ _id: account._id })
                        .exec().then(re2 => {
                          //console.log("oke deleted");
                        })
                        .catch(err => {
                          console.log(err);
                          res.status(500).json(err);
                        })

                      Account.updateOne({
                        _id: re1[0]._id
                        //"User": { $all: [UserOwner, chatmessage2.from] }
                      },
                        {
                          $unset: { parent: 1 }
                        }, (err, doc) => {
                          if (err) {
                            res.status(500).json({ error: err });
                          }
                          if (doc) {
                            //console.log(doc);
                            //res.status(200).json({ message: "account signed out" });
                          }
                        });

                      res.status(500).json({ err: error });
                    }
                  } else {
                    res.status(500).json({ message: "You created account parent" });

                  }

                }
                else {
                  res.status(500).json({
                    error: err
                  });
                }
              })
              .catch(err => {
                console.log(err);
                //khong can update or remove
                res.status(500).json({
                  error: err
                });
              })
          }
        });
      }
    });
};

exports.Post_Token_Notification = (req, res, next) => {
  Account.find({ username: req.userData.username })
    .exec()
    .then(re1 => {
      if (re1.length >= 1) {
        if (re1[0].tokenNotifition === undefined) {
          Account.updateOne({
            _id: re1[0]._id
            //"User": { $all: [UserOwner, chatmessage2.from] }
          },
            {
              $set: { tokenNotifition: req.body.TokenNotification }
            }, (err, doc) => {
              if (err) {
                res.status(500).json({ error: err });
              }
              if (doc) {
                //console.log(doc);
                res.status(200).json({ message: "Token Notification is pushed" });
              }
            });
        } else {
          res.status(200).json({ message: "Token Notification is pushed" });
        }
      }
      else {
        res.status(401).json({
          message: "Auth failed"
        });
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    })
};

exports.Change_Password = async (req, res, next) => {
  await Account.find({ username: req.userData.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      else {
        //console.log(user[0].password);
        bcrypt.compare(req.body.Oldpassword, user[0].password, (err, result) => {
          if (err) {
            //console.log("err")
            res.status(401).json({
              message: "Auth failed"
            });
          }

          if (result) {
            console.log(result);
            bcrypt.hash(req.body.Newpassword, 9, async (err, hash) => {
              if (err) {
                res.status(500).json({
                  error: err
                });
              } else {
                await Account.updateOne({
                  _id: user[0]._id
                },
                  {
                    $set: { password: hash }
                  });
              }
              res.status(200).json({ message: "Account was changed" });
            });
          }
          else {
            res.status(401).json({
              message: "Invalid password"
            })
          }
        });
      }
    })
    .catch(err => {
      res.status(500).json({ error: err })
    })
};

exports.Forgot_Password = (req, res, next) => {
  Account.find({ username: req.body.emailApp })
    .exec()
    .then(re1 => {
      if (re1.length >= 1) {
        const token = jwt.sign(
          {
            _id: re1[0]._id
          },
          process.env.RESET_PASSWORD,
          {
            expiresIn: "20m"
          });

        var transporter = nodemailer.createTransport(EmailConfig.MailCongfig);

        const Data = {
          from: "theemuteam@gmail.com",
          to: req.body.emailReset,
          subject: "[EMU] Please reset your password",
          html: "<html>" +
            "<body>" +
            "<h2>Reset your EMU password <h2>" +
            "<p>We heard that you lost your EMU password. Sorry about that!<p>" +
            "<p>But don’t worry! You can use the following link to reset your password:<p>" +
            "<a href='https://emustudy.tk/newpassword?token=" + token + "'>Reset your password</a>" +
            "</body>" +
            "</html>"
        }
        transporter.sendMail(Data, (err, info) => {
          if (err) {
            res.status(500).json({ error: err })
          }
          else {
            Account.updateOne({
              _id: re1[0]._id
              //"User": { $all: [UserOwner, chatmessage2.from] }
            },
              {
                $set: { tokenReset: token }
              }, (err, doc) => {
                if (err) {
                  res.status(500).json({ error: err });
                }
                if (doc) {
                  //console.log(doc);
                  res.status(200).json({ message: "your mail sent" })
                }
              });
          }
        })
      } else {
        res.status(500).json({ message: "You dont have account" })
      }
    })
    .catch(err => {
      res.status(500).json({ err: err })
    })
}

exports.Reset_Password = (req, res, next) => {
  if (req.body.tokenreset) {
    try {
      const decoded = jwt.verify(req.body.tokenreset, process.env.RESET_PASSWORD);

      Account.find({ $and: [{ _id: decoded._id }, { tokenReset: req.body.tokenreset }] })
        .exec()
        .then(re1 => {
          if (re1.length >= 1) {
            bcrypt.hash(req.body.passwordreset, 9, async (err, hash) => {
              if (err) {
                res.status(500).json({
                  error: err
                });
              } else {
                await Account.updateOne({
                  _id: re1[0]._id
                },
                  {
                    $set: { password: hash },
                    $unset: { tokenReset: 1 }
                  });
                res.status(200).json({ message: "your password was reset" })
              }
            })

          } else {
            res.status(500).json({ message: "the usser is not exist" })
          }
        })
        .catch(err => {
          res.status(500).json({ err: err });
        })
    }
    catch (error) {
      res.status(500).json({ err: error });
    }
  } else {
    res.status(500).json({ message: "the usser with email is not exist" })
  }
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
              expiresIn: "3d"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            role: user[0].role,
            firstsign: user[0].firstsign,
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

exports.Sign_Out = (req, res, next) => {
  Account.find({ _id: req.userData._id })
    .exec()
    .then(re1 => {
      if (re1.length >= 1) {
        Account.updateOne({
          _id: re1[0]._id
          //"User": { $all: [UserOwner, chatmessage2.from] }
        },
          {
            $unset: { tokenNotifition: 1 }
          }, (err, doc) => {
            if (err) {
              res.status(500).json({ error: err });
            }
            if (doc) {
              //console.log(doc);
              res.status(200).json({ message: "account signed out" });
            }
          });
      } else {
        res.status(500).json({ message: "No account login in application" });
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    })
};

exports.Set_Change_First_Signin = (req, res, next) => {
  //console.log(req.userData._id);
  Account.find({ _id: req.userData._id })
    .exec()
    .then(re1 => {
      if (re1.length >= 1) {
        Account.updateOne({
          _id: re1[0]._id
          //"User": { $all: [UserOwner, chatmessage2.from] }
        },
          {
            $unset: { firstsign: 1 }
          }, (err, doc) => {
            if (err) {
              res.status(500).json({ error: err });
            }
            if (doc) {
              //console.log(doc);
              res.status(200).json({ message: "changed" });
            }
          });
      } else {
        res.status(500).json({ message: "No account login in application" });
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    })
};

exports.Delete_Account = (req, res, next) => {
  Account.remove({ _id: req.params.username })
    .exec()
    .then(result => {
      //if()
      console.log(req.userData);
      res.status(200).json({
        message: "account deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};