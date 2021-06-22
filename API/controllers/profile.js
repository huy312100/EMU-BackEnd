const Config = require("../middleware/rdbconfig");
const sql = require("mssql");
const cloudinary = require("cloudinary");
const ImgConfig = require("../middleware/cloudImgConfig");
const { initParams } = require("request");
exports.Create_Profile = async (req, res, next) => {

    try {
        let pool = await sql.connect(Config);

        let MaTruongKhoa = await pool.request()
            .input('Ma_Truong', sql.VarChar, req.body.MaTruong)
            .input('Ma_Khoa', sql.VarChar, req.body.MaKhoa)
            .query("Select uf.ID from University u,Faculty f, University_Faculty uf where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and u.MaTruong= @Ma_Truong and f.MaKhoa=@Ma_Khoa;");

        //console.log(MaTruongKhoa.recordsets[0][0]["ID"]);
        //res.status(200).json();
        let profile = await pool.request()
            .input('IDSignin', sql.VarChar, req.userData._id)
            .input('HoTen', sql.NVarChar, req.body.HoTen)
            .input('Email', sql.VarChar, req.userData.username)
            .input('IDTruongKhoa', sql.Int, MaTruongKhoa.recordsets[0][0]["ID"])
            .input('AnhSV', sql.VarChar, req.body.AnhSV)
            .execute('InsertProfile')
        res.status(200).json({ message: "profile created" });

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.Post_Profile_Picture = async (req, res, next) => {
    try {
        cloudinary.config(ImgConfig);
        //F:\duy\Profile Picture Zoom

        const test = async () => {
            try {
                const file = req.files.image;

                var a = await cloudinary.uploader.upload(file.tempFilePath, {}, { folder: '/Profile' })
                if (a) {
                    var temp = {
                        "IDImages": a.public_id,
                        "AnhSV": a.url
                    };

                    try {
                        let pool = await sql.connect(Config);

                        let profile = await pool.request()
                            .input('AnhSV', sql.VarChar, temp.AnhSV)
                            .input('IDImages', sql.VarChar, temp.IDImages)
                            .input('IDSignin', sql.VarChar, req.userData._id)
                            .execute('UploadImageProfile')
                        res.status(200).json({ message: "Image posted" });
                    }
                    catch (error) {
                        console.log(error);
                        res.status(500).json(error);
                    }
                }

                res.status(200);
            } catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        }
        test();

    }
    catch (error) {
        res.status(500).json(error);
    }
}

exports.Delete_Profile_Picture = async (req, res, next) => {

    try {
        cloudinary.config(ImgConfig);
        let pool = await sql.connect(Config);

        let MaTruongKhoa = await pool.request()
            .input('IDSignin', sql.VarChar, req.userData._id)
            .query("SELECT IDImages FROM [dbo].[InfoSinhVien] where IDSignin=@IDSignin;");

        const imagedelete =MaTruongKhoa.recordsets[0][0]["IDImages"];
        if(imagedelete !== undefined){
            cloudinary.uploader.destroy(imagedelete, function (error, result) {
                if (result) {
                }
                else {
                    res.status(500).json();
                }
            })
            let profile = await pool.request()
                .input('IDSignin', sql.VarChar, req.userData._id)
                .execute('DeleteImageProfile')
            res.status(200).json({ message: "Images deleted" });
        }
        else{
            res.status(500).json({message:"image doesnt delete"})
        }
        
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

exports.Edit_Profile = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let MaTruongKhoa = await pool.request()
            .input('Ma_Truong', sql.VarChar, req.body.MaTruong)
            .input('Ma_Khoa', sql.VarChar, req.body.MaKhoa)
            .query("Select uf.ID from University u,Faculty f, University_Faculty uf where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and u.MaTruong= @Ma_Truong and f.MaKhoa=@Ma_Khoa;");

        //console.log(MaTruongKhoa.recordsets[0][0]["ID"]);
        //res.status(200).json();
        let profile = await pool.request()
            .input('IDSignin', sql.VarChar, req.userData._id)
            .input('HoTen', sql.NVarChar, req.body.HoTen)
            .input('IDTruongKhoa', sql.Int, MaTruongKhoa.recordsets[0][0]["ID"])
            .input('AnhSV', sql.VarChar, req.body.AnhSV)
            .execute('EditProfile')
        res.status(200).json({ message: "profile edited" });

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.Find_Info_From_Full_Name = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, '%' + req.body.HoTen + '%')
            .query("SELECT [InfoSinhVien].Email, InfoSinhVien.HoTen, InfoSinhVien.AnhSV, University.TenTruongDH, Faculty.TenKhoa FROM [dbo].[InfoSinhVien], University_Faculty,University,Faculty where InfoSinhVien.IDTruongKhoa=University_Faculty.ID and University_Faculty.MaTruong=University.MaTruong and University_Faculty.MaKhoa=Faculty.MaKhoa and InfoSinhVien.HoTen LIKE @ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            var results = profiles.recordsets[0];
            for (var j = results.length - 1; j >= 0; --j) {
                if (results[j].Email === req.userData.username) {
                    results.splice(j, 1);
                }
            }
            res.status(200).json(results);
        }
        else {
            res.status(500).json();
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.Find_name = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, '%' + req.body.username + '%')
            .query("SELECT [Email],[HoTen] FROM [dbo].[InfoSinhVien] where InfoSinhVien.Email LIKE @ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            var results = profiles.recordsets[0];
            for (var j = results.length - 1; j >= 0; --j) {
                if (results[j].Email === req.userData.username) {
                    results.splice(j, 1);
                }
            }
            res.status(200).json(results);
        }
        else {
            res.status(500).json();
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

exports.View_Profile = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("select sv.HoTen, sv.Email,u.MaTruong, u.TenTruongDH, f.MaKhoa, f.TenKhoa  from InfoSinhVien sv, University_Faculty uf, University u, Faculty f where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and uf.ID=sv.IDTruongKhoa and IDSignin=@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            res.status(200).json(profiles.recordsets[0]);
        }
        else {
            res.status(500).json();
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};