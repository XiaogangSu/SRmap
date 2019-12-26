mapboxgl.accessToken = 'pk.eyJ1IjoieGdhciIsImEiOiJjajh0dmpmenAwdGhqMndwMHo5ZDZua2E0In0.9CB46jBTn_gALav67l74yw';
function loadmap(){
    map = new mapboxgl.Map({
        container: 'map',
        style:'./style/mapbox/style.json',
        zoom: 15,
        center: [116.23954113946161, 40.07172270765838]
    });

    // map = new mapboxgl.Map({
    //     container: 'map',
    //     style: './style/osmstyle.json',
    //     center: [116.23954113946161, 40.07172270765838],
    //     zoom: 15,
    //     pitch: 0
    //   });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");  //放大缩小按钮
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));  //定位按钮
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

//定义起点点击函数
function startonclick(e){
    var nowcor = e.lngLat;
    $("#startpoint").val(nowcor.lat+','+nowcor.lng);
    var layerids = getlayer();
    // console.log(layerids);
    //检查起始点图层是否存在，若存在则删除
    for (var i=0; i<layerids.length; i++){
        if(layerids[i].search('startpoint') != -1){
            map.removeLayer(layerids[i]);
            map.removeSource(layerids[i]);
        }  
    }
    var startjson = {
        'type': 'FeatureCollection',
        'features':[{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [nowcor.lng, nowcor.lat]
            },
            'properties': {
                'title': 'start',
                'description': '起始点',
                'icon': 'monument'
            }
        }]
    }
    map.addSource('startpoint',{
        'type': "geojson",
        'data': startjson
    });
    map.addLayer({
        'id': "startpoint",
        'type': 'symbol',
        'source': 'startpoint',
        'layout': {
            'icon-image': ['concat', ['get', 'icon'], '-15'],
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 0.6],
            'text-anchor': 'top'
        }
    })
    // map.removeLayer("startmarker")
    // var startmarker = new mapboxgl.Marker({
    //     draggable: true
    //   })
    //     .setLngLat([nowcor.lng, nowcor.lat])
    //     .addTo(map);
    return(nowcor);
}
//定义终点点击函数
function endonclick(e){
    var nowcor = e.lngLat;
    $("#endpoint").val(nowcor.lat+','+nowcor.lng);
    var layerids = getlayer();
    // console.log(layerids);
    //检查起始点图层是否存在，若存在则删除
    for (var i=0; i<layerids.length; i++){
        if(layerids[i].search('endpoint') != -1){
            map.removeLayer(layerids[i]);
            map.removeSource(layerids[i]);
        }  
    }
    var endjson = {
        'type': 'FeatureCollection',
        'features':[{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [nowcor.lng, nowcor.lat]
            },
            'properties': {
                'title': 'end',
                'description': '终点',
                'icon': 'harbor'
            }
        }]
    }
    map.addSource('endpoint',{
        'type': "geojson",
        'data': endjson
    });
    map.addLayer({
        'id': "endpoint",
        'type': 'symbol',
        'source': 'endpoint',
        'layout': {
            'icon-image': ['concat', ['get', 'icon'], '-15'],
            'text-field': ['get', 'title'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 0.6],
            'text-anchor': 'top'
        }
    })
    return(nowcor);
}
//获取起点坐标
function getstartpoint(){
    console.log('获取起点坐标！');
    map.off('click', endonclick);
    map.on('click', startonclick);
}
//获取终点坐标
function getendpoint(){
    console.log('获取终点坐标！');
    map.off('click', startonclick);
    map.on('click', endonclick);
}

//路径规划
function routenav(){
    var url1 = "http://121.199.14.136:8989/route?point="
    var url2 = "&type=json&locale=zh-CN&vehicle=car&weighting=fastest&points_encoded=false";
    var startcor = $("#startpoint").val();
    var endcor = $("#endpoint").val();
    var url = url1+startcor+"&point="+endcor+url2;
    var urlbackcor = urlback(url);
    var userid='sxg_';
    var nowtime = getnowtime();
    var sub = 'route';
    // console.log(urlbackcor);
    // 判断是否存在某一图层，若存在则删除
    var layerids = getlayer();
    // console.log(layerids);
    for (var i=0; i<layerids.length; i++){
        if(layerids[i].search(userid+sub) != -1){
            map.removeLayer(layerids[i]);
            map.removeSource(layerids[i]);
        }  
    }
    
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
