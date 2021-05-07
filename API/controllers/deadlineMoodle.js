const mongoose = require("mongoose");
var request = require("request");

const DeadlineMooodle =require("../models/deadlineMoodlle");
const CustomWeb = require("../models/customweb");
const deadlineMoodle = require("../models/deadlineMoodlle");
exports.Get_Deadline_This_Month =(req,res,next)=>{
    var url;
    CustomWeb.find({$and:[{typeUrl:"Moodle"},{idUser: req.userData._id}]})
    .exec()
    .then(user=>{
        if(user.length>=1)
        {
            var tokenMoodle= user[0].token;
            var urlMoodle = user[0].url.split(".edu.vn")[0];

            var today = new Date();
    
            var mm = String(today.getMonth() + 1);
            var yyyy = today.getFullYear();

            url=urlMoodle+".edu.vn/webservice/rest/server.php?moodlewsrestformat=json&wstoken="+tokenMoodle+"&wsfunction=core_calendar_get_calendar_monthly_view&year="+yyyy+"&month="+mm;
            //console.log(url);
            var options = {
                "method": "GET",
                "url": url,
                "headers": {
                }
              };
            request(options, function (error, response) {
                if (error) {
                    res.status(500).json({message: error});
                }
                else{
                    if(response.statusCode===200){
                        //console.log(response.body);
                        var CalendarDeadline =JSON.parse(response.body);
                        //console.log(CalendarDeadline.weeks)
                        var result=[];
                        for(var i=0; i<CalendarDeadline.weeks.length;i++)
                        {
                            for(var j=0;j<CalendarDeadline.weeks[i].days.length;j++)
                            {
                                if(CalendarDeadline.weeks[i].days[j].events!=""){
                                    for(var z=0;z<CalendarDeadline.weeks[i].days[j].events.length;z++){
                                        if(CalendarDeadline.weeks[i].days[j].events[z].modulename ==="assign")
                                        {
                                            const deadline= new deadlineMoodle(
                                                CalendarDeadline.weeks[i].days[j].events[z].course.fullname,
                                                CalendarDeadline.weeks[i].days[j].events[z].name,
                                                CalendarDeadline.weeks[i].days[j].events[z].url,
                                                CalendarDeadline.weeks[i].days[j].events[z].timestart
                                            );
                                            result.push(deadline);
                                        }
                                    }
                                    
                                   
                                }
                                
                            }
                            
                        }
                        res.status(200).json(result);
                    }else{
                        res.status(500).json({message:"Have res error"});
                    }
                }
                
              });
        }
        else{
            res.status(500).json({message: "No account your custom Moodle"});
        }
    })
    .catch(err=>
    {
      console.log(err);
      res.status(500).json({
        error:err
      });
    });
};

exports.Get_Deadline_With_MonthID =(req,res,next)=>{
    var url;
    CustomWeb.find({$and:[{typeUrl:"Moodle"},{idUser: req.userData._id}]})
    .exec()
    .then(user=>{
        if(user.length>=1)
        {
            var tokenMoodle= user[0].token;
            var urlMoodle = user[0].url.split(".edu.vn")[0];
  
            var mm = req.body.month;
            var yyyy = req.body.year;

            url=urlMoodle+".edu.vn/webservice/rest/server.php?moodlewsrestformat=json&wstoken="+tokenMoodle+"&wsfunction=core_calendar_get_calendar_monthly_view&year="+yyyy+"&month="+mm;
            //console.log(url);
            var options = {
                "method": "GET",
                "url": url,
                "headers": {
                }
            };
            request(options, function (error, response) {
                if (error) {
                    res.status(500).json({message: error});
                }
                else{
                    if(response.statusCode===200){
                        //console.log(response.body);
                        var CalendarDeadline =JSON.parse(response.body);
                        //console.log(CalendarDeadline.weeks)
                        var result=[];
                        for(var i=0; i<CalendarDeadline.weeks.length;i++)
                        {
                            for(var j=0;j<CalendarDeadline.weeks[i].days.length;j++)
                            {
                                if(CalendarDeadline.weeks[i].days[j].events!=""){
                                    for(var z=0;z<CalendarDeadline.weeks[i].days[j].events.length;z++){
                                        if(CalendarDeadline.weeks[i].days[j].events[z].modulename ==="assign")
                                        {
                                            const deadline= new deadlineMoodle(
                                                CalendarDeadline.weeks[i].days[j].events[z].course.fullname,
                                                CalendarDeadline.weeks[i].days[j].events[z].name,
                                                CalendarDeadline.weeks[i].days[j].events[z].url,
                                                CalendarDeadline.weeks[i].days[j].events[z].timestart
                                            );
                                            result.push(deadline);
                                        }
                                    }
                                    
                                   
                                }
                                
                            }
                            
                        }
                        res.status(200).json(result);
                    }else{
                        res.status(500).json({message:"Have res error"});
                    }
                }
                
              });
        }
        else{
            res.status(500).json({message: "No account your custom Moodle"});
        }
    })
    .catch(err=>
    {
      console.log(err);
      res.status(500).json({
        error:err
      });
    });
};