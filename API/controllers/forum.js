const configNeo4j = require("../dbConfig/neo4jconfig");
const Config = require("../dbConfig/rdbconfig");
const ImgConfig = require("../dbConfig/cloudImgConfig");

const sql = require("mssql");
const cloudinary = require("cloudinary");

const studuCourses = require("../models/studyCourses");

exports.Create_Post = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();
        //const test = async () => {
        //save image
        if (req.files !== null) {
            console.log(1);
            cloudinary.config(ImgConfig);
            const file = req.files.image;
            var a = await cloudinary.uploader.upload(file.tempFilePath, {}, { folder: '/Forum' })
            if (a) {
                imagepost = a.url;
                imageID = a.public_id;
            } else {
                imagepost = "";
                imageID = "";
            }
        } else {
            imagepost = "";
            imageID = "";
        }
        //}
        //test();
        //console.log(imagepost);
        //console.log(imageID)
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            //res.status(200).json(profiles.recordsets[0]);
            const session = configNeo4j.getSession(req);

            const query = "match (n:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u:University{code: $Ma_Truong})" +
                "merge (s:STUDENT {name:$Ho_Ten, email:$Email})" +
                "MERGE (s)-[:STUDY_AT]->(n)" +
                "MERGE (p:POST {title: $Title_Post, image:$ImgPost,imageid:$Imgid,time:$timestamp})" +
                "MERGE (s)-[:POSTED{scope:$scope}]->(p)";

            var result = session.writeTransaction(tx => {
                return tx.run(query, {
                    Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                    Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                    Ho_Ten: profiles.recordsets[0][0]["HoTen"],
                    Email: req.userData.username,
                    Title_Post: req.body.title,
                    ImgPost: imagepost,
                    Imgid: imageID,
                    timestamp: timestamp,
                    scope: req.body.scope
                })
                    .then(re1 => {
                        res.status(200).json({ message: "The post have created" });

                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        }
        else {
            res.status(500).json();
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }

};

exports.Like_Post = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            //res.status(200).json(profiles.recordsets[0]);
            const session = configNeo4j.getSession(req);
            const query = "match (n:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u:University{code:$Ma_Truong}) " +
                "merge (s:STUDENT {name: $Ho_Ten, email:$Email}) " +
                "MERGE (s)-[:STUDY_AT]->(n) " +
                "with s " +
                "match(p:POST) where ID(p)=$IDPost " +
                "with s,p " +
                "MERGE (s)-[:LIKED]->(p) ";
            var result = session.writeTransaction(tx => {
                return tx.run(query, {
                    Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                    Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                    Ho_Ten: profiles.recordsets[0][0]["HoTen"],
                    Email: req.userData.username,
                    IDPost: parseInt(req.body.IDPost)
                })
                    .then(re1 => {
                        res.status(200).json({ message: "The post have liked" });

                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};

exports.Comment_Post = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();
        //const test = async () => {
        //save image
        if (req.files !== null) {
            console.log(1);
            cloudinary.config(ImgConfig);
            const file = req.files.image;
            var a = await cloudinary.uploader.upload(file.tempFilePath, {}, { folder: '/Forum' })
            if (a) {
                imagepost = a.url;
                imageID = a.public_id;
            } else {
                imagepost = "";
                imageID = "";
            }
        } else {
            imagepost = "";
            imageID = "";
        }
        //}
        //test();
        console.log(imagepost);
        console.log(imageID)
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            //res.status(200).json(profiles.recordsets[0]);
            const session = configNeo4j.getSession(req);

            const query = "match (n:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u:University{code:$Ma_Truong}) " +
                "merge (s:STUDENT {name: $Ho_Ten, email:$Email})  " +
                "MERGE (s)-[:STUDY_AT]->(n)  " +
                "with s  " +
                "match(p:POST) where ID(p) = $IDPost " +
                "with s,p " +
                "MERGE (s)-[:COMMENT {comments:$commentpa, image:$ImgPost,imageid:$Imgid,time:$timestamp}]->(p) ";

            var result = session.writeTransaction(tx => {
                return tx.run(query, {
                    Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                    Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                    Ho_Ten: profiles.recordsets[0][0]["HoTen"],
                    Email: req.userData.username,
                    IDPost: parseInt(req.body.IDPost),
                    commentpa: req.body.comment,
                    ImgPost: imagepost,
                    Imgid: imageID,
                    timestamp: timestamp
                })
                    .then(re1 => {
                        //console.log(re1);
                        res.status(200).json({ message: "The post have commented" });

                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        }
        else {
            res.status(500).json();
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};

exports.Delete_Post = async (req, res, next) => {
    try {
        const resultsrecord = [];
        cloudinary.config(ImgConfig);
        const session = configNeo4j.getSession(req);

        //const query = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";
        const query = "MATCH (n:POST) <-[:POSTED]- (s:STUDENT) where id(n) = $IDPost " +
            "return ID(n) as ID, s.email as email, n.imageid as imageid";

        var result = await session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost)
            })
                .then(async (re1) => {
                    //console.log(re1);
                    //resultsrecord = re1.records[0];
                    if (re1.records.length >= 1) {
                        if (re1.records[0].get('email') === req.userData.username) {
                            if (re1.records[0].get('imageid') !== "") {
                                resultsrecord.push(re1.records[0].get('imageid'))
                            } else {
                                resultsrecord.push("a");
                            }
                        } else {
                            return res.status(500).json({ message: "You dont have role delete post" })
                        }
                    }
                    else {
                        return res.status(500).json({ message: "the post doesnt have" });
                    }


                    //const studentExist = re1.records[0].get('name');
                    //console.log(studentExist);
                    //res.status(200).json(re1.records);

                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ error: err });
                })
        })

        console.log(resultsrecord[0]);
        if (resultsrecord[0] === undefined) {
            res.status(500).json({ error: "" });
        } else if (resultsrecord[0] === "a") {

            const query1 = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";
            var result = session.writeTransaction(tx => {
                return tx.run(query1, {
                    IDPost: parseInt(req.body.IDPost)
                })
                    .then(re2 => {
                        //console.log(re1);
                        res.status(200).json({ message: "The post have deleted" });
                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        } else {
            cloudinary.uploader.destroy(resultsrecord[0], function (error, result) {
                if (result) {
                }
                else {
                    //res.status(500).json();
                }
            });
            const query1 = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";
            var result = session.writeTransaction(tx => {
                return tx.run(query1, {
                    IDPost: parseInt(req.body.IDPost)
                })
                    .then(re2 => {
                        //console.log(re1);
                        res.status(200).json({ message: "The post have deleted" });
                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.Delete_Comment = async (req, res, next) => {
    try {
        const resultsrecord = [];
        cloudinary.config(ImgConfig);
        const session = configNeo4j.getSession(req);

        //const query = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";
        const query = "MATCH (n:POST) <-[c:COMMENT]- (s:STUDENT) where id(c) = $IDCmt " +
            "return ID(c) as ID, s.email as email, c.imageid as imageid ";

        var result = await session.readTransaction(tx => {
            return tx.run(query, {
                IDCmt: parseInt(req.body.IDCmt)
            })
                .then(async (re1) => {
                    //console.log(re1);
                    //resultsrecord = re1.records[0];
                    if (re1.records.length >= 1) {
                        if (re1.records[0].get('email') === req.userData.username) {
                            if (re1.records[0].get('imageid') !== "") {
                                resultsrecord.push(re1.records[0].get('imageid'))
                            } else {
                                resultsrecord.push("a");
                            }
                        } else {
                            return res.status(500).json({ message: "You dont have role delete post" })
                        }
                    }
                    else {
                        return res.status(500).json({ message: "the comment doesnt have" });
                    }


                    //const studentExist = re1.records[0].get('name');
                    //console.log(studentExist);
                    //res.status(200).json(re1.records);

                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ error: err });
                })
        })

        console.log(resultsrecord[0]);
        if (resultsrecord[0] === undefined) {
            res.status(500).json({ error: "" });
        } else if (resultsrecord[0] === "a") {

            const query1 = "MATCH (n:POST) <-[c:COMMENT]- (s:STUDENT) where id(c) = $IDCmt  delete c";
            var result = session.writeTransaction(tx => {
                return tx.run(query1, {
                    IDCmt: parseInt(req.body.IDCmt)
                })
                    .then(re2 => {
                        //console.log(re1);
                        res.status(200).json({ message: "The post have deleted" });
                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        } else {
            cloudinary.uploader.destroy(resultsrecord[0], function (error, result) {
                if (result) {
                }
                else {
                    //res.status(500).json();
                }
            });
            const query1 = "MATCH (n:POST) <-[c:COMMENT]- (s:STUDENT) where id(c) = $IDCmt  delete c";
            var result = session.writeTransaction(tx => {
                return tx.run(query1, {
                    IDCmt: parseInt(req.body.IDCmt)
                })
                    .then(re2 => {
                        //console.log(re1);
                        res.status(200).json({ message: "The post have deleted" });
                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.Unlike_Post = async (req, res, next) => {
    try {
        const resultsrecord = [];
        cloudinary.config(ImgConfig);
        const session = configNeo4j.getSession(req);

        //const query = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";
        const query = "MATCH (n:POST) <-[l:LIKED]- (s:STUDENT) where id(n) = $IDPost and s.email = $Email  delete l";

        var result = await session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost),
                Email: req.userData.username
            })
                .then((re1) => {

                    res.status(200).json({ message: "unliked this" });

                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ error: err });
                })
        })
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.View_Post = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            //res.status(200).json(profiles.recordsets[0]);
            const session = configNeo4j.getSession(req);
            const query = "call {" +
                "match (s1:STUDENT)-[:STUDY_AT]->(f1:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u1:University{code:$Ma_Truong}) " +
                "match (p1:POST)<-[r:POSTED {scope:'f'}]-(s1) " +
                "MATCH (p3:POST) where ID(p3)=ID(p1) " +
                "match (p4:POST) where ID(p4) = ID(p1) " +
                "match (s5:STUDENT) where s5.email= $Email " +
                "match (s3:STUDENT)-[:POSTED]-> (p1) " +
                "return ID(p1) as ID,s3.email as email, p1.title as title,p1.image as image, p1.time as time, size((p3)<-[:LIKED]-()) as like,size((p4)<-[:COMMENT]-()) as comment , size((p4)<-[:LIKED]-(s5)) as likebyown,r.scope as scope " +
                "union all " +
                "match (s2:STUDENT)-[:STUDY_AT]->(f2:Faculty)-[:BELONG_TO]->(u2:University {code:$Ma_Truong}) " +
                "match (p2:POST)<-[r2:POSTED {scope:'u'}]-(s2) " +
                "MATCH (p5:POST) where ID(p5)=ID(p2) " +
                "match (p6:POST) where ID(p6) = ID(p2) " +
                "match (s6:STUDENT) where s6.email= $Email " +
                "match (s4:STUDENT)-[:POSTED]-> (p2) " +
                "return ID(p2) as ID,s4.email as email, p2.title as title,p2.image as image, p2.time as time, size((p5)<-[:LIKED]-()) as like,size((p6)<-[:COMMENT]-()) as comment ,size((p6)<-[:LIKED]-(s6)) as likebyown,r2.scope as scope " +
                "} " +
                "return DISTINCT ID,email,title,image,time,like,comment, likebyown, scope " +
                "ORDER BY time DESC";
            var result = session.readTransaction(tx => {
                return tx.run(query, {
                    Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                    Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                    Email: req.userData.username
                })
                    .then(async (re1) => {
                        const result = []
                        if (re1.records.length >= 1) {
                            for (var i = 0; i < re1.records.length; i++) {
                                let profiles1 = await pool.request()
                                    .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                    .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                                if (profiles1.recordsets[0]) {
                                    var temp = {
                                        "ID": re1.records[i].get('ID').low,
                                        "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                        "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                        "EmailOwn": re1.records[i].get('email'),
                                        "title": re1.records[i].get('title'),
                                        "image": re1.records[i].get('image'),
                                        "time": re1.records[i].get('time'),
                                        "like": re1.records[i].get('like').low,
                                        "comment": re1.records[i].get('comment').low,
                                        "LikeByOwn": re1.records[i].get('likebyown').low,
                                        "scope": re1.records[i].get('scope')
                                    }
                                    if (result !== undefined) {
                                        result.push(temp);
                                    }
                                    else {
                                        result = temp;
                                    }
                                }
                            }
                            //console.log(result);
                            res.status(200).json(result);
                        }
                        else {
                            res.status(200).json(result);
                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};

exports.View_Top20_Post = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            //res.status(200).json(profiles.recordsets[0]);
            const session = configNeo4j.getSession(req);
            const query = "call {" +
                "match (s1:STUDENT)-[:STUDY_AT]->(f1:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u1:University{code:$Ma_Truong}) " +
                "match (p1:POST)<-[r:POSTED {scope:'f'}]-(s1) " +
                "MATCH (p3:POST) where ID(p3)=ID(p1) " +
                "match (p4:POST) where ID(p4) = ID(p1) " +
                "match (s5:STUDENT) where s5.email= $Email " +
                "match (s3:STUDENT)-[:POSTED]-> (p1) " +
                "return ID(p1) as ID,s3.email as email, p1.title as title,p1.image as image, p1.time as time, size((p3)<-[:LIKED]-()) as like,size((p4)<-[:COMMENT]-()) as comment , size((p4)<-[:LIKED]-(s5)) as likebyown,r.scope as scope " +
                "union all " +
                "match (s2:STUDENT)-[:STUDY_AT]->(f2:Faculty)-[:BELONG_TO]->(u2:University {code:$Ma_Truong}) " +
                "match (p2:POST)<-[r2:POSTED {scope:'u'}]-(s2) " +
                "MATCH (p5:POST) where ID(p5)=ID(p2) " +
                "match (p6:POST) where ID(p6) = ID(p2) " +
                "match (s6:STUDENT) where s6.email= $Email " +
                "match (s4:STUDENT)-[:POSTED]-> (p2) " +
                "return ID(p2) as ID,s4.email as email, p2.title as title,p2.image as image, p2.time as time, size((p5)<-[:LIKED]-()) as like,size((p6)<-[:COMMENT]-()) as comment ,size((p6)<-[:LIKED]-(s6)) as likebyown,r2.scope as scope " +
                "} " +
                "return DISTINCT ID,email,title,image,time,like,comment, likebyown, scope " +
                "ORDER BY time DESC" +
                "LIMIT 20";
            var result = session.readTransaction(tx => {
                return tx.run(query, {
                    Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                    Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                    Email: req.userData.username
                })
                    .then(async (re1) => {
                        const result = []
                        if (re1.records.length >= 1) {
                            for (var i = 0; i < re1.records.length; i++) {
                                let profiles1 = await pool.request()
                                    .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                    .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                                if (profiles1.recordsets[0]) {
                                    var temp = {
                                        "ID": re1.records[i].get('ID').low,
                                        "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                        "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                        "EmailOwn": re1.records[i].get('email'),
                                        "title": re1.records[i].get('title'),
                                        "image": re1.records[i].get('image'),
                                        "time": re1.records[i].get('time'),
                                        "like": re1.records[i].get('like').low,
                                        "comment": re1.records[i].get('comment').low,
                                        "LikeByOwn": re1.records[i].get('likebyown').low,
                                        "scope": re1.records[i].get('scope')
                                    }
                                    if (result !== undefined) {
                                        result.push(temp);
                                    }
                                    else {
                                        result = temp;
                                    }
                                }
                            }
                            //console.log(result);
                            res.status(200).json(result);
                        }
                        else {
                            res.status(200).json(result);
                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};

exports.View_List_User_Liked = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);
        const session = configNeo4j.getSession(req);
        const query = "MATCH (p:POST) where ID(p)= $IDPost " +
            "match (s:STUDENT)-[:LIKED]->(p) " +
            "return s.email as email ";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost)
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "Name": profiles1.recordsets[0][0]["HoTen"],
                                    "Email": re1.records[i].get('email'),
                                    "Avart": profiles1.recordsets[0][0]["AnhSV"]
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }
                    //console.log(re1.records.length)
                    //console.log(re1.records);


                    //const studentExist = re1.records[0].get('name');
                    //console.log(studentExist);
                    //res.status(200).json(re1.records);

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })
    }
    catch (error) {
        //console.log(error);
        res.status(500).json({ err: error });
    }
};

exports.View_List_User_Commented = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);
        const session = configNeo4j.getSession(req);
        const query = "match(p:POST) where ID(p)= $IDPost " +
            "match (s:STUDENT)-[r:COMMENT]->(p) " +
            "return ID(r) as ID,s.email as email, r.comments as comment, r.image as image, r.time as time " +
            "order by time DESC ";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost)
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "ID": re1.records[i].get('ID').low,
                                    "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                    "EmailOwn": re1.records[i].get('email'),
                                    "AvartOwn": profiles1.recordsets[0][0]["AnhSV"],
                                    "comment": re1.records[i].get('comment'),
                                    "image": re1.records[i].get('image'),
                                    "time": re1.records[i].get('time'),
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })
    }
    catch (error) {
        //console.log(error);
        res.status(500).json({ err: error });
    }
};

exports.View_List_Top15_User_Commented = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);
        const session = configNeo4j.getSession(req);
        const query = "match(p:POST) where ID(p)= $IDPost " +
            "match (s:STUDENT)-[r:COMMENT]->(p) " +
            "return ID(r) as ID,s.email as email, r.comments as comment, r.image as image, r.time as time " +
            "order by time DESC " +
            "LIMIT 15";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost)
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "ID": re1.records[i].get('ID').low,
                                    "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                    "EmailOwn": re1.records[i].get('email'),
                                    "AvartOwn": profiles1.recordsets[0][0]["AnhSV"],
                                    "comment": re1.records[i].get('comment'),
                                    "image": re1.records[i].get('image'),
                                    "time": re1.records[i].get('time'),
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })
    }
    catch (error) {
        //console.log(error);
        res.status(500).json({ err: error });
    }
};

exports.View_Your_Post = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);
        //res.status(200).json(profiles.recordsets[0]);
        const session = configNeo4j.getSession(req);
        const query = "match (s6:STUDENT) where s6.email= $Email "+
                    "match (s2:STUDENT {email:$Email})-[r2:POSTED]-> (p2) " +
                    "return ID(p2) as ID,s2.email as email, p2.title as title,p2.image as image, p2.time as time, size((p2)<-[:LIKED]-()) as like,size((p2)<-[:COMMENT]-()) as comment ,size((p2)<-[:LIKED]-(s6)) as likebyown,r2.scope as scope "+
                    "order by time DESC ";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                Email: req.userData.username
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "ID": re1.records[i].get('ID').low,
                                    "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                    "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                    "EmailOwn": re1.records[i].get('email'),
                                    "title": re1.records[i].get('title'),
                                    "image": re1.records[i].get('image'),
                                    "time": re1.records[i].get('time'),
                                    "like": re1.records[i].get('like').low,
                                    "comment": re1.records[i].get('comment').low,
                                    "LikeByOwn": re1.records[i].get('likebyown').low,
                                    "scope": re1.records[i].get('scope')
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })

    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};

exports.View_Detail_Post = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);
        //res.status(200).json(profiles.recordsets[0]);
        const session = configNeo4j.getSession(req);
        const query = "match (p:POST) <-[r:POSTED]-(s1:STUDENT) where ID(p)= $IDPost "+
                    "match (s:STUDENT {email: $Email}) "+
                    "return ID(p) as ID,s1.email as email, p.title as title,p.image as image, p.time as time, size((p)<-[:LIKED]-()) as like,size((p)<-[:COMMENT]-()) as comment , size((p)<-[:LIKED]-(s)) as likebyown, r.scope as scope";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                Email: req.userData.username,
                IDPost: parseInt(req.body.IDPost)
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "ID": re1.records[i].get('ID').low,
                                    "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                    "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                    "EmailOwn": re1.records[i].get('email'),
                                    "title": re1.records[i].get('title'),
                                    "image": re1.records[i].get('image'),
                                    "time": re1.records[i].get('time'),
                                    "like": re1.records[i].get('like').low,
                                    "comment": re1.records[i].get('comment').low,
                                    "LikeByOwn": re1.records[i].get('likebyown').low,
                                    "scope": re1.records[i].get('scope')
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })

    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};

