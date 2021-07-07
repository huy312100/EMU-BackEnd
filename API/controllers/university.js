const Config = require("../middleware/rdbconfig");
//const sql = require("mssql");
const sql = require("mssql");

exports.Get_Name = async (req, res, next) => {
    try {
        //let pool = await sql.connect(Config);
        let pool = await sql.connect(Config);

        let university = await pool.request()
            .query("select MaTruong,TenTruongDH from University");

        if (university.recordsets[0]) {
            res.status(200).json(university.recordsets[0]);
        }
        else {
            res.status(500).json();
        }

    }
    catch (error) {
        res.status(500).json(error);
    }
};

exports.Get_All_Info = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let facultys = await pool.request()
            .input('IDSignin', sql.VarChar, req.userData._id)
            .query("select * from University");

        if (facultys.recordsets[0]) {
            res.status(200).json(facultys.recordsets[0]);
        }
        else {
            res.status(500).json();
        }

    }
    catch (error) {
        res.status(500).json(error);
    }
};