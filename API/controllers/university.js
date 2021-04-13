var Connection = require("tedious").Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const Config = require("../middleware/configrdbms");
var University = require("../models/university");
var NameUniversity=require("../models/NameUniversity")
var result = [];
var resultname=[];

exports.Get_All_Info =  async (req, res, next) => {
  var connectionss = await new Connection(Config);
  
  connectionss.on('connect', function (err) {
    // If no error, then good to proceed. 
    if (err) {
      res.status(500).json({
        error: err
      });
      return;
    }
    executeStatement();
  });

  await connectionss.connect();
  
  async function executeStatement() {
    request = new Request("SELECT * FROM University", function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: err
        });

      }
    });
     request.on('row', (columns) => {
      columns.forEach(function (column) {
        if (column.value === null) {
          result.push('NULL');
        } else {
          result.push(column.value);

        }
      });

    });
    await connectionss.execSql(request);

  }

  var InfoUniversity=[];
    const leng=result.length/6;
    for(let i=0; i<leng;i++)
    {
      var univer=new University(
        MaTruong=result[i*6],
        TenTruongDH=result[i*6+1],
        WebSite=result[i*6+2],
        Email=result[i*6+3],
        SDT=result[i*6+4],
        FanFage=result[i*6+5]
        
      );
      if (InfoUniversity.indexOf(univer) === -1) InfoUniversity.push(univer);
    };

    //console.log(InfoUniversity);

    result=[];


    if(InfoUniversity)
    {
      res.status(200).json(InfoUniversity);
    }
    else
    {
      res.status(500).json({
      });
    }
};

exports.Get_Name= async (req,res,next)=>{
  var connectionss = await new Connection(Config);
  
  connectionss.on('connect', function (err) {
    // If no error, then good to proceed. 
    if (err) {
      res.status(500).json({
        error: err
      });
      return;
    }
    executeStatement();
  });

  await connectionss.connect();
  
  async function executeStatement() {
    request = new Request("select MaTruong, TenTruongDH from University", function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: err
        });

      }
    });
    request.on('row', (columns) => {
      columns.forEach(function (column) {
        if (column.value === null) {
          resultname.push('NULL');
        } else {
          resultname.push(column.value);

        }
      });

    });
    await connectionss.execSql(request);

  }

  var InfoUniversity=[];
  const leng=resultname.length/2;
  for(let i=0; i<leng;i++)
    {
      var univer=new NameUniversity(
        MaTruong=resultname[i*2],
        TenTruongDH=resultname[i*2+1]
        
      );
      if (InfoUniversity.indexOf(univer) === -1) InfoUniversity.push(univer);
    };

    resultname=[];



  if(InfoUniversity)
    {
      res.status(200).json(InfoUniversity);
    }
    else
    {
      res.status(500).json({
      });
    }
}