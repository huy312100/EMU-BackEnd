const Config = require("../middleware/rdbconfig");
const sql = require("mssql");

exports.Get_Faculty_Of_Univerity =  async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);
        //let facultys = await pool.request().query("SELECT * from University");

        let facultys = await pool.request()
            .input('Ma_Truong', sql.VarChar, req.body.MaTruong)
            .query("select f.MaKhoa, f.TenKhoa from University u,Faculty f, University_Faculty uf where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and u.MaTruong= @Ma_Truong");

        //console.log(facultys.recordsets[0]);
        if(facultys.recordsets[0])
        {
            res.status(200).json(facultys.recordsets[0]);
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

