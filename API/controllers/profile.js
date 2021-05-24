const Config = require("../middleware/rdbconfig");
const sql = require("mssql");
const request = require("request");

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

exports.Edit_Profile_Picture = async (req, res, next) => {

    //console.log(req.userData._id);
    var url = "https://graph.microsoft.com/v1.0/me/drive/root:/EMU/Profile/" + req.userData._id + ".png:/content";

    var options = {
        "method": "PUT",
        "url": url,
        "headers": {
            "Authorization": "bearer eyJ0eXAiOiJKV1QiLCJub25jZSI6ImI0QkxjYmtmQkxPY0FRTk15Zmo2YkdUS0JEakk5N2dnZmprbWpNV3Q4S0kiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC80MDEyN2NkNC00NWYzLTQ5YTMtYjA1ZC0zMTVhNDNhOWYwMzMvIiwiaWF0IjoxNjIwODA5NjU5LCJuYmYiOjE2MjA4MDk2NTksImV4cCI6MTYyMDgxMzU1OSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsidXJuOnVzZXI6cmVnaXN0ZXJzZWN1cml0eWluZm8iLCJ1cm46bWljcm9zb2Z0OnJlcTEiLCJ1cm46bWljcm9zb2Z0OnJlcTIiLCJ1cm46bWljcm9zb2Z0OnJlcTMiLCJjMSIsImMyIiwiYzMiLCJjNCIsImM1IiwiYzYiLCJjNyIsImM4IiwiYzkiLCJjMTAiLCJjMTEiLCJjMTIiLCJjMTMiLCJjMTQiLCJjMTUiLCJjMTYiLCJjMTciLCJjMTgiLCJjMTkiLCJjMjAiLCJjMjEiLCJjMjIiLCJjMjMiLCJjMjQiLCJjMjUiXSwiYWlvIjoiRTJaZ1lOaDlLN05BMHBacGFZWHNqWEo3Ri8yMmxuVTlCWnRFcXJLZkIra3hKczVoZVF3QSIsImFtciI6WyJwd2QiXSwiYXBwX2Rpc3BsYXluYW1lIjoiR3JhcGggZXhwbG9yZXIgKG9mZmljaWFsIHNpdGUpIiwiYXBwaWQiOiJkZThiYzhiNS1kOWY5LTQ4YjEtYThhZC1iNzQ4ZGE3MjUwNjQiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6Ik5HVVnhu4ROIFFV4buQQyIsImdpdmVuX25hbWUiOiJEVVkiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxMTMuMTYxLjYxLjE0MiIsIm5hbWUiOiJOR1VZ4buETiBRVeG7kEMgRFVZIiwib2lkIjoiOTQ4Njg2MTctYTU3Yi00NDY3LWFjNDUtYmM0ODczM2JiZmM4IiwicGxhdGYiOiIzIiwicHVpZCI6IjEwMDMwMDAwQTQyNTNDMjQiLCJyaCI6IjAuQVZRQTFId1NRUE5GbzBtd1hURmFRNm53TTdYSWk5NzUyYkZJcUsyM1NOcHlVR1JVQUJJLiIsInNjcCI6IkZpbGVzLlJlYWRXcml0ZS5BbGwgb3BlbmlkIHByb2ZpbGUgU2l0ZXMuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgZW1haWwiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJlM196VURSVjlXSE14c01SQ2tlMUhoOXFxMXV6NTN2Sk9ZSDRnSk5ZRXpNIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFTIiwidGlkIjoiNDAxMjdjZDQtNDVmMy00OWEzLWIwNWQtMzE1YTQzYTlmMDMzIiwidW5pcXVlX25hbWUiOiIxNzUzMDQ3QHN0dWRlbnQuaGNtdXMuZWR1LnZuIiwidXBuIjoiMTc1MzA0N0BzdHVkZW50LmhjbXVzLmVkdS52biIsInV0aSI6ImZKWjIyZ0pxVFVTQTNfWmROcEhhQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoicGJOUDNDaGlhQ2dNeWg2R2ViQ1NkalhOM3RpQ3FQQUZXUFI0S0ZXLVpJWSJ9LCJ4bXNfdGNkdCI6MTM3MjE4Njc3MH0.oGd7gQXEDpskZ9RvoXaLCcIYpdbFD3Ign-9FioX1Qt1tetRyX4GOhOfNxWhlI3H3Z332vXK9CF2VLbQUqxHxY1BF9VWXhRx_SlNg-NZAujDuPa8xd4w2D67KYvywBxrv9T44GD8PVq89jtHTD1ri-g5wqif2TMylqiIFy7fzD5sIcfnOLmGum6OEz78jLN5whTJcelPBEnLSF-haawSnmGKZmLupGeq4ooquQWST5gIcW_NtXT1e0o4o0hYfwhVwSadQqNvuGxg15zsbHNyxN2WzYYikyq_ixYxHUxhDswxfJ1L3SkithfDZPpfsVKrH2RfZ48fADsyczGhHMw5bBQ",
            "Content-Type": "image/jpeg"
        },
        body: "<file contents here>"
    };
    var IDOfPhoto;
    function Init() {
        return new Promise(resolve => {
            request(options, function (error, response) {
                if (error) {
                    res.status(500).json({ message: error });
                }
                else {
                    if (response.statusCode === 200) {
                        var infoIDUser = JSON.parse(response.body);
                        //console.log(infoIDUser);
                        if (infoIDUser.id !== undefined) {
                            return resolve(infoIDUser.id);
                        }
                    }
                }
            });
        });
    }
    await Init().then((re1)=>{
        console.log(re1);
        res.status(200).json();
    });
    //console.log(IDOfPhoto);
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

exports.Find_name = async (req,res,next)=>{
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, '%' + req.body.username + '%')
            .query("SELECT [Email],[HoTen] FROM [dbo].[InfoSinhVien] where InfoSinhVien.Email LIKE @ID_Signin");

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