exports.Create_Post_Courses = async (req, res, next) => {
    try {
        var infoCourses;
        await studuCourses.find({ $and: [{ idUser: req.userData._id }, { "listCourses.IDCourses": req.body.IDCourses }] })
            .exec()
            .then((re1) => {
                if (re1.length >= 1) {
                    infoCourses = re1[0].listCourses.filter(el => el.IDCourses === req.body.IDCourses);
                } else {
                    res.status(500).json({ message: "You dont have role create post" });
                }
            })
            .catch(err => {
                res.status(500).json({ err: err });
            })

        if (infoCourses !== undefined) {

            const currentDate = new Date();
            const timestamp = currentDate.getTime();
            //const test = async () => {
            //save image
            if (req.files !== null) {
                console.log(1);
                cloudinary.config(ImgConfig);
                const file = req.files.image;
                var a = await cloudinary.uploader.upload(file.tempFilePath, {}, { folder: '/ForumCourses' })
                if (a) {
                    imagepost = a.url;
                    imageID = a.public_id;
                } else {
                    imagepost = "";
                    imageID = "";
                }
            } else {
                imagepost = "";
                imageID = "";
            }
            //}
            //test();
            //console.log(imagepost);
            //console.log(imageID)
            let pool = await sql.connect(Config);

            let profiles = await pool.request()
                .input('ID_Signin', sql.VarChar, req.userData._id)
                .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

            //console.log(facultys.recordsets[0]);
            if (profiles.recordsets[0]) {
                //res.status(200).json(profiles.recordsets[0]);
                const session = configNeo4j.getSession(req);

                const query = "match (n:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u:University{code: $Ma_Truong})" +
                    "merge (s:STUDENT {name:$Ho_Ten, email:$Email})" +
                    "MERGE (s)-[:STUDY_AT]->(n)" +
                    "merge (c:COURSES {name: $name_courses,code:$IDCourses}) " +
                    "merge (s)-[:HAVE]->(c) " +
                    "MERGE (p:POST {title: $Title_Post, image:$ImgPost,imageid:$Imgid,time:$timestamp})" +
                    "MERGE (c)-[:POSTED {postby:$Email}]->(p)";

                var result = session.writeTransaction(tx => {
                    return tx.run(query, {
                        Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                        Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                        Ho_Ten: profiles.recordsets[0][0]["HoTen"],
                        Email: req.userData.username,
                        name_courses: infoCourses[0].name,
                        IDCourses: infoCourses[0].IDCourses,
                        Title_Post: req.body.title,
                        ImgPost: imagepost,
                        Imgid: imageID,
                        timestamp: timestamp,
                        scope: req.body.scope
                    })
                        .then(re1 => {
                            res.status(200).json({ message: "The post have created" });

                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: err });
                        })
                })
            }
            else {
                res.status(500).json();
            }
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.Delete_Post_Courses = async (req, res, next) => {
    try {
        const resultsrecord = [];
        cloudinary.config(ImgConfig);
        const session = configNeo4j.getSession(req);

        //const query = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";
        const query = "MATCH (n:POST) <-[p:POSTED]- (s:COURSES) where id(n) = $IDPost " +
            "return ID(n) as ID, p.postby as email, n.imageid as imageid ";

        var result = await session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost)
            })
                .then(async (re1) => {
                    //console.log(re1);
                    //resultsrecord = re1.records[0];
                    if (re1.records.length >= 1) {
                        if (re1.records[0].get('email') === req.userData.username) {
                            if (re1.records[0].get('imageid') !== "") {
                                resultsrecord.push(re1.records[0].get('imageid'))
                            } else {
                                resultsrecord.push("a");
                            }
                        } else {
                            return res.status(500).json({ message: "You dont have role delete post" })
                        }
                    }
                    else {
                        return res.status(500).json({ message: "the post doesnt have" });
                    }


                    //const studentExist = re1.records[0].get('name');
                    //console.log(studentExist);
                    //res.status(200).json(re1.records);

                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).json({ error: err });
                })
        })

        console.log(resultsrecord[0]);
        if (resultsrecord[0] === undefined) {
            res.status(500).json({ error: "" });
        } else if (resultsrecord[0] === "a") {

            const query1 = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";
            var result = session.writeTransaction(tx => {
                return tx.run(query1, {
                    IDPost: parseInt(req.body.IDPost)
                })
                    .then(re2 => {
                        //console.log(re1);
                        res.status(200).json({ message: "The post have deleted" });
                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        } else {
            cloudinary.uploader.destroy(resultsrecord[0], function (error, result) {
                if (result) {
                }
                else {
                    //res.status(500).json();
                }
            });
            const query1 = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";
            var result = session.writeTransaction(tx => {
                return tx.run(query1, {
                    IDPost: parseInt(req.body.IDPost)
                })
                    .then(re2 => {
                        //console.log(re1);
                        res.status(200).json({ message: "The post have deleted" });
                        //const studentExist = re1.records[0].get('name');
                        //console.log(studentExist);
                        //res.status(200).json(re1.records);

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }

}

exports.Comment_Post_Courses = async (req, res, next) => {
    try {
        const resultsrecord = [];

        const currentDate = new Date();
        const timestamp = currentDate.getTime();
        //const test = async () => {
        //save image
        if (req.files !== null) {
            console.log(1);
            cloudinary.config(ImgConfig);
            const file = req.files.image;
            var a = await cloudinary.uploader.upload(file.tempFilePath, {}, { folder: '/ForumCourses' })
            if (a) {
                imagepost = a.url;
                imageID = a.public_id;
            } else {
                imagepost = "";
                imageID = "";
            }
        } else {
            imagepost = "";
            imageID = "";
        }
        //}
        //test();
        console.log(imagepost);
        console.log(imageID)
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            //res.status(200).json(profiles.recordsets[0]);
            const session = configNeo4j.getSession(req);

            const query = "match (p:POST) <-[:POSTED]- (c:COURSES) where ID(p)= $IDPost " +
                "return ID(p) as ID, c.code as IDCourses ";

            var result = await session.readTransaction(tx => {
                return tx.run(query, {
                    IDPost: parseInt(req.body.IDPost)
                })
            })
                .then(async (re) => {
                    if (re.records.length >= 1) {
                        await studuCourses.find({ $and: [{ idUser: req.userData._id }, { "listCourses.IDCourses": re.records[0].get('IDCourses') }] })
                            .exec()
                            .then(re3 => {
                                if (re3.length >= 1) {
                                    resultsrecord.push("a");
                                } else {
                                    res.status(500).json({ message: "you dont have role comment this post" })
                                }
                            })
                            .catch(err => {
                                res.status(500).json({ err: err });
                            })
                    } else {
                        res.status(500).json({ message: "The post doesnt have" });
                    }
                })
                .catch(err => {
                    res.status(500).json({ error: err });
                })

            if (resultsrecord[0] !== undefined) {

                const query1 = "match (n:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u:University{code:$Ma_Truong}) " +
                    "merge (s:STUDENT {name: $Ho_Ten, email:$Email})  " +
                    "MERGE (s)-[:STUDY_AT]->(n)  " +
                    "with s  " +
                    "match(p:POST) where ID(p) = $IDPost " +
                    "with s,p " +
                    "MERGE (s)-[:COMMENT {comments:$commentpa, image:$ImgPost,imageid:$Imgid,time:$timestamp}]->(p) ";

                var result2 = session.writeTransaction(tx => {
                    return tx.run(query1, {
                        Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                        Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                        Ho_Ten: profiles.recordsets[0][0]["HoTen"],
                        Email: req.userData.username,
                        IDPost: parseInt(req.body.IDPost),
                        commentpa: req.body.comment,
                        ImgPost: imagepost,
                        Imgid: imageID,
                        timestamp: timestamp
                    })
                        .then(re1 => {
                            //console.log(re1);
                            res.status(200).json({ message: "The post have commented" });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: err });
                        })
                })
            } else {
                res.status(500).json({ message: "you dont have role comment this post" });
            }
        }
        else {
            res.status(500).json();
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.Like_Post_Courses = async (req, res, next) => {
    try {
        const resultsrecord = [];

        const currentDate = new Date();
        const timestamp = currentDate.getTime();

        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            //res.status(200).json(profiles.recordsets[0]);
            const session = configNeo4j.getSession(req);

            const query = "match (p:POST) <-[:POSTED]- (c:COURSES) where ID(p)= $IDPost " +
                "return ID(p) as ID, c.code as IDCourses ";

            var result = await session.readTransaction(tx => {
                return tx.run(query, {
                    IDPost: parseInt(req.body.IDPost)
                })
            })
                .then(async (re) => {
                    if (re.records.length >= 1) {
                        await studuCourses.find({ $and: [{ idUser: req.userData._id }, { "listCourses.IDCourses": re.records[0].get('IDCourses') }] })
                            .exec()
                            .then(re3 => {
                                if (re3.length >= 1) {
                                    resultsrecord.push("a");
                                } else {
                                    res.status(500).json({ message: "you dont have role like this post" })
                                }
                            })
                            .catch(err => {
                                res.status(500).json({ err: err });
                            })
                    } else {
                        res.status(500).json({ message: "The post doesnt have" });
                    }
                })
                .catch(err => {
                    res.status(500).json({ error: err });
                })

            if (resultsrecord[0] !== undefined) {

                const query1 = "match (n:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u:University{code:$Ma_Truong}) " +
                    "merge (s:STUDENT {name: $Ho_Ten, email:$Email})  " +
                    "MERGE (s)-[:STUDY_AT]->(n)  " +
                    "with s  " +
                    "match(p:POST) where ID(p) = $IDPost " +
                    "with s,p " +
                    "MERGE (s)-[:LIKED]->(p) ";

                var result2 = session.writeTransaction(tx => {
                    return tx.run(query1, {
                        Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                        Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                        Ho_Ten: profiles.recordsets[0][0]["HoTen"],
                        Email: req.userData.username,
                        IDPost: parseInt(req.body.IDPost),
                        timestamp: timestamp
                    })
                        .then(re1 => {
                            //console.log(re1);
                            res.status(200).json({ message: "The post have liked" });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: err });
                        })
                })
            } else {
                res.status(500).json({ message: "you dont have role comment this post" });
            }
        }
        else {
            res.status(500).json();
        }
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.View_Post_Courses = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        //console.log(facultys.recordsets[0]);

        //res.status(200).json(profiles.recordsets[0]);
        const session = configNeo4j.getSession(req);
        const query = "match (p1:POST)<-[r:POSTED]-(c1:COURSES) <-[:HAVE]-(s1:STUDENT) where s1.email= $Email " +
            "MATCH (p3:POST) where ID(p3) = ID(p1) " +
            "match (s5:STUDENT) where s5.email= $Email " +
            "return DISTINCT ID(p1) as ID,c1.code as IDCourses,c1.name as nameCourses,r.postby as email, p1.title as title,p1.image as image, p1.time as time, size((p3)<-[:LIKED]-()) as like,size((p3)<-[:COMMENT]-()) as comment , size((p3)<-[:LIKED]-(s5)) as likebyown " +
            "ORDER BY time DESC";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                Email: req.userData.username
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "ID": re1.records[i].get('ID').low,
                                    "IDCourses": re1.records[i].get('IDCourses'),
                                    "NameCourses": re1.records[i].get('nameCourses'),
                                    "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                    "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                    "EmailOwn": re1.records[i].get('email'),
                                    "title": re1.records[i].get('title'),
                                    "image": re1.records[i].get('image'),
                                    "time": re1.records[i].get('time'),
                                    "like": re1.records[i].get('like').low,
                                    "comment": re1.records[i].get('comment').low,
                                    "LikeByOwn": re1.records[i].get('likebyown').low
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })

    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.View_Top20_Post_Courses = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        //console.log(facultys.recordsets[0]);

        //res.status(200).json(profiles.recordsets[0]);
        const session = configNeo4j.getSession(req);
        const query = "match (p1:POST)<-[r:POSTED]-(c1:COURSES) <-[:HAVE]-(s1:STUDENT) where s1.email= $Email " +
            "MATCH (p3:POST) where ID(p3) = ID(p1) " +
            "match (s5:STUDENT) where s5.email= $Email " +
            "return DISTINCT ID(p1) as ID,c1.code as IDCourses,c1.name as nameCourses,r.postby as email, p1.title as title,p1.image as image, p1.time as time, size((p3)<-[:LIKED]-()) as like,size((p3)<-[:COMMENT]-()) as comment , size((p3)<-[:LIKED]-(s5)) as likebyown " +
            "ORDER BY time DESC" +
            "LIMIT 20";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                Email: req.userData.username
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "ID": re1.records[i].get('ID').low,
                                    "IDCourses": re1.records[i].get('IDCourses'),
                                    "NameCourses": re1.records[i].get('nameCourses'),
                                    "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                    "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                    "EmailOwn": re1.records[i].get('email'),
                                    "title": re1.records[i].get('title'),
                                    "image": re1.records[i].get('image'),
                                    "time": re1.records[i].get('time'),
                                    "like": re1.records[i].get('like').low,
                                    "comment": re1.records[i].get('comment').low,
                                    "LikeByOwn": re1.records[i].get('likebyown').low
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })

    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};

exports.View_Post_One_Courses = async (req, res, next) => {
    try {

        await studuCourses.find({ $and: [{ idUser: req.userData._id }, { "listCourses.IDCourses": req.body.IDCourses }] })
            .exec()
            .then(async (re3) => {
                if (re3.length >= 1) {
                    let pool = await sql.connect(Config);

                    //console.log(facultys.recordsets[0]);

                    //res.status(200).json(profiles.recordsets[0]);
                    const session = configNeo4j.getSession(req);
                    const query = "match (p1:POST)<-[r:POSTED]-(c1:COURSES) where c1.code= $IDCourses " +
                        "MATCH (p3:POST) where ID(p3) = ID(p1) " +
                        "match (s5:STUDENT) where s5.email= $Email " +
                        "return DISTINCT ID(p1) as ID,r.postby as email, p1.title as title,p1.image as image, p1.time as time, size((p3)<-[:LIKED]-()) as like,size((p3)<-[:COMMENT]-()) as comment , size((p3)<-[:LIKED]-(s5)) as likebyown " +
                        "ORDER BY time DESC";
                    var result = session.readTransaction(tx => {
                        return tx.run(query, {
                            Email: req.userData.username,
                            IDCourses: req.body.IDCourses
                        })
                            .then(async (re1) => {
                                const result = []
                                if (re1.records.length >= 1) {
                                    for (var i = 0; i < re1.records.length; i++) {
                                        let profiles1 = await pool.request()
                                            .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                            .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                                        if (profiles1.recordsets[0]) {
                                            var temp = {
                                                "ID": re1.records[i].get('ID').low,
                                                "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                                "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                                "EmailOwn": re1.records[i].get('email'),
                                                "title": re1.records[i].get('title'),
                                                "image": re1.records[i].get('image'),
                                                "time": re1.records[i].get('time'),
                                                "like": re1.records[i].get('like').low,
                                                "comment": re1.records[i].get('comment').low,
                                                "LikeByOwn": re1.records[i].get('likebyown').low
                                            }
                                            if (result !== undefined) {
                                                result.push(temp);
                                            }
                                            else {
                                                result = temp;
                                            }
                                        }
                                    }
                                    //console.log(result);
                                    res.status(200).json(result);
                                }
                                else {
                                    res.status(200).json(result);
                                }

                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ error: err });
                            })
                    })
                } else {
                    res.status(500).json({ message: "You dont have role view post" });
                }
            })
            .catch(err => {
                res.status(500).json({ err: err });
            })
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.View_Top20_Post_One_Courses = async (req, res, next) => {
    try {

        await studuCourses.find({ $and: [{ idUser: req.userData._id }, { "listCourses.IDCourses": req.body.IDCourses }] })
            .exec()
            .then(async (re3) => {
                if (re3.length >= 1) {
                    let pool = await sql.connect(Config);

                    //console.log(facultys.recordsets[0]);

                    //res.status(200).json(profiles.recordsets[0]);
                    const session = configNeo4j.getSession(req);
                    const query = "match (p1:POST)<-[r:POSTED]-(c1:COURSES) where c1.code= $IDCourses " +
                        "MATCH (p3:POST) where ID(p3) = ID(p1) " +
                        "match (s5:STUDENT) where s5.email= $Email " +
                        "return DISTINCT ID(p1) as ID,r.postby as email, p1.title as title,p1.image as image, p1.time as time, size((p3)<-[:LIKED]-()) as like,size((p3)<-[:COMMENT]-()) as comment , size((p3)<-[:LIKED]-(s5)) as likebyown " +
                        "ORDER BY time DESC" +
                        "LIMIT 20";
                    var result = session.readTransaction(tx => {
                        return tx.run(query, {
                            Email: req.userData.username,
                            IDCourses: req.body.IDCourses
                        })
                            .then(async (re1) => {
                                const result = []
                                if (re1.records.length >= 1) {
                                    for (var i = 0; i < re1.records.length; i++) {
                                        let profiles1 = await pool.request()
                                            .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                            .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                                        if (profiles1.recordsets[0]) {
                                            var temp = {
                                                "ID": re1.records[i].get('ID').low,
                                                "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                                "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                                "EmailOwn": re1.records[i].get('email'),
                                                "title": re1.records[i].get('title'),
                                                "image": re1.records[i].get('image'),
                                                "time": re1.records[i].get('time'),
                                                "like": re1.records[i].get('like').low,
                                                "comment": re1.records[i].get('comment').low,
                                                "LikeByOwn": re1.records[i].get('likebyown').low
                                            }
                                            if (result !== undefined) {
                                                result.push(temp);
                                            }
                                            else {
                                                result = temp;
                                            }
                                        }
                                    }
                                    //console.log(result);
                                    res.status(200).json(result);
                                }
                                else {
                                    res.status(200).json(result);
                                }

                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({ error: err });
                            })
                    })
                } else {
                    res.status(500).json({ message: "You dont have role view post" });
                }
            })
            .catch(err => {
                res.status(500).json({ err: err });
            })
    }
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.View_List_User_Like_Courses = async (req, res, next) => {
    try {
        var resultsrecord = [];
        let pool = await sql.connect(Config);
        const session = configNeo4j.getSession(req);

        const query = "MATCH (p:POST) <-[:POSTED]- (c:COURSES) <-[:HAVE]- (s:STUDENT) where ID(p)= $IDPost and s.email= $Email " +
            "return  c.code as IDCourses";

        var result = await session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost),
                Email: req.userData.username
            })
                .then(re2 => {
                    if (re2.records.length >= 1) {
                        resultsrecord.push("a");
                    }
                    else {
                        res.status(500).json({ message: "You dont have role view like post" })
                    }
                })
                .catch(err => {
                    res.status(500).json({ err: err });
                })
        })

        if (resultsrecord !== undefined) {
            const query1 = "MATCH (p:POST) where ID(p)= $IDPost " +
                "match (s:STUDENT)-[:LIKED]->(p) " +
                "return s.email as email ";
            var result1 = session.readTransaction(tx => {
                return tx.run(query1, {
                    IDPost: parseInt(req.body.IDPost)
                })
                    .then(async (re1) => {
                        const result = []
                        if (re1.records.length >= 1) {
                            for (var i = 0; i < re1.records.length; i++) {
                                let profiles1 = await pool.request()
                                    .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                    .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                                if (profiles1.recordsets[0]) {
                                    var temp = {
                                        "Name": profiles1.recordsets[0][0]["HoTen"],
                                        "Email": re1.records[i].get('email'),
                                        "Avart": profiles1.recordsets[0][0]["AnhSV"]
                                    }
                                    if (result !== undefined) {
                                        result.push(temp);
                                    }
                                    else {
                                        result = temp;
                                    }
                                }
                            }
                            //console.log(result);
                            res.status(200).json(result);
                        }
                        else {
                            res.status(200).json(result);
                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        } else {
            res.status(500).json({ message: "You dont have role view like post" });
        }
    }
    catch (error) {
        //console.log(error);
        res.status(500).json({ err: error });
    }
};

exports.View_List_User_comment_Courses = async (req, res, next) => {
    try {
        var resultsrecord = [];
        let pool = await sql.connect(Config);
        const session = configNeo4j.getSession(req);

        const query = "MATCH (p:POST) <-[:POSTED]- (c:COURSES) <-[:HAVE]- (s:STUDENT) where ID(p)= $IDPost and s.email= $Email " +
            "return  c.code as IDCourses";

        var result = await session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost),
                Email: req.userData.username
            })
                .then(re2 => {
                    if (re2.records.length >= 1) {
                        resultsrecord.push("a");
                    }
                    else {
                        res.status(500).json({ message: "You dont have role view like post" })
                    }
                })
                .catch(err => {
                    res.status(500).json({ err: err });
                })
        })

        if (resultsrecord !== undefined) {
            const query1 = "match(p:POST) where ID(p)= $IDPost " +
                "match (s:STUDENT)-[r:COMMENT]->(p) " +
                "return ID(r) as ID,s.email as email, r.comments as comment, r.image as image, r.time as time " +
                "order by time DESC ";
            var result1 = session.readTransaction(tx => {
                return tx.run(query1, {
                    IDPost: parseInt(req.body.IDPost)
                })
                    .then(async (re1) => {
                        const result = []
                        if (re1.records.length >= 1) {
                            for (var i = 0; i < re1.records.length; i++) {
                                let profiles1 = await pool.request()
                                    .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                    .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                                if (profiles1.recordsets[0]) {
                                    var temp = {
                                        "ID": re1.records[i].get('ID').low,
                                        "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                        "EmailOwn": re1.records[i].get('email'),
                                        "AvartOwn": profiles1.recordsets[0][0]["AnhSV"],
                                        "comment": re1.records[i].get('comment'),
                                        "image": re1.records[i].get('image'),
                                        "time": re1.records[i].get('time'),
                                    }
                                    if (result !== undefined) {
                                        result.push(temp);
                                    }
                                    else {
                                        result = temp;
                                    }
                                }
                            }
                            //console.log(result);
                            res.status(200).json(result);
                        }
                        else {
                            res.status(200).json(result);
                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        } else {
            res.status(500).json({ message: "You dont have role view like post" });
        }
    }
    catch (error) {
        //console.log(error);
        res.status(500).json({ err: error });
    }
};

exports.View_Top15_List_User_comment_Courses = async (req, res, next) => {
    try {
        var resultsrecord = [];
        let pool = await sql.connect(Config);
        const session = configNeo4j.getSession(req);

        const query = "MATCH (p:POST) <-[:POSTED]- (c:COURSES) <-[:HAVE]- (s:STUDENT) where ID(p)= $IDPost and s.email= $Email " +
            "return  c.code as IDCourses";

        var result = await session.readTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost),
                Email: req.userData.username
            })
                .then(re2 => {
                    if (re2.records.length >= 1) {
                        resultsrecord.push("a");
                    }
                    else {
                        res.status(500).json({ message: "You dont have role view like post" })
                    }
                })
                .catch(err => {
                    res.status(500).json({ err: err });
                })
        })

        if (resultsrecord !== undefined) {
            const query1 = "match(p:POST) where ID(p)= $IDPost " +
                "match (s:STUDENT)-[r:COMMENT]->(p) " +
                "return ID(r) as ID,s.email as email, r.comments as comment, r.image as image, r.time as time " +
                "order by time DESC " +
                "LIMIT 15";
            var result1 = session.readTransaction(tx => {
                return tx.run(query1, {
                    IDPost: parseInt(req.body.IDPost)
                })
                    .then(async (re1) => {
                        const result = []
                        if (re1.records.length >= 1) {
                            for (var i = 0; i < re1.records.length; i++) {
                                let profiles1 = await pool.request()
                                    .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                    .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                                if (profiles1.recordsets[0]) {
                                    var temp = {
                                        "ID": re1.records[i].get('ID').low,
                                        "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                        "EmailOwn": re1.records[i].get('email'),
                                        "AvartOwn": profiles1.recordsets[0][0]["AnhSV"],
                                        "comment": re1.records[i].get('comment'),
                                        "image": re1.records[i].get('image'),
                                        "time": re1.records[i].get('time'),
                                    }
                                    if (result !== undefined) {
                                        result.push(temp);
                                    }
                                    else {
                                        result = temp;
                                    }
                                }
                            }
                            //console.log(result);
                            res.status(200).json(result);
                        }
                        else {
                            res.status(200).json(result);
                        }

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            })
        } else {
            res.status(500).json({ message: "You dont have role view like post" });
        }
    }
    catch (error) {
        //console.log(error);
        res.status(500).json({ err: error });
    }
}

