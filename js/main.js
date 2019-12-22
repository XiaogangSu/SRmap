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

//获取当前的所有图层
function getlayer(){
    var layers = map.getStyle().layers;
    var layerid=[];
    for (var i = 0; i < layers.length; i++) {
        layerid.push(layers[i]['id']);
    }
    return(layerid);
}

//路径规划
function routenav(){
    var url = "http://121.199.14.136:8989/route?point=40.07150362225707,116.239492893219&point=40.10392189975916,116.30669832229616&type=json&locale=zh-CN&vehicle=car&weighting=fastest&points_encoded=false";
    var urlbackcor = urlback(url);
    // console.log(urlbackcor);
    // 判断是否存在某一图层，若存在则删除
    var layerids = getlayer();
    if (layerids.indexOf("route")>1){
        map.removeLayer('route');
        map.removeSource('route');
    }
    
    map.addLayer({
        'id': 'route',
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
            'line-color': '#888',
            'line-width': 8
        }
    });
}
