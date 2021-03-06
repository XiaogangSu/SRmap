mapboxgl.accessToken = 'pk.eyJ1IjoieGdhciIsImEiOiJjajh0dmpmenAwdGhqMndwMHo5ZDZua2E0In0.9CB46jBTn_gALav67l74yw';
//判断设备类型为移动端还是PC端
function IsPC() {
    // var width=window.screen.width;
    // alert("当前设备宽为："+width)
    var userAgentInfo = navigator.userAgent;
    console.log("Agent:" + userAgentInfo);
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    var flag = "PC";
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = "mobile";
            break;
        }
    }
    if(flag=="mobile"){
        document.getElementById("csslink").href="./css/main_mobile.css"
    }
    else{
        document.getElementById("csslink").href="./css/main_pc.css"
    }
    // return(flag)
}
device_type = IsPC();
// 根据设备类型动态设置页面布局
// function setUI() {
//     console.log("devicetype:" + device_type)
//     if (device_type == "mobile") {
//         // alert("移动设备！")
//         var searchtext = document.getElementById("searchtext");
//         var searchbox = document.getElementById("searchbox");
//         var search = document.getElementById("search");
//         searchbox.style.setProperty("left", "5px");
//         searchbox.style.setProperty("top", "5px");
//         // searchtext.style.setProperty("width", "85%");
//         // search.style.setProperty("width", "15%");
//         var route = document.getElementById("route");
//         route.style.setProperty("left", "5px");
//         route.style.setProperty("top", "40px");
//     }
// }
// setUI();

function loadmap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: './style/mapbox/style_SRmap.json'
    });

    // map = new mapboxgl.Map({
    //     container: 'map',
    //     style: './style/osmstyle.json',
    //     center: [116.23954113946161, 40.07172270765838],
    //     zoom: 15,
    //     pitch: 0
    //   });
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");  //放大缩小按钮
    // map.addControl(new mapboxgl.GeolocateControl({
    //     positionOptions: {
    //         enableHighAccuracy: true
    //     },
    //     trackUserLocation: true
    // }));  //定位按钮
}
loadmap();

map.on('zoomend', function () {
    zoomlevel = map.getZoom().toFixed(1);
    document.getElementById('zoom-level').innerHTML = 'L:' + zoomlevel;
});

//获取url返回结果
function urlback(urlroute) {
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
            for (var i = 0; i < reqdata.length; i++) {
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
    return (urldata);
}

//获取当前的所有图层
function getlayer() {
    var layers = map.getStyle().layers;
    var layerid = [];
    for (var i = 0; i < layers.length; i++) {
        layerid.push(layers[i]['id']);
    }
    return (layerid);
}

//获取当前时间
function getnowtime() {
    var odate = new Date();
    var year = odate.getFullYear();  //获取年
    var month = odate.getMonth() + 1;  //获取月
    var date = odate.getDate();  //获取日
    var day = odate.getDay();  //获取星期
    var hours = odate.getHours();   //获取时钟
    var minutes = odate.getMinutes();   //获取分钟
    var seconds = odate.getSeconds();  //获取秒
    var nowtime = year.toString() + month.toString() + date.toString() + hours.toString() + minutes.toString() + seconds.toString()
    return (nowtime)
}

// 坐标偏移
//定义一些常量{{{
var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;
//坐标偏移
function out_of_china(lng, lat) {
    return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
}
function transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret
}
function transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret
}
function wgs84togcj02(lng, lat) {
    if (out_of_china(lng, lat)) {
        return [lng, lat]
    }
    else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        var mglat = lat + dlat;
        var mglng = lng + dlng;
        return [mglng, mglat]
    }
}
function gcj02towgs84(lng, lat) {
    if (out_of_china(lng, lat)) {
        return [lng, lat]
    }
    else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        mglat = lat + dlat;
        mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat]
    }
}
function bd09togcj02(bd_lon, bd_lat) {
    var bd_lon = +bd_lon;
    var bd_lat = +bd_lat;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return [gg_lng, gg_lat]
}//}}}

//定义起点点击函数
map.loadImage('./icon/begin2.png', function (error, image) {
    if (error) throw error;
    if (!map.hasImage('startimg')) map.addImage('startimg', image);
});
map.loadImage('./icon/end2.png', function (error, image) {
    if (error) throw error;
    if (!map.hasImage('endimg')) map.addImage('endimg', image);
});
map.loadImage('./icon/position.png', function (error, image) {
    if (error) throw error;
    if (!map.hasImage('positionimg')) map.addImage('positionimg', image);
});
map.loadImage('./icon/poi.png', function (error, image) {
    if (error) throw error;
    if (!map.hasImage('poiImg')) map.addImage('poiImg', image);
});