exports.View_Your_Post_Courses = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        //console.log(facultys.recordsets[0]);

        //res.status(200).json(profiles.recordsets[0]);
        const session = configNeo4j.getSession(req);
        const query = "match (p1:POST)<-[r:POSTED]-(c1:COURSES) <-[:HAVE]-(s1:STUDENT) where r.postby= $Email "+
                        "MATCH (p3:POST) where ID(p3) = ID(p1) "+
                        "match (s5:STUDENT) where s5.email= $Email "+
                        "return DISTINCT ID(p1) as ID,c1.code as IDCourses,c1.name as nameCourses,r.postby as email, p1.title as title,p1.image as image, p1.time as time, size((p3)<-[:LIKED]-()) as like,size((p3)<-[:COMMENT]-()) as comment , size((p3)<-[:LIKED]-(s5)) as likebyown "+
                        "ORDER BY time DESC";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                Email: req.userData.username
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "ID": re1.records[i].get('ID').low,
                                    "IDCourses": re1.records[i].get('IDCourses'),
                                    "NameCourses": re1.records[i].get('nameCourses'),
                                    "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                    "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                    "EmailOwn": re1.records[i].get('email'),
                                    "title": re1.records[i].get('title'),
                                    "image": re1.records[i].get('image'),
                                    "time": re1.records[i].get('time'),
                                    "like": re1.records[i].get('like').low,
                                    "comment": re1.records[i].get('comment').low,
                                    "LikeByOwn": re1.records[i].get('likebyown').low
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })

    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};

