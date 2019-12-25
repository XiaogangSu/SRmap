// mapboxgl.accessToken = 'pk.eyJ1IjoieGdhciIsImEiOiJjajh0dmpmenAwdGhqMndwMHo5ZDZua2E0In0.9CB46jBTn_gALav67l74yw';
function loadmap(){
    // var map = new mapboxgl.Map({
    //     container: 'map',
    //     style:'./css/paintline2_Basic2/style_main.json',
    //     zoom: 15,
    //     center: [116.23954113946161, 40.07172270765838]
    // });

    map = new mapboxgl.Map({
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

//获取当前的所有图层
function getlayer(){
    var layers = map.getStyle().layers;
    var layerid=[];
    for (var i = 0; i < layers.length; i++) {
        layerid.push(layers[i]['id']);
    }
    return(layerid);
}
//获取当前时间
function getnowtime(){
    var odate=new Date();
    var year=odate.getFullYear();  //获取年
    var month=odate.getMonth()+1;  //获取月
    var date=odate.getDate();  //获取日
    var day=odate.getDay();  //获取星期
    var hours=odate.getHours();   //获取时钟
    var minutes=odate.getMinutes();   //获取分钟
    var seconds=odate.getSeconds();  //获取秒
    var nowtime = year.toString()+month.toString()+date.toString()+hours.toString()+minutes.toString()+seconds.toString()
    return(nowtime)
}

var start = 0;
var end = 0;
function lnglatback(){
    var cor='';
    map.on('click', function (e) {
        console.log('获取点击位置坐标！');
        cor = e.lngLat;
        console.log(cor);
    });
    return(cor);
}
//获取起点坐标
function getstartpoint(){
    console.log('获取起点坐标！');
    // var nowcor = '';
    map.on('click', function (e) {
        var nowcor = e.lngLat;
        $("#startpoint").val(nowcor.lat+','+nowcor.lng);
    });
    // var nowcor = lnglatback();
    // console.log(nowcor);
    // $("#startpoint").val(nowcor.lat+','+nowcor.lng);
}
//获取终点坐标
function getendpoint(){
    map.off('click', function (e) {});
    console.log('获取终点坐标！');
    // var nowcor = '';
    map.on('click', function (e) {
        var nowcor = e.lngLat;
        $("#endpoint").val(nowcor.lat+','+nowcor.lng);
    });
    // var nowcor = lnglatback();
    // $("#startpoint").val(nowcor.lat+','+nowcor.lng);
}

//路径规划
function routenav(){
    var url1 = "http://121.199.14.136:8989/route?point="
    var url2 = "&type=json&locale=zh-CN&vehicle=car&weighting=fastest&points_encoded=false";
    var startcor = $("#startpoint").val();
    var endcor = $("#endpoint").val();
    var url = url1+startcor+"&point="+endcor+url2;
    // var url = "http://121.199.14.136:8989/route?point=40.07150362225707,116.239492893219&point=40.10392189975916,116.30669832229616&type=json&locale=zh-CN&vehicle=car&weighting=fastest&points_encoded=false";
    var urlbackcor = urlback(url);
    // console.log(urlbackcor);
    // 判断是否存在某一图层，若存在则删除
    var layerids = getlayer();
    console.log(layerids);
    if (layerids.length>1){
        for (var i=1; i<layerids.length; i++){
            map.removeLayer(layerids[i]);
            map.removeSource(layerids[i]);
        }
    }
    // if (layerids.indexOf("route")>1){
    //     map.removeLayer('route');
    //     map.removeSource('route');
    // }
    var userid='sxg_';
    var nowtime = getnowtime();
    var sub = 'route';
    var routelayerid = userid+sub+nowtime
    map.addLayer({
        'id': routelayerid,
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': urlbackcor
                }
            }
        },
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#0000FF',
            'line-width': 5
        }
    });
}