//用户登录
host = 'http://121.199.14.136:5001';
function loginSubmit() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    console.log(username + "  " + password);
    // url = host+"/auth/get_token"+'?username='+username+"&password="+password;
    var url = host + "/auth/get_token"
    console.log("url:" + url);
    $.ajax({
        type: "post",
        url: url,
        // contentType: "application/json;charset=uft-8",
        dataType: "json",
        data: {
            "username": username,
            "password": password
        },
        success: function success(retData) {
            console.log(retData);
            console.log(retData['msg']);
            if (retData.hasOwnProperty("token")) {
                console.log("Sign in success!");
                usertoken = retData["token"];
                console.log("token:", usertoken);
                document.getElementById("logGet").style.display = "none";
            }
            else {
                alert("Account number or password error, login failed");
            }
        },
        error: function error(httpRequest) {
            console.log("请求失败");
            return false;
        }
    });
}

function startonclick(e) {
    var nowcor = e.lngLat;
    $("#startpoint").val(nowcor.lat.toFixed(7) + ',' + nowcor.lng.toFixed(7));
    var layerids = getlayer();
    console.log(layerids);
    //检查起始点图层是否存在，若存在则删除
    for (var i = 0; i < layerids.length; i++) {
        if (layerids[i].search('startpoint') != -1) {
            map.removeLayer(layerids[i]);
            map.removeSource(layerids[i]);
        }
    }
    var startjson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [nowcor.lng, nowcor.lat]
            },
            'properties': {
                'title': 'start',
                'description': '起始点',
            }
        }]
    }
    map.addSource('startpoint', {
        'type': "geojson",
        'data': startjson
    });

    map.addLayer({
        'id': "startpoint",
        'type': 'symbol',
        'source': 'startpoint',
        'layout': {
            'icon-image': 'startimg',
            'icon-size': 0.2
        }
    })
    return (nowcor);
}
//定义终点点击函数
function endonclick(e) {
    var nowcor = e.lngLat;
    $("#endpoint").val(nowcor.lat.toFixed(7) + ',' + nowcor.lng.toFixed(7));
    var layerids = getlayer();
    // console.log(layerids);
    //检查起始点图层是否存在，若存在则删除
    for (var i = 0; i < layerids.length; i++) {
        if (layerids[i].search('endpoint') != -1) {
            map.removeLayer(layerids[i]);
            map.removeSource(layerids[i]);
        }
    }
    var endjson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [nowcor.lng, nowcor.lat]
            },
            'properties': {
                'title': 'end',
                'description': '终点',
            }
        }]
    }
    map.addSource('endpoint', {
        'type': "geojson",
        'data': endjson
    });
    // map.addLayer({
    //     'id': "endpoint",
    //     'type': 'symbol',
    //     'source': 'endpoint',
    //     'layout': {
    //         'icon-image': ['concat', ['get', 'icon'], '-15'],
    //         'text-field': ['get', 'title'],
    //         'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    //         'text-offset': [0, 0.6],
    //         'text-anchor': 'top'
    //     }
    // })

    // map.addImage('posiconid', posicon);
    map.addLayer({
        'id': "endpoint",
        'type': 'symbol',
        'source': 'endpoint',
        'layout': {
            'icon-image': 'endimg',
            'icon-size': 0.2
        }
    })
    return (nowcor);
}
//获取起点坐标
function getstartpoint() {
    console.log('获取起点坐标！');
    map.off('click', locpoi_click);
    map.off('click', endonclick);
    map.on('click', startonclick);
}
//获取终点坐标
function getendpoint() {
    console.log('获取终点坐标！');
    map.off('click', locpoi_click);
    map.off('click', startonclick);
    map.on('click', endonclick);
}

//获取当前位置..clear
function localpos() {
    var geolocation = new BMap.Geolocation();
    var lng = '';
    var lon = '';
    geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            alert('您的位置：' + r.point.lng + ',' + r.point.lat);
            lng = r.point.lng;
            lon = r.point.lat
        }
        else {
            alert('failed' + this.getStatus());
        }
    });
    return ([lon, lng]);
}

