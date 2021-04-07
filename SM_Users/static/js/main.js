function search_friends(e) {
    var search_data=e.value;
    if(search_data.length>0) {
        document.getElementById('search_div').hidden=false;
        $.ajax(
            {
                url: '/u/search_friends/',
                type: "post",
                data: {"search": search_data},
                success: function (responseData) {
                    if (responseData['result']) {
                        var res_text2 = ""
                        for (var a = 0; a < responseData['result'].length; a++) {

                            var img = responseData['result'][a][1];
                            var img2 = img.replace(/['"]+/g, '');
                            var img_var = "/media/" + img2;
                            res_text2 += "<a class='search_link' href='/u/search_friends_detail/?f="+responseData['result'][a][0]+"'><span class='search_span'>" + responseData['result'][a][0] + "<img class='search_img'  height=\"45\" width=\"45\" src=" + img_var + " >" + "</span></a><br>";
                        }
                        document.getElementById('search_div').innerHTML = res_text2;
                    } else {
                        document.getElementById('search_div').innerHTML = "<h3 style='padding: 5px;min-width: 170px'>Not Found</h3>";
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
    }
    else {
        document.getElementById('search_div').hidden=true
    }

    }
function add_friends(e) {
    var fid=e.value;
    try {
        document.getElementById('frnd_request').innerText="Sending Request...";
    }
    catch (e) {
        document.getElementById('req_sent').innerText="Cancelling Request...";
    }
        $.ajax(
            {
                url: '/u/addfriends/',
                type: "post",
                data: {"fid": fid},
                success: function (responseData) {
                    if (responseData['msg']==="ok") {
                        // alert('got it')
                        document.getElementById('frnd_request').innerText="Cancel Request";
                        $("#frnd_request").addClass("btn btn-danger");
                        }
                    else if (responseData['msg']==="del")
                    {

                        try{
                            document.getElementById('frnd_request').innerText="Add Friend";
                            $("#frnd_request").removeClass("btn btn-danger").addClass("btn btn-success");
                        }
                        catch (e) {
                            document.getElementById("req_sent_span").innerHTML="<button type=\"submit\" class=\"btn btn-success\" id=\"frnd_request\" onclick=\"add_friends(this)\" value="+fid+">Add Friend</button>";
                        }
                        $("#req_sent").hide();
                    }
                    else {
                        alert('response error');
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
    }

function acceptRequest(e) {
    var reqid=e.value;
    $.ajax(
            {
                url: '/u/acceptRequest/',
                type: "post",
                data: {"req_id": reqid},
                success: function (responseData) {

                    if (responseData['msg']==="ok")
                    {
                        $("#accept").hide();
                        $("#cancel").hide();
                        document.getElementById("accepted").innerHTML="<button class=\"btn btn-success\" id=\"accepted\">You Accepted The Request</button>";
                    }

                    else {
                        alert('response error');
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}


function cancelRequest(e) {
    var reqid=e.value;
    $.ajax(
            {
                url: '/u/cancelRequest/',
                type: "post",
                data: {"req_id": reqid},
                success: function (responseData) {

                    if (responseData['msg']==="ok")
                    {
                        $("#accept").hide();
                        $("#cancel").hide();
                        document.getElementById("accepted").innerHTML="<button class=\"btn btn-danger\" id=\"accepted\">You Cancelled The Request</button>";
                    }

                    else {
                        alert('response error');
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}

function timeDiff(curr, prev) {
            var ms_Min = 60 * 1000; // milliseconds in Minute
            var ms_Hour = ms_Min * 60; // milliseconds in Hour
            var ms_Day = ms_Hour * 24; // milliseconds in day
            var ms_Mon = ms_Day * 30; // milliseconds in Month
            var ms_Yr = ms_Day * 365; // milliseconds in Year
            var diff = curr - prev; //difference between dates.
            // If the diff is less then milliseconds in a minute
            if (diff < ms_Min) {
                return Math.round(diff / 1000) + ' seconds ago.';

                // If the diff is less then milliseconds in a Hour
            } else if (diff < ms_Hour) {
                return Math.round(diff / ms_Min) + ' minutes ago.';

                // If the diff is less then milliseconds in a day
            } else if (diff < ms_Day) {
                return Math.round(diff / ms_Hour) + ' hours ago.';

                // If the diff is less then milliseconds in a Month
            } else if (diff < ms_Mon) {
                return Math.round(diff / ms_Day) + ' days ago.';

                // If the diff is less then milliseconds in a year
            } else if (diff < ms_Yr) {
                return Math.round(diff / ms_Mon) + ' months ago.';
            } else {
                return Math.round(diff / ms_Yr) + ' years ago.';
            }
        }



function load_more_notification() {
    var load_more_button=document.getElementById("load_more_button");
    load_more_button.innerHTML="<button class=\"btn btn-success\" disabled>\n" +
                "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
                "Loading...\n" +
                "</button>"
    var divs=document.getElementsByClassName('text-muted');
    var lst_date=divs[divs.length-1].innerHTML;
    $.ajax(
            {
                url: '/u/load_notification/',
                type: "post",
                data: {"date": lst_date},
                success: function (responseData) {
                    if (responseData['result'])
                    {
                        var noti_div_dta="";
                        var noti_type="";
                        var icon_data="";
                        var postType=["Post Created","Commented on post","Liked","Updated Profile","Commented on profile"];
                        var postType1=["Friend Request","Request Accepted"];
                        for(var dt=0;dt<responseData['result'].length;dt++)
                        {
                            noti_type=responseData['result'][dt][1];
                            if(noti_type === "Post Created")
                            {
                                icon_data="<img src=\"/static/images/icons8-create-50.png\" height=\"30px\" width=\"30px\">"
                            }
                            else if(noti_type === "Commented on post" || noti_type === "Commented on profile")
                            {
                                icon_data="<img src=\"/static/images/comment_icon.png\" height=\"30px\" width=\"30px\">"
                            }
                            else if(noti_type === "Liked")
                            {
                                icon_data="<i class=\"fa fa-heart\" style=\"font-size:18px;color:red\"></i>"
                            }
                            else if(noti_type === "Updated Profile")
                            {
                                icon_data="<img src=\"/static/images/update_profile_icon.png\" height=\"30px\" width=\"30px\">"
                            }
                            else if(noti_type === "Friend Request")
                            {
                                icon_data="<img src=\"/static/images/add_friend.png\" height=\"30px\" width=\"40px\">"
                            }
                            else if(noti_type === "Request Accepted")
                            {
                                icon_data="<img src=\"/static/images/accepted_friend.png\" height=\"30px\" width=\"40px\">"
                            }
                            else {icon_data=""}
                            if(responseData['result'][dt][1])
                            {
                                var new_dt2=moment(responseData['result'][dt][6]);
                                var new_dt=timeDiff(new Date(),moment(responseData['result'][dt][6]));
                                if(postType.includes(responseData['result'][dt][1]))
                                {
                                    if(responseData['result'][dt][5]==="unread")
                                    {
                                    noti_div_dta+="<div class=\"card\" style=\"max-width: 850px;overflow: hidden\">\n" +
                                                "<div class=\"row no-gutters\">" +
                                                "<a href=\"/u/view_post/?idnt="+responseData['result'][dt][8]+"&nid="+responseData['result'][dt][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                                "<div class=\"col-md-2\" style=\"background-color: rgba(191,187,126,0.53)\">\n" +
                                                "<img src="+responseData['result'][dt][7]+" style=\"max-height: 100px;max-width: 80px\" class=\"img-thumbnail\" alt=\"...\">\n" +
                                                "</div>\n" +
                                                "<div class=\"col-md-8\" style=\"background-color:  rgba(191,187,126,0.53);\">\n" +
                                                "<div class=\"noti_div\">\n" +
                                                "<h6 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][1]+"&nbsp;&nbsp;"+icon_data+"</h6>\n" +
                                                "<p class=\"card-text\"><h6>"+responseData['result'][dt][2]+"</h6></p>\n" +
                                                "<p class=\"card-text\"><small class=\"text-muted\">"+new_dt2.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt+"</small></p>\n" +
                                                "</div>\n" +
                                                "</div>\n" +
                                                "</a></div></div>";
                                    }
                                    else{
                                    noti_div_dta+="<div class=\"card\" style=\"max-width: 850px;overflow: hidden\">\n" +
                                                "<div class=\"row no-gutters\">" +
                                                "<a href=\"/u/view_postr/?idnt="+responseData['result'][dt][8]+"\" style=\"text-decoration: none;color: black\">\n" +
                                                "<div class=\"col-md-2\">\n" +
                                                "<img src="+responseData['result'][dt][7]+" style=\"max-height: 100px;max-width: 80px\" class=\"img-thumbnail\" alt=\"...\">\n" +
                                                "</div>\n" +
                                                "<div class=\"col-md-8\">\n" +
                                                "<div class=\"noti_div\">\n" +
                                                "<h6 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][1]+"&nbsp;&nbsp;"+icon_data+"</h6>\n" +
                                                "<p class=\"card-text\"><h6>"+responseData['result'][dt][2]+"</h6></p>\n" +
                                                "<p class=\"card-text\"><small class=\"text-muted\" style='display: none;visibility: hidden'>"+new_dt2.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt+"</small></p>\n" +
                                                "</div>\n" +
                                                "</div>\n" +
                                                "</a></div></div>";
                                    }
                                }
                                else if(postType1.includes(responseData['result'][dt][1])){
                                    if(responseData['result'][dt][5]==="unread")
                                    {
                                    noti_div_dta+="<div class=\"card\" style=\"max-width: 850px;overflow: hidden\">\n" +
                                                "<div class=\"row no-gutters\">" +
                                                "<a href=\"/u/read_noti/?idnt="+responseData['result'][dt][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                                "<div class=\"col-md-2\" style=\"background-color: rgba(191,187,126,0.53)\">\n" +
                                                "<img src="+responseData['result'][dt][7]+" style=\"max-height: 100px;max-width: 80px\" class=\"img-thumbnail\" alt=\"...\">\n" +
                                                "</div>\n" +
                                                "<div class=\"col-md-8\" style=\"background-color:  rgba(191,187,126,0.53);\">\n" +
                                                "<div class=\"noti_div\">\n" +
                                                "<h6 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][1]+"&nbsp;&nbsp;"+icon_data+"</h6>\n" +
                                                "<p class=\"card-text\"><h6>"+responseData['result'][dt][2]+"</h6></p>\n" +
                                                "<p class=\"card-text\"><small class=\"text-muted\">"+new_dt2.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt+"</small></p>\n" +
                                                "</div>\n" +
                                                "</div>\n" +
                                                "</a></div></div>";
                                    }
                                    else{
                                        noti_div_dta+="<div class=\"card\" style=\"max-width: 850px;overflow: hidden\">\n" +
                                                "<div class=\"row no-gutters\">" +
                                                "<a href=\"/u/read_noti/?idnt="+responseData['result'][dt][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                                "<div class=\"col-md-2\">\n" +
                                                "<img src="+responseData['result'][dt][7]+" style=\"max-height: 100px;max-width: 80px\" class=\"img-thumbnail\" alt=\"...\">\n" +
                                                "</div>\n" +
                                                "<div class=\"col-md-8\">\n" +
                                                "<div class=\"noti_div\">\n" +
                                                "<h6 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][1]+"&nbsp;&nbsp;"+icon_data+"</h6>\n" +
                                                "<p class=\"card-text\"><h6>"+responseData['result'][dt][2]+"</h6></p>\n" +
                                                "<p class=\"card-text\"><small class=\"text-muted\" style='display: none;visibility: hidden'>"+new_dt2.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt+"</small></p>\n" +
                                                "</div>\n" +
                                                "</div>\n" +
                                                "</a></div></div>";
                                }
                                }
                                else{
                                }
                            }
                        }
                    document.getElementById("loaded_noti").innerHTML+=noti_div_dta;
                    load_more_button.innerHTML="<button class=\"btn btn-success\" onclick=\"load_more_notification()\">Load More</button>"
                    }
                    else {
                        var no_noti_warning="<div style='text-align: center;font-weight: bolder ' class=\"alert alert-danger\" role=\"alert\">\n" +
                                            "No More Notifications.\n" +
                                            "</div>";
                        document.getElementById("no_more_noti").innerHTML=no_noti_warning;
                        load_more_button.innerHTML="<button class=\"btn btn-success\" onclick=\"load_more_notification()\">Load More</button>"
                        }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}

function unfriend(e) {
    var idno=e.value;
    $.ajax(
            {
                url: '/u/unfriend/',
                type: "post",
                data: {"idno": idno},
                success: function (responseData) {

                    if (responseData['msg']==="ok")
                    {
                        document.getElementById("unfrnd").innerText="Removed";
                    }

                    else {
                        document.getElementById("unfrnd").innerText="Already Removed";
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}


function acceptMultipleRequest(e) {
    var reqid=e.value;
    $.ajax(
            {
                url: '/u/acceptRequest/',
                type: "post",
                data: {"req_id": reqid},
                success: function (responseData) {

                    if (responseData['msg']==="ok")
                    {
                        $("#accept"+reqid).hide();
                        $("#cancel"+reqid).hide();
                        document.getElementById("accepted"+reqid).innerHTML="<button class=\"btn btn-success\" id=\"accepted\">You Accepted The Request</button>";
                    }

                    else {
                        alert('response error');
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}


function cancelMultipleRequest(e) {
    var reqid=e.value;
    $.ajax(
            {
                url: '/u/cancelRequest/',
                type: "post",
                data: {"req_id": reqid},
                success: function (responseData) {

                    if (responseData['msg']==="ok")
                    {
                        $("#accept"+reqid).hide();
                        $("#cancel"+reqid).hide();
                        document.getElementById("accepted"+reqid).innerHTML="<button class=\"btn btn-danger\" id=\"accepted\">You Cancelled The Request</button>";
                    }

                    else {
                        alert('response error');
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}
function unfriendMultiple(e) {
    var idno=e.value;
    $.ajax(
            {
                url: '/u/unfriend/',
                type: "post",
                data: {"idno": idno},
                success: function (responseData) {

                    if (responseData['msg']==="ok")
                    {
                        document.getElementById("unfrnd"+idno).innerText="Removed";
                    }

                    else {
                        document.getElementById("unfrnd"+idno).innerText="Already Removed";
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}



function load_more_request() {
    var load_more_req=document.getElementById("load_more_request_btn");
    load_more_req.innerHTML="<button class=\"btn btn-success\" disabled>\n" +
                "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
                "Loading...\n" +
                "</button>"
    // var divs=document.getElementsByClassName('load_more_request');
    var divs=document.getElementById("last_datetime").value

    // var lst_date=divs[divs.length-1].innerHTML;
    var lst_date=divs;
    // alert('start')
    // alert(lst_date)
    $.ajax(
            {
                url: '/u/load_more_request/',
                type: "post",
                data: {"date": lst_date},
                success: function (responseData) {
                    if (responseData['result'])
                    {
                        // alert('1')
                        var req_div_dta="";
                        for(var dt=0;dt<responseData['result'].length;dt++)
                        {
                            // alert('inside for')
                            var new_dt=moment(responseData['result'][dt][1]);
                            var new_dt2=timeDiff(new Date(),moment(responseData['result'][dt][1]));

                            var cf_div_data_main=""
                            if(responseData['result'][dt][6].length !== 0){
                                // alert('if')
                                var cf_div_data_mid=""
                                var cf_div_start="<div class=\"row\">\n" +
                                            "<span style=\"margin-top: 10px;margin-left: 16px\">Friends in common - </span>"
                                var cf_div_data_end="</div>"
                                // alert('co')
                                // alert(responseData['result'][dt][6])
                                for (var cf=0;cf<responseData['result'][dt][6].length;cf++)
                                {
                                    cf_div_data_mid+="<div class=\"col-sm-2\">\n" +
                                        "<div>\n" +
                                        "<a href=\"/u/search_friends_detail?f="+responseData['result'][dt][6][cf][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                        "<img src="+responseData['result'][dt][6][cf][1]+" style=\"height: 40px;width: 40px;border-radius: 20px\">\n" +
                                        "<p class=\"card-text\">"+responseData['result'][dt][6][cf][0]+"</p>\n" +
                                        "</a>\n" +
                                        "</div>\n" +
                                        "</div>"
                                }
                                // alert('comm')
                                cf_div_data_main=cf_div_start+cf_div_data_mid+cf_div_data_end
                                }

                            // alert("inside if");
                            req_div_dta+="<div class=\"row\">\n" +
                                        "<div class=\"col-md-2\">\n" +
                                        "<a href=\"/u/search_friends_detail?f="+responseData['result'][dt][3]+"\"><img src="+responseData['result'][dt][5]+" style=\"height: 100px;width: 100px\" class=\"img-thumbnail\" alt=\"...\"></a>\n" +
                                        "</div>\n" +
                                        "<div class=\"col-md-8\">\n" +
                                        "<div class=\"noti_div\">\n" +
                                        "<a style=\"text-decoration: none;color: black\" href=\"/u/search_friends_detail?f="+responseData['result'][dt][3]+"\"><h5 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][3]+".</h5></a>\n" +
                                        cf_div_data_main+
                                        "<p>\n" +
                                        "<button class=\"btn btn-success\" id=\"accept"+responseData['result'][dt][0]+"\" onclick=\"acceptMultipleRequest(this)\" value="+responseData['result'][dt][0]+">Accept Request</button>\n" +
                                        "<button class=\"btn btn-danger\" id=\"cancel"+responseData['result'][dt][0]+"\" onclick=\"cancelMultipleRequest(this)\" value="+responseData['result'][dt][0]+">Cancel</button>\n" +
                                        "<span id=\"accepted"+responseData['result'][dt][0]+"\"></span>\n" +
                                        "</p>\n" +
                                        "<p class=\"card-text\"><small class=\"text-muted load_more_request\" style='visibility: hidden;display: none'>"+new_dt.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt2+"</small></p>\n" +
                                        "</div>\n" +
                                        "</div>\n" +
                                        "</div>"
                        }
                        // alert("if end")
                        var mydt=moment((responseData['result'].slice(-1))[0][1]);
                        var mydt1=mydt.format("YYYY-M-D h:mm:ss");
                        document.getElementById("last_datetime").value=mydt1;
                        document.getElementById("load_more_request").innerHTML+=req_div_dta;
                        // alert('end')
                    }
                    else {
                        // alert('mo res')
                        var no_req_warning="<div style='text-align: center;font-weight: bolder ' class=\"alert alert-danger\" role=\"alert\">\n" +
                                            "No More Request.\n" +
                                            "</div>";
                        document.getElementById("no_more_req").innerHTML=no_req_warning;
                        // alert("else end")
                        }
                    load_more_req.innerHTML="<button class=\"btn btn-success\" onclick=\"load_more_request()\">Load More Request</button>"
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}

function load_more_friends() {
    var load_more_req=document.getElementById("load_more_friend_btn");
    load_more_req.innerHTML="<button class=\"btn btn-success\" disabled>\n" +
                "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
                "Loading...\n" +
                "</button>"
    // var divs=document.getElementsByClassName('load_more_request');
    var divs=document.getElementById("last_friend_datetime").value

    // var lst_date=divs[divs.length-1].innerHTML;
    var lst_date=divs;
    // alert('start')
    // alert(lst_date)
    $.ajax(
            {
                url: '/u/load_more_friends/',
                type: "post",
                data: {"date": lst_date},
                success: function (responseData) {
                    if (responseData['result'])
                    {
                        // alert('1')
                        var frnd_div_dta="";
                        for(var dt=0;dt<responseData['result'].length;dt++)
                        {
                            // alert('inside for')
                            var new_dt=moment(responseData['result'][dt][1]);
                            // alert("inside if");
                            var cf_div_data_main=""
                            if(responseData['result'][dt][6].length !== 0){
                                var cf_div_data_mid=""
                                var cf_div_start="<div class=\"row\">\n" +
                                            "<span style=\"margin-top: 10px;margin-left: 16px\">Friends in common - </span>"
                                var cf_div_data_end="</div>"
                                // alert('co')
                                // alert(responseData['result'][dt][6])
                                for (var cf=0;cf<responseData['result'][dt][6].length;cf++)
                                {
                                    cf_div_data_mid+="<div class=\"col-sm-2\">\n" +
                                        "<div>\n" +
                                        "<a href=\"/u/search_friends_detail?f="+responseData['result'][dt][6][cf][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                        "<img src="+responseData['result'][dt][6][cf][1]+" style=\"height: 40px;width: 40px;border-radius: 20px\">\n" +
                                        "<p class=\"card-text\">"+responseData['result'][dt][6][cf][0]+"</p>\n" +
                                        "</a>\n" +
                                        "</div>\n" +
                                        "</div>"
                                }
                                // alert('comm')
                                cf_div_data_main=cf_div_start+cf_div_data_mid+cf_div_data_end
                                }

                            frnd_div_dta+="<div class=\"row\">\n" +
                                        "<div class=\"col-md-2\">\n" +
                                        "<a href=\"/u/search_friends_detail?f="+responseData['result'][dt][3]+"\"><img src="+responseData['result'][dt][5]+" style=\"height: 100px;width: 100px\" class=\"img-thumbnail\" alt=\"...\"></a>\n" +
                                        "</div>\n" +
                                        "<div class=\"col-md-8\">\n" +
                                        "<div class=\"noti_div\">\n" +
                                        "<a style=\"text-decoration: none;color: black\" href=\"/u/search_friends_detail?f="+responseData['result'][dt][3]+"\"><h5 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][3]+".</h5></a>\n" +
                                        cf_div_data_main+
                                        "<p>\n" +
                                        "<button class=\"btn btn-danger\" id=\"unfrnd"+responseData['result'][dt][0]+"\" onclick=\"unfriendMultiple(this)\" value="+responseData['result'][dt][0]+">Unfriend</button>"+
                                        "<span id=\"accepted"+responseData['result'][dt][0]+"\"></span>\n" +
                                        "</p>\n" +
                                        "<p class=\"card-text\"><small class=\"text-muted load_more_friend\">Friends from - "+new_dt.format("MMM YYYY")+"</small></p>\n" +
                                        "</div>\n" +
                                        "</div>\n" +
                                        "</div>"
                        }
                        // alert("if end")
                        var mydt=moment((responseData['result'].slice(-1))[0][1]);
                        var mydt1=mydt.format("YYYY-M-D h:mm:ss");
                        document.getElementById("last_friend_datetime").value=mydt1;
                        document.getElementById("load_more_friend").innerHTML+=frnd_div_dta;
                        // alert('end')
                        // alert(responseData['result']);
                    }
                    else {
                        // alert('mo res')
                        var no_req_warning="<div style='text-align: center;font-weight: bolder ' class=\"alert alert-danger\" role=\"alert\">\n" +
                                            "No More Friends.\n" +
                                            "</div>";
                        document.getElementById("no_more_friend").innerHTML=no_req_warning;
                        // alert("else end")
                        }
                    load_more_req.innerHTML="<button class=\"btn btn-success\" onclick=\"load_more_friends()\">Load More Friends</button>"
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}

function load_more_sent_req() {
    var load_more_req=document.getElementById("load_more_sent_req_btn");
    load_more_req.innerHTML="<button class=\"btn btn-success\" disabled>\n" +
                "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
                "Loading...\n" +
                "</button>"
    // var divs=document.getElementsByClassName('load_more_request');
    var divs=document.getElementById("last_sent_req_datetime").value

    // var lst_date=divs[divs.length-1].innerHTML;
    var lst_date=divs;
    // alert('start')
    // alert(lst_date)
    $.ajax(
            {
                url: '/u/load_more_sent_req/',
                type: "post",
                data: {"date": lst_date},
                success: function (responseData) {
                    if (responseData['result'])
                    {
                        // alert('1')
                        var sent_req_div_dta="";
                        for(var dt=0;dt<responseData['result'].length;dt++)
                        {
                            // alert('inside for')
                            var new_dt=moment(responseData['result'][dt][1]);
                            var new_dt2=timeDiff(new Date(),moment(responseData['result'][dt][1]));
                            // alert("inside if");

                            var cf_div_data_main=""
                            if(responseData['result'][dt][6].length !== 0){
                                var cf_div_data_mid=""
                            var cf_div_start="<div class=\"row\">\n" +
                                            "<span style=\"margin-top: 10px;margin-left: 16px\">Friends in common - </span>"
                            var cf_div_data_end="</div>"
                            // alert('co')
                            // alert(responseData['result'][dt][6])
                            for (var cf=0;cf<responseData['result'][dt][6].length;cf++)
                            {

                                cf_div_data_mid+="<div class=\"col-sm-2\">\n" +
                                        "<div>\n" +
                                        "<a href=\"/u/search_friends_detail?f="+responseData['result'][dt][6][cf][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                        "<img src="+responseData['result'][dt][6][cf][1]+" style=\"height: 40px;width: 40px;border-radius: 20px\">\n" +
                                        "<p class=\"card-text\">"+responseData['result'][dt][6][cf][0]+"</p>\n" +
                                        "</a>\n" +
                                        "</div>\n" +
                                        "</div>"
                            }
                            // alert('comm')
                            cf_div_data_main=cf_div_start+cf_div_data_mid+cf_div_data_end
                            }


                            sent_req_div_dta+="<div class=\"row\">\n" +
                                        "<div class=\"col-md-2\">\n" +
                                        "<a href=\"/u/search_friends_detail?f="+responseData['result'][dt][3]+"\"><img src="+responseData['result'][dt][5]+" style=\"height: 100px;width: 100px\" class=\"img-thumbnail\" alt=\"...\"></a>\n" +
                                        "</div>\n" +
                                        "<div class=\"col-md-8\">\n" +
                                        "<div class=\"noti_div\">\n" +
                                        "<a style=\"text-decoration: none;color: black\" href=\"/u/search_friends_detail?f="+responseData['result'][dt][3]+"\"><h5 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][3]+".</h5></a>\n" +
                                        cf_div_data_main+
                                        "<p>\n" +
                                        "<button class=\"btn btn-danger\" id=\"cancel"+responseData['result'][dt][0]+"\" onclick=\"cancelMultipleRequest(this)\" value="+responseData['result'][dt][0]+">Cancel</button>"+
                                        "<span id=\"accepted"+responseData['result'][dt][0]+"\"></span>\n" +
                                        "</p>\n" +
                                        "<p class=\"card-text\"><small class=\"text-muted load_more_friend\" style='display: none;visibility: hidden'>"+new_dt.format("MMM. D, YYYY, h:mm a")+"</small><small class=\"text-muted load_more_friend\">"+new_dt2+"</small></p>\n" +
                                        "</div>\n" +
                                        "</div>\n" +
                                        "</div>"
                        }
                        // alert("if end")
                        var mydt=moment((responseData['result'].slice(-1))[0][1]);
                        var mydt1=mydt.format("YYYY-M-D h:mm:ss");
                        document.getElementById("last_sent_req_datetime").value=mydt1;
                        document.getElementById("load_more_sent_req").innerHTML+=sent_req_div_dta;
                        // alert('end')
                    }
                    else {
                        // alert('mo res')
                        var no_req_warning="<div style='text-align: center;font-weight: bolder ' class=\"alert alert-danger\" role=\"alert\">\n" +
                                            "No More Request.\n" +
                                            "</div>";
                        document.getElementById("no_more_sent_req").innerHTML=no_req_warning;
                        // alert("else end")
                        }
                    load_more_req.innerHTML="<button class=\"btn btn-success\" onclick=\"load_more_sent_req()\">Load More Request</button>"
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}


function commentOnPost(e) {
    var comment=document.getElementById('post'+e+'comment').value;
    if(comment)
    {
     $.ajax(
            {
                url: '/u/commentOnPost/',
                type: "post",
                data: {"post_id": e,"comment":comment},
                success: function (responseData) {

                    if (responseData['result'])
                    {
                        var comments_div=document.getElementById('commentsofpost'+e);

                        var html_data="";
                        var len=responseData['result'].length;
                        // for (let res of responseData['result'])
                        for (var res=responseData['result'].length-1;res>=0;res--)
                        {
                            var new_dt=moment(responseData['result'][res][3]);
                            var new_dt2=timeDiff(new Date(),new_dt);
                            var comment_data='<div class="comments" >\n' +
                                            '<div class="comment">\n' +
                                            '<a href="/u/redirect_me/?u='+responseData['result'][res][1]+'" class="comment-avatar pull-left"><img src='+responseData['result'][res][0]+' alt=""></a>\n' +
                                            '<div class="comment-text">\n' +
                                            '<span style="font-weight: bold">&nbsp;<a style="text-decoration: none;color: black" href="/u/redirect_me/?u='+responseData['result'][res][1]+'">'+responseData['result'][res][1]+'</a></span>' +
                                            '<div style="overflow-y: scroll;max-height: 50px;padding: 5px">'+responseData['result'][res][2]+'</div>\n' +
                                            '<span style="float: right" class="small">'+new_dt2+'</span>\n' +
                                            '</div>\n' +
                                            '</div>\n' +
                                            '</div>'
                            html_data+=comment_data;
                        }
                        comments_div.innerHTML=html_data;
                        document.getElementById('post'+e+'comment').value='';
                        document.getElementById('noofcomments'+e).innerText=responseData['no_of_comments']+ ' Comments'
                    }
                    else {
                        document.getElementById('noofcomments'+e).innerText=responseData['no_of_comments']+ ' Comments'
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
    }
}

function likesOnPost(e) {
    var likes=document.getElementById('likesofpost'+e);
     $.ajax(
            {
                url: '/u/likeOnPost/',
                type: "post",
                data: {"post_id": e},
                success: function (responseData) {

                    if (responseData['no_of_likes'] != 0)
                    {
                       likes.innerText=responseData['no_of_likes'];
                    }

                    else {
                        likes.innerText='';
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}


function deletePost(e) {
    // var likes=document.getElementById('likesofpost'+e);
     $.ajax(
            {
                url: '/u/deletePost/',
                type: "post",
                data: {"post_id": e},
                success: function (responseData) {

                    if (responseData === "ok")
                    {
                        document.getElementById('closeModal'+e).click();
                        document.getElementById('postDiv'+e).remove();
                    }
                    else {
                        alert('exception')
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}


function likeModalPost(e) {
    var likes=document.getElementById('likeContent');
     $.ajax(
            {
                url: '/u/likeOnModalPost/',
                type: "post",
                data: {"post_id": e},
                success: function (responseData) {
                    var like_data=""
                    if (responseData['no_of_likes'] != 0)
                    {
                        like_data="<span style='font-size: 20px;text-align: center'>"+responseData['no_of_likes']+"&nbsp;&nbsp;&nbsp;" +
                              "<i class=\"fa fa-heart\" style=\"font-size:22px;color:red\"></i></span><br><br>"

                        for(var all_like in responseData['all_likes'])
                        {
                            like_data+="<a style='text-decoration: none;color: black' href='/u/redirect_me/?u="+responseData['all_likes'][all_like][1]+"'><div style='margin-bottom: 3px'>" +
                                "<img class='img-responsive img-thumbnail' style='height: 40px;width: 40px;border-radius: 20px' src="+responseData['all_likes'][all_like][0]+">&nbsp;&nbsp;" +
                                "<span style='font-size: 20px'>"+responseData['all_likes'][all_like][1]+"</span></div></a>"
                        }
                        likes.innerHTML=like_data;
                    }

                    else {
                        like_data="<span style='font-size: 20px;text-align: center'>"+responseData['no_of_likes']+"&nbsp;&nbsp;&nbsp;" +
                              "<i class=\"fa fa-heart\" style=\"font-size:22px;color:red\"></i></span><br><br>"
                        likes.innerHTML=like_data;
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}

function commentModalPost(commentText) {
    var post_id=document.getElementById('modalPostComment_PostId').value;
    $.ajax(
            {
                url: '/u/commentOnModalPost/',
                type: "post",
                data: {"post_id": post_id,"comment":commentText},
                success: function (responseData) {
                    var all_comments="";
                    var commentContent=document.getElementById('commentContent');
                    var commentBox="<div class=\"comment-form\">\n" +
                                    "<span class=\"form-group\">\n" +
                                    "<input type=\"text\" required class=\"form-control\" id=\"commentModalPost\" placeholder=\"Write your comment..\">\n<input type='hidden' id='modalPostComment_PostId' value='"+post_id+"'>" +
                                    "</span>\n" +
                                    "</div>"
                    if (responseData['no_of_comments'] > 0)
                    {
                        all_comments+="<span style='font-size: 20px;text-align: center'>"+responseData['no_of_comments']+"&nbsp;&nbsp;&nbsp;" +
                            "<i class='fa fa-comments-o' style='font-size:22px;color:red'></i></span><br><br>"

                        for(var allcomm in responseData['result'])
                        {
                            var new_dt=moment(responseData['result'][allcomm][3]);
                            var new_dt2=timeDiff(new Date(),new_dt);
                            all_comments+="<div class=\"comments\" >\n" +
                                        "<div class=\"comment\">\n" +
                                        "<a href=\"/u/redirect_me/?u="+responseData['result'][allcomm][1]+"\" class=\"comment-avatar pull-left\"><img class='img-responsive img-thumbnail' style='height: 40px;width: 40px;border-radius: 20px' src=\""+responseData['result'][allcomm][0]+"\" alt=\"\"></a>\n" +
                                        "<div class=\"comment-text\">\n" +
                                        "<span style=\"font-weight: bold\">&nbsp;<a style=\"text-decoration: none;color: black\" href=\"/u/redirect_me/?u="+responseData['result'][allcomm][1]+"\">"+responseData['result'][allcomm][1]+"</a></span>\n" +
                                        "<div style=\"overflow-y: scroll;max-height: 50px;padding: 5px\">"+responseData['result'][allcomm][2]+"</div>\n" +
                                        "<span style=\"float: right\" class=\"small\">"+new_dt2+"</span>\n" +
                                        "</div>\n" +
                                        "</div>\n" +
                                        "</div>"
                        }
                        commentContent.innerHTML=all_comments+commentBox;
                        commentForModalPost();
                    }
                    else {
                        all_comments+="<span style='font-size: 20px;text-align: center'>"+responseData['no_of_comments']+"&nbsp;&nbsp;&nbsp;" +
                            "<i class='fa fa-comments-o' style='font-size:22px;color:red'></i></span><br><br>";
                        commentContent.innerHTML=all_comments+commentBox;
                        commentForModalPost();
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}


function modalDetailedPost(e) {
     $.ajax(
            {
                url: '/u/modalPost/',
                type: "post",
                data: {"post_id": e},
                success: function (responseData) {

                    if (responseData['result'])
                    {
                        var corousel_data=""
                        var post_html="";
                        var files_on_post="";
                        var post_title="";
                        var media_files_array=[];
                        var other_files=[];
                        var post_id=null;
                        var likecontent="";
                        var commentcontent="";
                        for (data1 in responseData['result'][0])
                        {
                            var modal_title=document.getElementById('modalTitle'+e);
                            if (data1==='0')            //post data
                            {
                                post_id=responseData['result'][0][data1][0];
                                var post_desc=responseData['result'][0][data1][1];
                                var post_date1=moment(responseData['result'][0][data1][2]);
                                var post_username=responseData['result'][0][data1][3];
                                var usr_img=responseData['result'][0][data1][4];
                                var post_date2=timeDiff(new Date(),post_date1);

                                var modal_body=document.getElementById('modalBody'+e);
                                post_title="<span><a style='text-decoration: none' href='/u/redirect_me/?u="+post_username+"'><img style='max-height: 50px;max-width: 50px;border-radius: 20px' class='img-thumbnail img-responsive' src="+usr_img+"></a>&nbsp;</span><span><a style='text-decoration: none' href='/u/redirect_me/?u="+post_username+"'>"+post_username+"</a></span>"+
                                            responseData['result'][0][data1][5]+post_date1.format("MMM. D, YYYY, h:mm a")+
                                            "<br><span style='font-size: 15px'>Posted : "+post_date2+"&nbsp;&nbsp;&nbsp;&nbsp;</span>"
                                modal_title.innerHTML=post_title;

                                if(post_desc){
                                    post_html="<div class='col-sm-7' >" +
                                    "<div class='col-9 col-sm-12' >" +
                                    "<div class=\"bubble\" style=\"max-height: 800px;position: relative\">\n" +
                                    "<div class=\"pointer\" style=\"max-height: 800px\">\n" +
                                    "<p>\n" +
                                    ""+post_desc+"\n" +
                                    "</p>\n" +
                                    "</div>\n"+
                                    "</div>"
                                }
                                else {
                                    post_html="<div class='col-sm-7'>" +
                                    "<div class='col-9 col-sm-12'>"
                                }

                                modal_body.innerHTML=post_html;
                            }
                            else if(data1==='1')
                            {
                                var corousel_data1="<div id=\"carousel-example-1z\" class=\"carousel slide carousel-fade\" data-ride=\"carousel\">\n" +
                                        "  <!--Indicators-->\n" +
                                        "  <ol class=\"carousel-indicators\">\n"

                                var img_format=[".jpg",".jpeg",".png",".gif",".webp",".tiff",".psd",".bmp",".svg",".eps",".tif"];
                                var vdo_format=[".webm",".mkv",".flv",".ogg",".avi",".mov",".mp4",".mpg",".mpeg",".3gp"];
                                var corousel_data2=""

                                for(var media_files in responseData['result'][0][data1])
                                {
                                    if(img_format.includes(responseData['result'][0][data1][media_files][1]) || vdo_format.includes(responseData['result'][0][data1][media_files][1]))
                                    {
                                        media_files_array.push(responseData['result'][0][data1][media_files])
                                    }
                                    else{
                                        other_files.push(responseData['result'][0][data1][media_files])
                                    }
                                }
                                // alert(media_files_array)

                                for(var data2 in media_files_array)
                                {
                                    // alert(responseData['result'][0][data1])
                                    if(data2===0)
                                    {
                                        corousel_data2+="<li data-target=\"#carousel-example-1z\" data-slide-to=\""+data2+"\" class=\"active\"></li>\n"
                                    }
                                    else{
                                        corousel_data2+="<li data-target=\"#carousel-example-1z\" data-slide-to=\""+data2+"\"></li>\n"
                                    }
                                }
                                var corousel_data3="</ol>\n"
                                var corousel_data34="<div class=\"carousel-inner\" role=\"listbox\">"
                                var corousel_data4=""
                                var corousel_data5=""
                                var corousel_data6="</div>\n" +
                                        "  <a class=\"carousel-control-prev\" href=\"#carousel-example-1z\" role=\"button\" data-slide=\"prev\">\n" +
                                        "    <span class=\"carousel-control-prev-icon\" aria-hidden=\"true\"></span>\n" +
                                        "    <span class=\"sr-only\">Previous</span>\n" +
                                        "  </a>\n" +
                                        "  <a class=\"carousel-control-next\" href=\"#carousel-example-1z\" role=\"button\" data-slide=\"next\">\n" +
                                        "    <span class=\"carousel-control-next-icon\" aria-hidden=\"true\"></span>\n" +
                                        "    <span class=\"sr-only\">Next</span>\n" +
                                        "  </a>\n" +
                                        "  <!--/.Controls-->\n" +
                                        "</div>\n" +"<br>"
                                for(var data3=0;data3<media_files_array.length;data3++)
                                {
                                    if(img_format.includes(media_files_array[data3][1]))
                                    {
                                        // alert('included'+responseData['result'][0][data1][data3][1])
                                        if(data3===0)
                                        {
                                            corousel_data4+="<div class='carousel-item active'>\n" +
                                        "<img class='d-block w-100' src='/media/"+media_files_array[data3][0]+"'>" +
                                        "</div>"
                                        }
                                        else{
                                            corousel_data4+="<div class='carousel-item'>\n" +
                                        "<img class='d-block w-100' src='/media/"+media_files_array[data3][0]+"'>" +
                                        "</div>"
                                        }

                                    }
                                    else if(vdo_format.includes(media_files_array[data3][1]))
                                    {
                                        if(data3===0)
                                        {
                                            corousel_data4+="<div class=\"carousel-item active\">\n" +
                                            "<video controls width=\"560\" height=\"315\" src=/media/"+media_files_array[data3][0]+" ></video>"+
                                            "</div>"
                                        }
                                        else{
                                            corousel_data4+="<div class=\"carousel-item\">\n" +
                                            "<video controls width=\"560\" height=\"315\" src=/media/"+media_files_array[data3][0]+"></video>"+
                                            "</div>"
                                        }

                                    }

                                    // alert('1')
                                }
                                var other_files_div=""
                                for (var othr_fle in other_files)
                                {
                                    other_files_div+="<div><a style='text-decoration: none;' target='_blank' href='/media/"+other_files[othr_fle][0]+"'>"+other_files[othr_fle][2]+"</a></div>"
                                }
                                corousel_data=corousel_data1+corousel_data2+corousel_data3+corousel_data34+corousel_data4+corousel_data5+corousel_data6
                                // alert(corousel_data)
                                // alert(media_files_array)
                                // alert(typeof media_files_array)

                                // alert(post_html)
                            }
                            else if(data1==='2')
                            {
                                var liked="";
                                // alert(responseData['result'][0][data1])
                                // alert(typeof responseData['result'][0][data1])
                                if(JSON.parse(responseData['result'][0][data1])===true)
                                {
                                    liked="<button x-data=\"{\n" +
                                        "                                    state: 'Liked',usedKeyboard: false, async updateState(to) {\n" +
                                        "                                        this.state = 'Saving'\n" +
                                        "                                        await new Promise(resolve => setTimeout(resolve, 500))\n" +
                                        "                                        this.state = to\n" +
                                        "                                        }\n" +
                                        "                                        }\"\n" +
                                        "                                    :class=\"{ 'like unliked': state === 'Unliked','like saving': state === 'Saving',\n" +
                                        "                                              'like liked': state === 'Liked','focus:outline-none': !usedKeyboard\n" +
                                        "                                            }\"\n" +
                                        "                                    @click=\"updateState(state === 'Unliked' ? 'Liked' : 'Unliked')\" @keydown.window.tab=\"usedKeyboard = true\" id='modalPostLikeButton' value="+post_id+">\n" +
                                        "                                            <span class=\"like-icon like-icon-state\" aria-label=\"state\" x-text=\"state\" aria-live=\"polite\">Unliked</span>\n" +
                                        "                                    </button>"
                                }
                                else{
                                    liked="<button  x-data=\"{\n" +
                                        "                                    state: 'Unliked',usedKeyboard: false, async updateState(to) {\n" +
                                        "                                        this.state = 'Saving'\n" +
                                        "                                        await new Promise(resolve => setTimeout(resolve, 500))\n" +
                                        "                                        this.state = to\n" +
                                        "                                        }\n" +
                                        "                                        }\"\n" +
                                        "                                    :class=\"{ 'like unliked': state === 'Unliked','like saving': state === 'Saving',\n" +
                                        "                                              'like liked': state === 'Liked','focus:outline-none': !usedKeyboard\n" +
                                        "                                            }\"\n" +
                                        "                                    @click=\"updateState(state === 'Unliked' ? 'Liked' : 'Unliked')\" @keydown.window.tab=\"usedKeyboard = true\" id='modalPostLikeButton' value="+post_id+">\n" +
                                        "                                            <span class=\"like-icon like-icon-state\" aria-label=\"state\" x-text=\"state\" aria-live=\"polite\">Unliked</span>\n" +
                                        "                                    </button>"
                                }
                                modal_title.innerHTML+=liked;
                                if(media_files_array.length>0){
                                    post_html+="<br>"+corousel_data+other_files_div+
                                    "</div>" +
                                    "</div>" +
                                    "<div class='col-6 col-sm-5' style='background-color: lightgray'>" +
                                    "<div class='col-5 col-sm-5' id='likeContent' style='background-color: lightgray'></div>" +
                                    "<div class='col-8 col-sm-7' id='commentContent' style='background-color: darkgrey'></div>" +
                                    "</div>"
                                }
                                else if(other_files.length>0){
                                    post_html+="<br>"+other_files_div+
                                    "</div>" +
                                    "</div>" +
                                    "<div class='col-6 col-sm-5' style='background-color: lightgray'>" +
                                    "<div class='col-8 col-sm-6' id='likeContent' style='background-color: lightgray'></div>" +
                                    "<div class='col-8 col-sm-6' id='commentContent' style='background-color: darkgrey'></div>" +
                                    "</div>"
                                }
                                else{
                                    post_html+="<br>"+
                                    "</div>" +
                                    "</div>" +
                                    "<div class='col-4 col-sm-5' style='background-color: lightgray'>" +
                                    "<div class='col-8 col-sm-6' id='likeContent' style='background-color: lightgray'></div>" +
                                    "<div class='col-8 col-sm-6' id='commentContent' style='background-color: darkgrey'></div>" +
                                    "</div>"
                                }

                                document.getElementById('modalBody'+e).innerHTML=post_html;
                                likeForModalPost();
                                // alert(post_html)
                                // alert(modal_title.innerHTML)
                            }
                            else if(data1==='3')
                            {
                                likecontent="&nbsp;&nbsp;<span style='font-size: 20px;text-align: center'>"+responseData['result'][0][data1]+"&nbsp;&nbsp;&nbsp;<i class=\"fa fa-heart\" style=\"font-size:22px;color:red\"></i></span><br><br>"
                                document.getElementById('likeContent').innerHTML=likecontent
                            }
                            else if(data1==='4')
                            {
                                commentcontent="<span style='font-size: 20px;text-align: center'>"+responseData['result'][0][data1]+"&nbsp;&nbsp;&nbsp;<i class='fa fa-comments-o' style='font-size:22px;color:red'></i></span><br><br>"
                                document.getElementById('commentContent').innerHTML=commentcontent
                            }
                            else if(data1==='5')
                            {
                                var allLikes="";
                                for (var allike in responseData['result'][0][data1])
                                {
                                    allLikes+="<a style='text-decoration: none;color: black' href='/u/redirect_me/?u="+responseData['result'][0][data1][allike][0]+"'><div style='margin-bottom: 3px'><img class='img-responsive img-thumbnail' style='height: 40px;width: 40px;border-radius: 20px' src="+responseData['result'][0][data1][allike][1]+">&nbsp;&nbsp;<span style='font-size: 20px'>"+responseData['result'][0][data1][allike][0]+"</span></div></a>"
                                }
                                likecontent+=allLikes;
                                document.getElementById('likeContent').innerHTML=likecontent;
                            }
                            else if(data1==='6')
                            {
                                var allComments="";
                                for (var allcomm in responseData['result'][0][data1])
                                {
                                    var new_dt=moment(responseData['result'][0][data1][allcomm][3]);
                                    var new_dt2=timeDiff(new Date(),new_dt);
                                    allComments+="<div class=\"comments\" >\n" +
                                        "<div class=\"comment\">\n" +
                                        "<a href=\"/u/redirect_me/?u="+responseData['result'][0][data1][allcomm][1]+"\" class=\"comment-avatar pull-left\"><img class='img-responsive img-thumbnail' style='height: 40px;width: 40px;border-radius: 20px' src=\""+responseData['result'][0][data1][allcomm][0]+"\" alt=\"\"></a>\n" +
                                        "<div class=\"comment-text\">\n" +
                                        "<span style=\"font-weight: bold\">&nbsp;<a style=\"text-decoration: none;color: black\" href=\"/u/redirect_me/?u="+responseData['result'][0][data1][allcomm][1]+"\">"+responseData['result'][0][data1][allcomm][1]+"</a></span>\n" +
                                        "<div style=\"overflow-y: scroll;max-height: 50px;padding: 5px\">"+responseData['result'][0][data1][allcomm][2]+"</div>\n" +
                                        "<span style=\"float: right\" class=\"small\">"+new_dt2+"</span>\n" +
                                        "</div>\n" +
                                        "</div>\n" +
                                        "</div>"
                                }

                                var comment_on_modal_post="<div class=\"comment-form\">\n" +
                                    "<span class=\"form-group\">\n" +
                                    "<input type=\"text\" required class=\"form-control\" id=\"commentModalPost\" placeholder=\"Write your comment..\">\n<input type='hidden' id='modalPostComment_PostId' value='"+post_id+"'>" +
                                    "</span>\n" +
                                    "</div>"
                                commentcontent+=allComments+comment_on_modal_post;
                                document.getElementById('commentContent').innerHTML=commentcontent;
                                commentForModalPost();
                            }
                        }

                    }
                    else {
                        alert('no data')
                    }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}

function eraseModalHtml(post_id) {
    document.getElementById('modalBody'+post_id).innerHTML=""
}

function checkUsername(e) {
    $.ajax(
            {
                url: '/u/checkUsername/',
                type: "post",
                data: {"un": e.value},
                success: function (responseData) {
                    var un_div=document.getElementById('username_div');
                    if (responseData['msg'] === true)
                    {

                        un_div.innerText="Username Available."
                        un_div.style.color="green";
                        un_div.style.fontSize="17px";
                        document.getElementById('update_btn').disabled=false;
                    }
                    else {
                        un_div.innerText="Username Exist.";
                        un_div.style.color="red";
                        un_div.style.fontSize="17px";
                        document.getElementById('update_btn').disabled=true;
                    }
                    disableUpdateButton();
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}

function checkUseremail(e) {
    $.ajax(
            {
                url: '/u/checkUseremail/',
                type: "post",
                data: {"ue": e.value},
                success: function (responseData) {
                    var ue_div=document.getElementById('useremail_div');
                    if (responseData['msg'] === true)
                    {
                        ue_div.innerText="Email Available.";
                        ue_div.style.color="green";
                        ue_div.style.fontSize="17px"
                        document.getElementById('update_btn').disabled=false;
                    }
                    else {
                        ue_div.innerText="Email Exist.";
                        ue_div.style.color="red";
                        ue_div.style.fontSize="17px"
                        document.getElementById('update_btn').disabled=true;
                    }
                    disableUpdateButton();
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}

function disableUpdateButton() {
    var un=document.getElementById('username_div').innerText;
    var ue=document.getElementById('useremail_div').innerText;
    if(un==="Username Exist." || ue==="Email Exist.")
    {
        document.getElementById('update_btn').disabled=true;
    }
}

function loadMorePost(postType,searchedUser=null) {
    var loading=document.getElementById('loadingPost');
    if(loading===null){
        var loadingIcon="<div id='loadingPost' class=\"text-center text-success\">\n" +
            "  <div class=\"spinner-border\" role=\"status\">\n" +
            "    <span class=\"visually-hidden\"></span>\n" +
            "  </div>\n" +
            "</div>"
        document.getElementById('allPostsDiv').innerHTML+=loadingIcon;
    }
    var lastpost=document.getElementById('lastPost').value;
    var currUser=document.getElementById('currentUser').value;

    $.ajax(
            {
                url: '/u/loadMorePost/',
                type: "post",
                data: {"lastPost":lastpost,"postType":postType,"searchedUser":searchedUser},        //if postType =0 then mypost+friendspost, if 1then mypost , if 2 then particular user post
                success: function (responseData) {
                    var mainPostDiv="";
                    var postDiv="";
                    if (responseData['result'] !== "")
                    {
                        for(var x=0;x<responseData['result'].length;x++)
                        {
                            var post_date1=moment(responseData['result'][x][0][2]);
                            var post_date2=timeDiff(new Date(),post_date1)
                            postDiv+="<div class=\"panel panel-default post\" style=\"overflow: hidden\" id=\"postDiv"+responseData['result'][x][0][0]+"\">"
                            if(currUser===responseData['result'][x][0][3])
                            {
                                postDiv+="<span style=\"float: left;margin-right: -5px\">\n" +
                                    "                       <button type=\"button\"  data-toggle=\"modal\" data-target=\"#exampleModal"+responseData['result'][x][0][0]+"\" style=\"background-color: transparent;border: none;margin-right: -11px\">\n" +
                                    "                            <svg width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-trash-fill\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
                                    "                                <path fill-rule=\"evenodd\" d=\"M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z\"/>\n" +
                                    "                            </svg>\n" +
                                    "                       </button>\n" +
                                    "                        <div class=\"modal-dialog modal-xl\">\n" +
                                    "                            <div class=\"modal fade\" id=\"exampleModal"+responseData['result'][x][0][0]+"\" tabindex=\"-1\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\n" +
                                    "                                <div class=\"modal-dialog\">\n" +
                                    "                                    <div class=\"modal-content\">\n" +
                                    "                                        <div class=\"modal-header\">\n" +
                                    "                                            <h5 class=\"modal-title\" id=\"exampleModalLabel\" style=\"color: red\">Delete Post</h5>\n" +
                                    "                                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n" +
                                    "                                                <span aria-hidden=\"true\">&times;</span>\n" +
                                    "                                            </button>\n" +
                                    "                                        </div>\n" +
                                    "                                        <div class=\"modal-body\">\n" +
                                    "                                            Are you sure you want to delete the post?\n" +
                                    "                                        </div>\n" +
                                    "                                        <div class=\"modal-footer\">\n" +
                                    "                                            <button type=\"button\" id=\"closeModal"+responseData['result'][x][0][0]+"\" class=\"btn btn-secondary\" data-dismiss=\"modal\">No. Close</button>\n" +
                                    "                                            <button type=\"button\" class=\"btn btn-primary\" onclick=\"deletePost("+responseData['result'][x][0][0]+")\" >Yes. Delete</button>\n" +
                                    "                                        </div>\n" +
                                    "                                    </div>\n" +
                                    "                                </div>\n" +
                                    "                            </div>\n" +
                                    "                        </div>\n" +
                                    "                    </span>"
                            }
                            postDiv+="<div class=\"panel-body\">\n" +
                                "                 <div class=\"row\">\n" +
                                "                   <div class=\"col-sm-2\">"+
                                "<a href=\"/u/redirect_me/?u="+responseData['result'][x][0][3]+"\" class=\"post-avatar thumbnail\"><img src=\""+responseData['result'][x][0][4]+"\" alt=\"\"><div class=\"text-center\" style=\"overflow: hidden\">"+responseData['result'][x][0][3]+"</div></a>\n" +
                                "                     <div class=\"small text-center\">Posted : "+post_date2+"</div><br>\n" +
                                "                     <div class=\"likes text-center\">"
                            if(responseData['result'][x][3]>0)
                            {
                                postDiv+="<span class=\"no_of_likes\" id=\"likesofpost"+responseData['result'][x][0][0]+"\">"+responseData['result'][x][3]+"</span><br>"
                            }
                            else{
                                postDiv+="<span class=\"no_of_likes\" id=\"likesofpost"+responseData['result'][x][0][0]+"\"></span><br>"
                            }
                            if(JSON.parse(responseData['result'][x][2])===true)
                            {
                                postDiv+="<button onclick=\"likesOnPost("+responseData['result'][x][0][0]+")\" x-data=\"{\n" +
                                    "                                    state: 'Liked',usedKeyboard: false, async updateState(to) {\n" +
                                    "                                        this.state = 'Saving'\n" +
                                    "                                        await new Promise(resolve => setTimeout(resolve, 500))\n" +
                                    "                                        this.state = to\n" +
                                    "                                        }\n" +
                                    "                                        }\"\n" +
                                    "                                    :class=\"{ 'like unliked': state === 'Unliked','like saving': state === 'Saving',\n" +
                                    "                                              'like liked': state === 'Liked','focus:outline-none': !usedKeyboard\n" +
                                    "                                            }\"\n" +
                                    "                                    @click=\"updateState(state === 'Unliked' ? 'Liked' : 'Unliked')\" @keydown.window.tab=\"usedKeyboard = true\">\n" +
                                    "                                            <span class=\"like-icon like-icon-state\" aria-label=\"state\" x-text=\"state\" aria-live=\"polite\">Unliked</span>\n" +
                                    "                                    </button>"
                            }
                            else{
                                postDiv+="<button onclick=\"likesOnPost("+responseData['result'][x][0][0]+")\" x-data=\"{\n" +
                                    "                                    state: 'Unliked',usedKeyboard: false, async updateState(to) {\n" +
                                    "                                        this.state = 'Saving'\n" +
                                    "                                        await new Promise(resolve => setTimeout(resolve, 500))\n" +
                                    "                                        this.state = to\n" +
                                    "                                        }\n" +
                                    "                                        }\"\n" +
                                    "                                    :class=\"{ 'like unliked': state === 'Unliked','like saving': state === 'Saving',\n" +
                                    "                                              'like liked': state === 'Liked','focus:outline-none': !usedKeyboard\n" +
                                    "                                            }\"\n" +
                                    "                                    @click=\"updateState(state === 'Unliked' ? 'Liked' : 'Unliked')\" @keydown.window.tab=\"usedKeyboard = true\">\n" +
                                    "                                            <span class=\"like-icon like-icon-state\" aria-label=\"state\" x-text=\"state\" aria-live=\"polite\">Unliked</span>\n" +
                                    "                                    </button>"
                            }
                            postDiv+="</div></div><div class=\"col-sm-10\">\n" +
                                    "<span style=\"font-size: 17px\"><b><a style=\"text-decoration: none\" href=\"/u/redirect_me/?u="+responseData['result'][x][0][3]+"\">"+responseData['result'][x][0][3]+"</a> "+responseData['result'][x][0][5]+" "+post_date1.format("MMM. D, YYYY, h:mm a")+"</b></span>"
                            // alert(responseData['result'][x][0][1])
                            // alert(typeof responseData['result'][x][0][1])
                            if(responseData['result'][x][0][1] !== "") {
                                postDiv += "<div class=\"bubble\" style=\"max-height: 200px;position: relative\">\n" +
                                    "                            <div class=\"pointer\" style=\"max-height: 400px\">\n" +
                                    "                                <p>\n" +
                                    "                                    " + responseData['result'][x][0][1].slice(0, 50) + "\n"
                                if (responseData['result'][x][0][1].length > 50) {
                                    postDiv += "<a data-toggle=\"collapse\" href=\"#gotopost" + responseData['result'][x][0][0] + "\" role=\"button\" aria-expanded=\"false\" aria-controls=\"collapseExample\">\n" +
                                        "View Full Post.\n" +
                                        "</a>\n" +
                                        "<div class=\"collapse\" id=\"gotopost" + responseData['result'][x][0][0] + "\">\n" +
                                        "<div class=\"card card-body\" style=\"overflow-y: scroll;max-height: 135px\">\n" +
                                        "" + responseData['result'][x][0][1] + "\n" +
                                        "</div>\n" +
                                        "</div>\n"

                                }
                                postDiv += "</p>\n" +
                                    "</div>\n" +
                                    "</div>" +
                                    "<br>\n"
                            }
                                postDiv+="<div class=\"pointer-border\" style=\"float: left;min-height: 180px\">"
                                var filesOnPost=responseData['result'][x][1].slice(0,3);
                            // alert(filesOnPost)
                                var counter=0;
                                var length_filesOnPost=responseData['result'][x][1].length;
                                // alert(length_filesOnPost)
                                var img_format=[".jpg",".jpeg",".png",".gif",".webp",".tiff",".psd",".bmp",".svg",".eps",".tif"];
                                var vdo_format=[".webm",".mkv",".flv",".ogg",".avi",".mov",".mp4",".mpg",".mpeg",".3gp"];
                                for(var filedata=0;filedata<filesOnPost.length;filedata++)
                                {
                                    if(counter<=1)
                                    {
                                        if(img_format.includes(responseData['result'][x][1][filedata][1]))
                                        {
                                            if(length_filesOnPost===1)
                                            {
                                                postDiv+="<img src=\"/media/"+responseData['result'][x][1][filedata][0]+"\" onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\" class=\"img-fluid rounded img-thumbnail\" style=\"max-height: 470px;max-width: 540px;margin-bottom: 10px\" alt=\"Image Not Available\">"
                                            }
                                            else{
                                                postDiv+="<img src=\"/media/"+responseData['result'][x][1][filedata][0]+"\" onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\" class=\"post-avatar thumbnail rounded float-left\" style=\"max-height: 170px;max-width: 170px;float: left\" alt=\"Image Not Available\">"
                                            }
                                        }
                                        else if(vdo_format.includes(responseData['result'][x][1][filedata][1]))
                                        {
                                            postDiv+="<span data-toggle=\"modal\" onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\"><video controls src=\"/media/"+responseData['result'][x][1][filedata][0]+"\" style=\"max-height: 170px;max-width: 170px\"></video></span>"
                                        }
                                        else{
                                            postDiv+="<span style=\"overflow: hidden\"><a href=\"/media/"+responseData['result'][x][1][filedata][0]+"\" target=\"_blank\">"+responseData['result'][x][1][filedata][2].slice(0,32)+"&nbsp;&nbsp;</a></span>"
                                        }
                                    }
                                    else{
                                        postDiv+="<span class=\"blurred_img\">"
                                        if(filesOnPost.length===counter && length_filesOnPost>3)
                                        {
                                            if(img_format.includes(responseData['result'][x][1][filedata][1]))
                                            {
                                                postDiv+="<img onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\" src=\"/media/"+responseData['result'][x][1][filedata][0]+"\" class=\"post-avatar thumbnail rounded float-left\" style=\"max-height: 170px;max-width: 170px;float: left;opacity: 0.5;overflow: hidden\" alt=\"Image Not Available\">"
                                            }
                                            else if(vdo_format.includes(responseData['result'][x][1][filedata][1]))
                                            {
                                                postDiv+="<span onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\"><video controls src=\"/media/"+responseData['result'][x][1][filedata][0]+"\" style=\"max-height: 170px;max-width: 170px\"></video></span>"
                                            }
                                            else{
                                                postDiv+="<span style=\"overflow: hidden\"><a href=\"/media/"+responseData['result'][x][1][filedata][0]+"\" target=\"_blank\">"+responseData['result'][x][1][filedata][2].slice(0,32)+"&nbsp;&nbsp;</a></span>"
                                            }
                                        }
                                        else{
                                            if(img_format.includes(responseData['result'][x][1][filedata][1]))
                                            {
                                                postDiv+="<img onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\" src=\"/media/"+responseData['result'][x][1][filedata][0]+"\" class=\"post-avatar thumbnail rounded float-left\" style=\"max-height: 170px;max-width: 170px;float: left;opacity: 0.5;overflow: hidden\" alt=\"Image Not Available\">"
                                            }
                                            else if(vdo_format.includes(responseData['result'][x][1][filedata][1]))
                                            {
                                                postDiv+="<span onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\"><video controls src=\"/media/"+responseData['result'][x][1][filedata][0]+"\" style=\"max-height: 170px;max-width: 170px\"></video></span>"
                                            }
                                            else{
                                                postDiv+="<span style=\"\"><a href=\"/media/"+responseData['result'][x][1][filedata][0]+"\" target=\"_blank\">"+responseData['result'][x][1][filedata][2].slice(0,32)+"&nbsp;&nbsp;</a></span>"
                                            }
                                        }
                                        postDiv+="<div onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" class=\"centered\" style=\"overflow: hidden\" data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\">\n"

                                        var deductNooffiles=-3;
                                        var moreFiles=length_filesOnPost+deductNooffiles;
                                        if(length_filesOnPost>3 && img_format.includes(responseData['result'][x][1][filedata][1]))
                                        {
                                            if(length_filesOnPost+deductNooffiles !==0)
                                            {
                                                postDiv+="+"+moreFiles+" more";
                                            }
                                        }
                                        else{
                                                postDiv+="<span data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\"><br>\n"
                                                if(length_filesOnPost+deductNooffiles !==0)
                                                {
                                                    postDiv+="+"+moreFiles+" more";
                                                }
                                                postDiv+="</span>\n"
                                            }
                                        postDiv+="</div></span>"
                                    }
                                    counter+=1
                                }
                                postDiv+="</div>"
                                if(responseData['result'][x][5].length>0)
                                {
                                    postDiv+="<div id=\"commentsofpost"+responseData['result'][x][0][0]+"\">"
                                    for(var comments=responseData['result'][x][5].length-1;comments>=0;comments--)
                                    {
                                        var comm_date1=moment(responseData['result'][x][5][comments][3]);
                                        var comm_date2=timeDiff(new Date(),comm_date1);
                                        postDiv+="<div class=\"comments\" >\n" +
                                            "<div class=\"comment\">\n" +
                                            "<a href=\"/u/redirect_me/?u="+responseData['result'][x][5][comments][3]+"\" class=\"comment-avatar pull-left\"><img src=\""+responseData['result'][x][5][comments][0]+"\" alt=\"\"></a>\n" +
                                            "<div class=\"comment-text\">\n" +
                                            "<span style=\"font-weight: bold\">&nbsp;<a style=\"text-decoration: none;color: black\" href=\"/u/redirect_me/?u="+responseData['result'][x][5][comments][1]+"\">"+responseData['result'][x][5][comments][1]+"</a></span>\n" +
                                            "<div style=\"overflow-y: scroll;max-height: 50px;padding: 5px\">"+responseData['result'][x][5][comments][2]+"</div>\n" +
                                            "<span style=\"float: right\" class=\"small\">"+comm_date2+"</span>\n" +
                                            "</div>\n" +
                                            "</div>\n" +
                                            "</div>"
                                    }
                                    postDiv+="</div>"
                                }
                                else{
                                    postDiv+="<div id=\"commentsofpost"+responseData['result'][x][0][0]+"\"></div>"
                                }
                                postDiv+="<button onclick=\"modalDetailedPost("+responseData['result'][x][0][0]+")\" data-toggle=\"modal\" data-target=\"#detailModal"+responseData['result'][x][0][0]+"\" type=\"button\" id=\"noofcomments"+responseData['result'][x][0][0]+"\" class=\"btn btn-info btn-sm btn-block\">"+responseData['result'][x][4]+"   Comments</button>\n" +
                                    "                        <br>\n" +
                                    "                       <div class=\"comment-form\">\n" +
                                    "                        <span class=\"form-group\">\n" +
                                    "                            <input type=\"text\" required class=\"form-control\" onchange=\"commentOnPost("+responseData['result'][x][0][0]+")\" id=\"post"+responseData['result'][x][0][0]+"comment\" placeholder=\"Write your comment..\">\n" +
                                    "                        </span>\n" +
                                    "                     </div>"
                                postDiv+="</div></div></div></div>"
                        postDiv+="<div class=\"modal-dialog modal-xl\" >\n" +
                            "                <div class=\"modal fade\" id=\"detailModal"+responseData['result'][x][0][0]+"\" tabindex=\"-1\" aria-labelledby=\"exampleModalLabel\" aria-hidden=\"true\">\n" +
                            "                    <div class=\"modal-dialog modal-dialog-scrollable modal-xl\">\n" +
                            "                        <div class=\"modal-content\">\n" +
                            "                            <div class=\"modal-header\">\n" +
                            "                                <h5 class=\"modal-title\" id=\"modalTitle"+responseData['result'][x][0][0]+"\">Modal title</h5>\n" +
                            "                                <button onclick=\"eraseModalHtml("+responseData['result'][x][0][0]+")\" type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n" +
                            "                                    <span aria-hidden=\"true\">&times;</span>\n" +
                            "                                </button>\n" +
                            "                            </div>\n" +
                            "                            <div class=\"modal-body\" id=\"modalBody"+responseData['result'][x][0][0]+"\">\n" +
                            "                            </div>\n" +
                            "                            <div class=\"modal-footer\">\n" +
                            "                                <button type=\"button\" onclick=\"eraseModalHtml("+responseData['result'][x][0][0]+")\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>\n" +
                            "                            </div>\n" +
                            "                        </div>\n" +
                            "                    </div>\n" +
                            "                </div>\n" +
                            "            </div>"
                        mainPostDiv+=postDiv;
                        postDiv=""
                        document.getElementById('lastPost').value=post_date1.format("MMM. D, YYYY, h:mm a");
                        }
                        document.getElementById('loadingPost').remove();
                        document.getElementById('allPostsDiv').innerHTML+=mainPostDiv;
                    }
                    else {
                        document.getElementById('loadingPost').remove();
                        var noPost=document.getElementById('noPost');
                        if(noPost===null)
                        {
                            var noPostHtml="<div id='noPost' style='text-align: center;font-weight: bolder ' class=\"alert alert-danger\" role=\"alert\">\n" +
                                            "No Post.\n" +
                                            "</div>"
                            document.getElementById('allPostsDiv').innerHTML+=noPostHtml;
                        }
                    }

                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}


function load_more_activity() {
    var load_more_button=document.getElementById("load_more_button");
    load_more_button.innerHTML="<button class=\"btn btn-success\" disabled>\n" +
                "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>\n" +
                "Loading...\n" +
                "</button>"
    var divs=document.getElementsByClassName('text-muted');
    var lst_date=divs[divs.length-1].innerHTML;
    $.ajax(
            {
                url: '/u/load_activity/',
                type: "post",
                data: {"date": lst_date},
                success: function (responseData) {
                    if (responseData['result'])
                    {
                        var noti_div_dta="";
                        var noti_type="";
                        var icon_data="";
                        var postType=["Post Created","Commented on post","Liked","Updated Profile","Commented on profile"];
                        var postType1=["Friend Request","Request Accepted"];
                        for(var dt=0;dt<responseData['result'].length;dt++)
                        {
                            noti_type=responseData['result'][dt][1];
                            if(noti_type === "Post Created")
                            {
                                icon_data="<img src=\"/static/images/icons8-create-50.png\" height=\"30px\" width=\"30px\">"
                            }
                            else if(noti_type === "Commented on own post" || noti_type === "Commented on post" || noti_type === "Commented on own profile" || noti_type === "Commented on profile")
                            {
                                icon_data="<img src=\"/static/images/comment_icon.png\" height=\"30px\" width=\"30px\">"
                            }
                            else if(noti_type === "Liked" || noti_type === "Liked on own")
                            {
                                icon_data="<i class=\"fa fa-heart\" style=\"font-size:18px;color:red\"></i>"
                            }
                            else if(noti_type === "Updated Profile")
                            {
                                icon_data="<img src=\"/static/images/update_profile_icon.png\" height=\"30px\" width=\"30px\">"
                            }
                            else if(noti_type === "Friend Request")
                            {
                                icon_data="<img src=\"/static/images/add_friend.png\" height=\"30px\" width=\"40px\">"
                            }
                            else if(noti_type === "Request Accepted")
                            {
                                icon_data="<img src=\"/static/images/accepted_friend.png\" height=\"30px\" width=\"40px\">"
                            }
                            else {icon_data=""}
                            if(responseData['result'][dt][1])
                            {
                                var new_dt2=moment(responseData['result'][dt][6]);
                                var new_dt=timeDiff(new Date(),moment(responseData['result'][dt][6]));
                                if(postType.includes(responseData['result'][dt][1]))
                                {
                                    if(responseData['result'][dt][5]==="unread")
                                    {
                                    noti_div_dta+="<div class=\"card\" style=\"max-width: 850px;overflow: hidden\">\n" +
                                                "<div class=\"row no-gutters\">" +
                                                "<a href=\"/u/view_post/?idnt="+responseData['result'][dt][8]+"&nid="+responseData['result'][dt][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                                "<div class=\"col-md-2\" style=\"background-color: rgba(191,187,126,0.53)\">\n" +
                                                "<img src="+responseData['result'][dt][7]+" style=\"max-height: 100px;max-width: 80px\" class=\"img-thumbnail\" alt=\"...\">\n" +
                                                "</div>\n" +
                                                "<div class=\"col-md-8\" style=\"background-color:  rgba(191,187,126,0.53);\">\n" +
                                                "<div class=\"noti_div\">\n" +
                                                "<h6 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][1]+"&nbsp;&nbsp;"+icon_data+"</h6>\n" +
                                                "<p class=\"card-text\"><h6>"+responseData['result'][dt][2]+"</h6></p>\n" +
                                                "<p class=\"card-text\"><small class=\"text-muted\">"+new_dt2.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt+"</small></p>\n" +
                                                "</div>\n" +
                                                "</div>\n" +
                                                "</a></div></div>";
                                    }
                                    else{
                                    noti_div_dta+="<div class=\"card\" style=\"max-width: 850px;overflow: hidden\">\n" +
                                                "<div class=\"row no-gutters\">" +
                                                "<a href=\"/u/view_postr/?idnt="+responseData['result'][dt][8]+"\" style=\"text-decoration: none;color: black\">\n" +
                                                "<div class=\"col-md-2\">\n" +
                                                "<img src="+responseData['result'][dt][7]+" style=\"max-height: 100px;max-width: 80px\" class=\"img-thumbnail\" alt=\"...\">\n" +
                                                "</div>\n" +
                                                "<div class=\"col-md-8\">\n" +
                                                "<div class=\"noti_div\">\n" +
                                                "<h6 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][1]+"&nbsp;&nbsp;"+icon_data+"</h6>\n" +
                                                "<p class=\"card-text\"><h6>"+responseData['result'][dt][2]+"</h6></p>\n" +
                                                "<p class=\"card-text\"><small class=\"text-muted\" style='display: none;visibility: hidden'>"+new_dt2.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt+"</small></p>\n" +
                                                "</div>\n" +
                                                "</div>\n" +
                                                "</a></div></div>";
                                    }
                                }
                                else if(postType1.includes(responseData['result'][dt][1])){
                                    if(responseData['result'][dt][5]==="unread")
                                    {
                                    noti_div_dta+="<div class=\"card\" style=\"max-width: 850px;overflow: hidden\">\n" +
                                                "<div class=\"row no-gutters\">" +
                                                "<a href=\"/u/read_acti/?idnt="+responseData['result'][dt][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                                "<div class=\"col-md-2\" style=\"background-color: rgba(191,187,126,0.53)\">\n" +
                                                "<img src="+responseData['result'][dt][7]+" style=\"max-height: 100px;max-width: 80px\" class=\"img-thumbnail\" alt=\"...\">\n" +
                                                "</div>\n" +
                                                "<div class=\"col-md-8\" style=\"background-color:  rgba(191,187,126,0.53);\">\n" +
                                                "<div class=\"noti_div\">\n" +
                                                "<h6 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][1]+"&nbsp;&nbsp;"+icon_data+"</h6>\n" +
                                                "<p class=\"card-text\"><h6>"+responseData['result'][dt][2]+"</h6></p>\n" +
                                                "<p class=\"card-text\"><small class=\"text-muted\">"+new_dt2.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt+"</small></p>\n" +
                                                "</div>\n" +
                                                "</div>\n" +
                                                "</a></div></div>";
                                    }
                                    else{
                                        noti_div_dta+="<div class=\"card\" style=\"max-width: 850px;overflow: hidden\">\n" +
                                                "<div class=\"row no-gutters\">" +
                                                "<a href=\"/u/read_acti/?idnt="+responseData['result'][dt][0]+"\" style=\"text-decoration: none;color: black\">\n" +
                                                "<div class=\"col-md-2\">\n" +
                                                "<img src="+responseData['result'][dt][7]+" style=\"max-height: 100px;max-width: 80px\" class=\"img-thumbnail\" alt=\"...\">\n" +
                                                "</div>\n" +
                                                "<div class=\"col-md-8\">\n" +
                                                "<div class=\"noti_div\">\n" +
                                                "<h6 class=\"card-title\" style=\"font-weight: bold\">"+responseData['result'][dt][1]+"&nbsp;&nbsp;"+icon_data+"</h6>\n" +
                                                "<p class=\"card-text\"><h6>"+responseData['result'][dt][2]+"</h6></p>\n" +
                                                "<p class=\"card-text\"><small class=\"text-muted\" style='display: none;visibility: hidden'>"+new_dt2.format("MMM. D, YYYY, h:mm a")+"</small><small>"+new_dt+"</small></p>\n" +
                                                "</div>\n" +
                                                "</div>\n" +
                                                "</a></div></div>";
                                }
                                }
                                else{
                                }
                            }
                        }
                    document.getElementById("loaded_noti").innerHTML+=noti_div_dta;
                    load_more_button.innerHTML="<button class=\"btn btn-success\" onclick=\"load_more_activity()\">Load More</button>"
                    }
                    else {
                        var no_noti_warning="<div style='text-align: center;font-weight: bolder ' class=\"alert alert-danger\" role=\"alert\">\n" +
                                            "No More Activity.\n" +
                                            "</div>";
                        document.getElementById("no_more_noti").innerHTML=no_noti_warning;
                        load_more_button.innerHTML="<button class=\"btn btn-success\" onclick=\"load_more_activity()\">Load More</button>"
                        }
                },
                failure: function (res) {
                    alert('something went wrong');
                }
            }
        )
}
