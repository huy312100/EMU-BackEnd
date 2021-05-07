const Config = require("../middleware/rdbconfig");
const sql = require("mssql");

exports.Create_Profile = async(req,res,next)=>{   

    try {
        let pool = await sql.connect(Config);

        let MaTruongKhoa=await pool.request()
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
            .input('AnhSV', sql.VarChar,req.body.AnhSV)
            .execute('InsertProfile')
            res.status(200).json({ message: "profile created"});
        
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.Edit_Profile = async (req, res, next)=>{
    try {
        let pool = await sql.connect(Config);

        let MaTruongKhoa=await pool.request()
            .input('Ma_Truong', sql.VarChar, req.body.MaTruong)
            .input('Ma_Khoa', sql.VarChar, req.body.MaKhoa)
            .query("Select uf.ID from University u,Faculty f, University_Faculty uf where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and u.MaTruong= @Ma_Truong and f.MaKhoa=@Ma_Khoa;");

        //console.log(MaTruongKhoa.recordsets[0][0]["ID"]);
        //res.status(200).json();
        let profile = await pool.request()
            .input('IDSignin', sql.VarChar, req.userData._id)
            .input('HoTen', sql.NVarChar, req.body.HoTen)
            .input('IDTruongKhoa', sql.Int, MaTruongKhoa.recordsets[0][0]["ID"])
            .input('AnhSV', sql.VarChar,req.body.AnhSV)
            .execute('EditProfile')
            res.status(200).json({ message: "profile edited"});
        
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.View_Profile = async (req, res, next)=>{
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("select sv.HoTen, sv.Email,u.MaTruong, u.TenTruongDH, f.MaKhoa, f.TenKhoa  from InfoSinhVien sv, University_Faculty uf, University u, Faculty f where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and uf.ID=sv.IDTruongKhoa and IDSignin=@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if(profiles.recordsets[0])
        {
            res.status(200).json(profiles.recordsets[0]);
        }
        else{
            res.status(500).json();
        }
        
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};