//百度api定位
function getposition_b() {
    //使用百度api定位
    var geolocation = new BMap.Geolocation({
        maximumAge: 10
    });
    geolocation.enableSDKLocation();
    geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            var layerids = getlayer();
            // console.log(layerids);
            //检查起始点图层是否存在，若存在则删除
            for (var i = 0; i < layerids.length; i++) {
                if (layerids[i].search('Bpospoint') != -1) {
                    map.removeLayer(layerids[i]);
                    map.removeSource(layerids[i]);
                }
            }
            console.log('百度定位坐标：' + r.point.lng + ',' + r.point.lat);
            var lon_bd09 = r.point.lng;
            var lat_bd09 = r.point.lat;
            var gc02_cor = bd09togcj02(lon_bd09, lat_bd09);
            var wgs84_cor = gcj02towgs84(gc02_cor[0], gc02_cor[1]);
            var lon = wgs84_cor[0];
            var lat = wgs84_cor[1];
            // var lon = lon_gc02;
            // var lat = lat_gc02;
            // console.log(typeof(wgs84_cor));
            // console.log('wgs84坐标：'+wgs84_cor)
            console.log("当前经度：" + lon);
            console.log("当前纬度：" + lat);
            map.flyTo({
                center: [lon, lat],
                zoom: 15
            });
            var posjson = {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [lon, lat]
                    }
                }]
            }

            map.addSource('Bpospoint', {
                'type': "geojson",
                'data': posjson
            });

            // map.addImage('posiconid', posicon);
            map.addLayer({
                'id': "Bpospoint",
                'type': 'symbol',
                'source': 'Bpospoint',
                'layout': {
                    'icon-image': 'positionimg',
                    'icon-size': 0.2
                }
            })
        }
        else {
            alert('failed' + this.getStatus());
        }
    });
}

//使用js原生定位
function getposition_j() {
    navigator.geolocation.getCurrentPosition(function (position) {
        var layerids = getlayer();
        // console.log(layerids);
        //检查起始点图层是否存在，若存在则删除
        for (var i = 0; i < layerids.length; i++) {
            if (layerids[i].search('Jpospoint') != -1) {
                map.removeLayer(layerids[i]);
                map.removeSource(layerids[i]);
            }
        }
        var lon = position.coords.longitude;
        var lat = position.coords.latitude
        console.log("当前经度：" + lon);
        console.log("当前纬度：" + lat);
        map.flyTo({
            center: [lon, lat],
            zoom: 15
        });
        var posjson = {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [lon, lat]
                }
            }]
        }
        map.addSource('Jpospoint', {
            'type': "geojson",
            'data': posjson
        });

        // map.addImage('posiconid', posicon);
        map.addLayer({
            'id': "Jpospoint",
            'type': 'symbol',
            'source': 'Jpospoint',
            'layout': {
                'icon-image': 'positionimg',
                'icon-size': 0.2
            }
        })

    }, function (error) {
        // alert(error.code);
        alert(error.message);
    }, {
        enableHighAcuracy: false,
        timeout: 20000,
        maximumAge: 20000
    });
}

//腾讯api定位
function getposition_t() {
    //使用百度api定位
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            console.log('您的位置：' + r.point.lng + ',' + r.point.lat);
            var lon_gc02 = r.point.lng;
            var lat_gc02 = r.point.lat
            var wgs84_cor = gcj02towgs84(lon_gc02, lat_gc02);
            var lon = wgs84_cor[0];
            var lat = wgs84_cor[1];
            console.log(typeof (wgs84_cor));
            console.log('wgs84坐标：' + wgs84_cor)
            console.log("当前经度：" + lon);
            console.log("当前纬度：" + lat);
            map.flyTo({
                center: [lon, lat],
                zoom: 15
            });
            var posjson = {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [lon, lat]
                    }
                }]
            }

            map.addSource('pospoint', {
                'type': "geojson",
                'data': posjson
            });
            map.loadImage('./icon/begin.png', function (error, image) {
                if (error) throw error;
                if (!map.hasImage('posicon')) map.addImage('posicon', image);
            });
            // map.addImage('posiconid', posicon);
            map.addLayer({
                'id': "poslayer",
                'type': 'symbol',
                'source': 'pospoint',
                'layout': {
                    'icon-image': 'posicon'
                }
            })
        }
        else {
            alert('failed' + this.getStatus());
        }
    });
}

//路径规划
function routenav() {
    map.off('click', startonclick);
    map.off('click', endonclick);
    var url1 = "http://121.199.14.136:8989/route?point="
    var url2 = "&type=json&locale=zh-CN&vehicle=car&weighting=fastest&points_encoded=false";
    var startcor = $("#startpoint").val();
    var endcor = $("#endpoint").val();
    var url = url1 + startcor + "&point=" + endcor + url2;
    var urlbackcor = urlback(url);
    var userid = 'sxg_';
    var nowtime = getnowtime();
    var sub = 'route';
    // console.log(urlbackcor);
    // 判断是否存在某一图层，若存在则删除
    var layerids = getlayer();
    // console.log(layerids);
    for (var i = 0; i < layerids.length; i++) {
        if (layerids[i].search(userid + sub) != -1) {
            map.removeLayer(layerids[i]);
            map.removeSource(layerids[i]);
        }
    }

    var routelayerid = userid + sub + nowtime
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
            'line-color': 'rgba(255, 106, 106, 0.6)',
            'line-width': 5
        }
    });
}

