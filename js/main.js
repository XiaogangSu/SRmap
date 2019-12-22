// mapboxgl.accessToken = 'pk.eyJ1IjoieGdhciIsImEiOiJjajh0dmpmenAwdGhqMndwMHo5ZDZua2E0In0.9CB46jBTn_gALav67l74yw';
function loadmap(){
    // var map = new mapboxgl.Map({
    //     container: 'map',
    //     style:'./css/paintline2_Basic2/style_main.json',
    //     zoom: 15,
    //     center: [116.23954113946161, 40.07172270765838]
    // });

    var map = new mapboxgl.Map({
        container: 'map',
        style: './style/osmstyle.json',
        center: [116.23954113946161, 40.07172270765838],
        zoom: 15,
        pitch: 0
      });
}
loadmap();

//获取url返回结果
function urlback(urlroute){
    var urldata;
    $.ajaxSettings.async = false;  
    $.ajax({
        url: urlroute,
        contentType: "application/json;charset=uft-8", 
        dataType: "json", 
        success: function success(retData) {
            var reqdata = retData['paths'][0]["points"]["coordinates"];
            // console.log("reqdata first:",reqdata[0][0],reqdata[0][1]); 
            // console.log("reqdata:", reqdata);
            var polylinecor = [];
            //var dynamicpointcor = []
            for (var i=0;i<reqdata.length; i++){
                // console.log("reqdata[i][1]:",reqdata[i][1],"reqdata[i][0]:",reqdata[i][0]);
                // var tempcor = wgs84togcj02(reqdata[i][0],reqdata[i][1]);  //坐标加密
                // polylinecor.push(tempcor[0]);
                // polylinecor.push(tempcor[1]);
                polylinecor.push(reqdata[i])
            }
            urldata = polylinecor;
        }, 
        error: function error(httpRequest) { 
            console.log("请求失败"); 
            return false; 
        } 
    });
    return(urldata);
}

//路径规划
function routenav(){
    var url = "http://121.199.14.136:8989/route?point=31.7809361,117.1863596&point=31.7732777,117.2451694&type=json&locale=zh-CN&vehicle=car&weighting=fastest&points_encoded=false";
    var urlbacklog = urlback(url);
    console.log('test!!');
    console.log(urlbacklog);
}
