const configNeo4j = require("../middleware/neo4jconfig");
const Config = require("../middleware/rdbconfig");
const ImgConfig = require("../middleware/cloudImgConfig");

const sql = require("mssql");
const cloudinary = require("cloudinary");

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
                "MERGE (s)-[:POSTED]->(p)";

            var result = session.writeTransaction(tx => {
                return tx.run(query, {
                    Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                    Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                    Ho_Ten: profiles.recordsets[0][0]["HoTen"],
                    Email: req.userData.username,
                    Title_Post: req.body.title,
                    ImgPost: imagepost,
                    Imgid: imageID,
                    timestamp: timestamp
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
        const session = configNeo4j.getSession(req);

        const query = "MATCH (n) where id(n) = $IDPost DETACH DELETE n";

        var result = session.writeTransaction(tx => {
            return tx.run(query, {
                IDPost: parseInt(req.body.IDPost)
            })
                .then(re1 => {
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
    catch (error) {
        res.status(500).json({ err: error });
    }
}

exports.View_Post = async (req, res, next) => {
    try {

    }
    catch (error) {
        res.status(500).json({ err: error });
    }
};