exports.View_Deatil_Post_Courses = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        //console.log(facultys.recordsets[0]);

        //res.status(200).json(profiles.recordsets[0]);
        const session = configNeo4j.getSession(req);
        const query = "match (p:POST) <-[r:POSTED]-(c:COURSES) where ID(p)= $IDPost "+
                    "match (s:STUDENT {email: $Email}) "+
                    "return ID(p) as ID,c.code as IDCourses,c.name as nameCourses, r.postby as email, p.title as title,p.image as image, p.time as time, size((p)<-[:LIKED]-()) as like,size((p)<-[:COMMENT]-()) as comment , size((p)<-[:LIKED]-(s)) as likebyown ";
        var result = session.readTransaction(tx => {
            return tx.run(query, {
                Email: req.userData.username,
                IDPost: parseInt(req.body.IDPost)
            })
                .then(async (re1) => {
                    const result = []
                    if (re1.records.length >= 1) {
                        for (var i = 0; i < re1.records.length; i++) {
                            let profiles1 = await pool.request()
                                .input('ID_Signin', sql.VarChar, re1.records[i].get('email'))
                                .query("SELECT  i.HoTen, i.AnhSV FROM [dbo].[InfoSinhVien] i where i.Email=@ID_Signin");

                            if (profiles1.recordsets[0]) {
                                var temp = {
                                    "ID": re1.records[i].get('ID').low,
                                    "IDCourses": re1.records[i].get('IDCourses'),
                                    "NameCourses": re1.records[i].get('nameCourses'),
                                    "NameOwn": profiles1.recordsets[0][0]["HoTen"],
                                    "AvartaOwn": profiles1.recordsets[0][0]["AnhSV"],
                                    "EmailOwn": re1.records[i].get('email'),
                                    "title": re1.records[i].get('title'),
                                    "image": re1.records[i].get('image'),
                                    "time": re1.records[i].get('time'),
                                    "like": re1.records[i].get('like').low,
                                    "comment": re1.records[i].get('comment').low,
                                    "LikeByOwn": re1.records[i].get('likebyown').low
                                }
                                if (result !== undefined) {
                                    result.push(temp);
                                }
                                else {
                                    result = temp;
                                }
                            }
                        }
                        //console.log(result);
                        res.status(200).json(result);
                    }
                    else {
                        res.status(200).json(result);
                    }

                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err });
                })
        })

    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};