//添加poi
function add_poi() {
    document.getElementById("poi").style.display = "block";
    // let video = document.getElementById("video");
    // let constraints = {
    //     video: {width: 500, height: 500},
    //     audio: true
    // };
    // let promise = navigator.mediaDevices.getUserMedia(constraints);
    // promise.then(function (MediaStream) {
    //     video.srcObject = MediaStream;
    //     video.play();
    // }).catch(function (PermissionDeniedError) {
    //     console.log(PermissionDeniedError);
    // })
}
//拍照
$('#take_photo').change(function () {
    let fileObj = this.files[0];
    let fileReader = new FileReader();
    fileReader.readAsDataURL(fileObj);
    fileReader.onload = function () {
        $('#id_img1').attr('src', fileReader.result)
    }
    document.getElementById('id_img1').style.display = 'inline';
});

//选择poi点位
function locpoi_click(e) {
    var nowcor = e.lngLat;
    $("#poiloc").val(nowcor.lat.toFixed(7) + ',' + nowcor.lng.toFixed(7));
    var layerids = getlayer();
    console.log(layerids);
    //检查poi点图层是否存在，若存在则删除
    for (var i = 0; i < layerids.length; i++) {
        if (layerids[i].search('poipoint') != -1) {
            map.removeLayer(layerids[i]);
            map.removeSource(layerids[i]);
        }
    }
    var poijson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [nowcor.lng, nowcor.lat]
            },
            'properties': {
                'title': 'poi',
                'description': 'poi点',
            }
        }]
    }
    // source,layer用一个id名称，以便移除方便
    map.addSource('poipoint', {
        'type': "geojson",
        'data': poijson
    });
    map.addLayer({
        'id': "poipoint",
        'type': 'symbol',
        'source': 'poipoint',
        'layout': {
            'icon-image': 'poiImg',
            'icon-size': 0.2
        }
    })
    document.getElementById("poi").style.display = "block"
    return (nowcor);
}

function locpoi() {
    document.getElementById("poi").style.display = "none";
    console.log('获取poi点坐标！');
    map.off('click', endonclick);
    map.off('click', startonclick);
    map.on('click', locpoi_click);
}

//提交poi信息
function subpoi() {
    console.log('sub poi info!');
    console.log("token:", usertoken);
    var photo = $("#take_photo").val();
    console.log('photo='+photo);
    var name = $("#poiname").val();
    var type = $("#poitype").val();
    var address = $("#poiaddress").val();
    var phone = $("#poiphone").val();
    var loc = $("#poiloc").val();   //string
    var cor = new Array();
    cor[0] = parseFloat(loc.split(",")[1]);
    cor[1] = parseFloat(loc.split(",")[0]);
    var poigj = {"type":"Point","coordinates":cor}
    if (photo==''||name==''||type==''||loc=='') {
        alert("Missing poi information!")
    }
    else {
        var formData = new FormData();
        var file = $("#take_photo")[0].files[0];
        formData.append("file", file);
        var url_pic = host + "/dao/upload";
        var md5list = new Array();
        //上传照片
        $.ajax({
            type: "post",
            headers: {
                "token": usertoken,
            },
            async: false,
            url: url_pic,
            processData: false,
            contentType: false,
            data: formData,
            beforeSend: function () {
                console.log("正在进行，请稍候");
            },
            success: function success(retData) {
                var redData_ob = JSON.parse(retData);
                console.log(redData_ob['msg']);
                console.log(redData_ob['md5']);
                if (redData_ob.hasOwnProperty("md5")) {
                    var picmd5 = redData_ob["md5"];
                    console.log("picmd5:", picmd5);
                    md5list.push(picmd5);
                    console.log('图片上传成功！')
                }
                else {
                    alert("picture upload failed!");
                }
            },
            error: function error(httpRequest) {
                console.log("请求失败");
                return false;
            }
        });
        //上传feature信息
        console.log('照片md5序列：');
        console.log(md5list);
        var fea = {};
        fea.title = "First poi";
        fea.layer = "layerid";
        fea.gj = poigj;
        var attri = {"name":name,"type":type,"address":address,"phone":phone,"md5_list":md5list};
        fea.attrs = attri;
        var fea_str = JSON.stringify(fea);
        // var fea_byte = str2UTF8(fea_str);
        // console.log(fea_byte);
        var url_fea = host + '/dao/add_feature';
        $.ajax({
            type: "post",
            headers: {
                "token": usertoken,
            },
            async: false,
            url: url_fea,
            processData: false,
            contentType: false,
            data: fea_str,
            // dataType: "json",
            beforeSend: function () {
                console.log("POI信息正在上传中...");
            },
            success: function success(retData) {
                console.log(retData);
                alert("Add POI success!")
            },
            error: function error(httpRequest) {
                console.log("POI添加失败");
                return false;
            }
        });
    }

}

//关闭POI采集窗口
function closepoi() {
    document.getElementById("poi").style.display = "none"
}

