//html 부분에 있는 id를 선언
var elt = document.getElementById("myLocationlnfo");
var watch = document.getElementById("watch");
var real = document.getElementById("play_real_time");
var long = document.getElementById("play_long_time");
var dream = document.getElementById("play_dream_time");
var dreamreal = document.getElementById("play_dream_real_time");
var month_move = document.getElementById("play_Month_time");

//초기 설정
var times = 1;
var dream_move = 1;
var meterial;
var dreamreals = 0;

//하루동안 움직이는 부분에서 24시간 동안 카운터를 위해 존재
var todays = 0;
var count = 0;

//위도, 경도 선언
var Latitude, Longitude;

//현재 시간 가져오기
var today = new Date();

//현재 시간을 년, 월, 일, 시, 분, 초로 나누었다.
var Year = today.getFullYear(), Month = today.getMonth(), Day = today.getDate();
var Hours = today.getHours(), Minutes = today.getMinutes(), Seconds = today.getSeconds();

//예상 경로를 찾을때 날짜나 월이 바뀔경우 초기화를 시켜줘야해서 확인용이다.
var checkDay = 0, checkMonth = 12;

//예상경로를 전체로 묶기 위해
var group = new THREE.Group();

//현재 년, 월, 일을 기억해서 날짜를 이동하고 다시 돌아올때를 위해 존재
var saveYear, saveMonth, saveDay;

//태양의 위치를 구하기위해 필요한 함수
var jd, n, gmst, OM, mean_Lon, g, Lon, ep, Lat, Dec, lmst, HRA, HRA_ra, Ele_ra, pa, Deg_ra;
//태양의 위치와 동일하게 위치를 구하기 위해서이지만 이건 예상 경로를 구하기 위한것이다.
var movejd, moven, movegmst, moveOM, movemean_Lon, moveg, moveLon, moveep, moveLat, moveDec, movelmst, moveHRA, moveHRA_ra, moveEle_ra, movepa, moveDeg_ra;

//태양 위치를 x, y축으로 표현
var x, y;
//예상 경로용 x, y축
var movex, movey;

//고도, 방위각
var Ele, Deg;

//날짜를 바꾸기 위해 있는 함수
var moveDay;

//하루동안 태양위치를 보고 다른 것으로 넘어갈때 그 시간을 기록하기위해서 존재
var long_t = 0, long_time = 0;

//최대 가로 세로 설정
var WIDTH = window.innerWidth - 10, HEIGHT = window.innerHeight - 80;

//준비 세팅이 끝났는지 확인하는 용도
var start = 0;

//3D 화면을 보여주기 위해하는 초기 설정
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(25, WIDTH / HEIGHT, 1, 2000);
var renderer = new THREE.WebGLRenderer({antialias: true});
scene.add(group);

//처음에 리셋하는 부분
function init(){
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(0xdddddd, 1);

	camera.position.y = 17;
	camera.position.z = 145;

    // 각각 보여줄 것을 실행시켜서 보이게 만듬
	var u = Under();
	var s = Sun();
	var p = Panels();
	var c = Cylinder();

    //렌더링하는 부분
	document.body.appendChild(renderer.domElement);
	renderer.render(scene, camera);

	//화면이 바뀌었다면 실행되는 곳이다. (예를 들어 모니터 크기가 바뀌어서 크기가 늘어나거나 전체화면에서 줄이거나(또는 그 반대 상황도))
	window.addEventListener('resize', handleWindowResize, false);
}

//크기 변경시 실행되는 곳
function handleWindowResize(){
	WIDTH = window.innerWidth - 10;
	HEIGHT = window.innerHeight - 80;

	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	renderer.render(scene, camera);
	camera.updateProjectionMatrix();
}

//현재 위치를 잡아 주고 표시하는 부분
function Location(elt){
	var options = {
		enableHighAccuracy: false,
		maximumAge: 5,
		timeout: 15000
	}

	if(navigator.geolocation)
        navigator.geolocation.watchPosition(success, error, options);
    else
        elt.innerHTML = "이 브라우저에서는 지원하지않습니다.";
    function error(e){
        elt.innerHTML = "오류" + e.code + ":" + e.message;
    }
    
    function success(pos){
    	Latitude = pos.coords.latitude;
    	Longitude = pos.coords.longitude;
        var msg = "위도: " + Latitude + " 경도: " + Longitude;
        elt.innerHTML = msg;
    }

    var  msg = "위도: " + Latitude + "경도: " + Longitude;
    elt.innerHTML = msg;
    start++;
}

//현재 시간을 잡아 주는 부분 및 시간을 가속화 하는 부분
function now(watch){
	var Start = setInterval(function(){
        if(dream_move == 0){
        	Year = moveDay.getFullYear();
        	Month = moveDay.getMonth();
        	Day = moveDay.getDate();
        }else{
        	if (times == 1) {
        		Seconds += 6;

        		if (Seconds >= 60) {
        			Minutes++;
        			Seconds = 0;
        		}

        		if (Minutes == 60) {
        			Hours++;
        			Minutes = 0;
        		}
        		if (Hours == 24) {
        			Day++;
        			Hours = 0;
        		}
        	}else{
                count++
                if(count == 60){
                    Hours++;
                    count = 0;
                }

                if (Hours == 24) {
                	Hours = 0;
                }
            }
        }

        //혹시 날짜가 변경될때 한달이 지나면 달이 바뀌어야하는데 달마다 날이 다르므로 date를 써서 자동으로 바뀌게 바꿈
        moveDay = new Date(Year, Month, Day, Hours, Minutes, Seconds);

        //HTML에 표시되게 바뀐다.
        watch.innerHTML = moveDay.getFullYear() + "년 " + (moveDay.getMonth() + 1) + "월 " + moveDay.getDate() + "일 " + moveDay.getHours() + " : " + moveDay.getMinutes() + " : " + moveDay.getSeconds();

	}, 0.000000000000001);
}

//바닥을 만드는 부분
function Under() {

    var underimage = new THREE.TextureLoader().load('image/grass.jpg');
    underimage.wrapS = underimage.wrapT = THREE.RepeatWrapping;
    underimage.repeat.set(0.5, 1);
    underimage.anisotropy = 16;
	//바닥 생성
	var planeGeometry = new THREE.PlaneGeometry(35, 70, 1, 1);
	var planeMaterial = new THREE.MeshBasicMaterial({map: underimage});
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);

	//바닥을 어느 위치에 둘지 정하는 부분
	plane.rotation.x = -0.5 * Math.PI;
	plane.position.y = 5;
	plane.position.z = 50;

    plane.receiveShadow = true;

	//바닥 생성
	scene.add(plane);
}

//태양을 만드는 부분
function Sun() {
	//사진을 넣기 위해 미리 로드
	var sunimage = new THREE.TextureLoader().load('image/sun.jpg');
    //sunimage.crossOrigin = '';
    //sunimage.load('image/sun.jpg');
	//태양을 만들기 위해 구를 생성
	var sphereGeometry = new THREE.SphereGeometry(3, 50, 50);
	var sphereMaterial = new THREE.MeshLambertMaterial({map: sunimage});
    //var sphereMaterial = new THREE.MeshPhongMaterial();
    //var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xff7f00});

	var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    sphere.position.z = 60;

    var light = new THREE.DirectionalLight( 0xffffff );

	//태양 생성
    scene.add(light);
    scene.add(sphere);

	var renderScene = new function renderScene(){
		requestAnimationFrame(renderScene);

		//태양 위치 구하는 공식
		jd = (1461.0 * (Year + 4800 + ((Month + 1) - 14) / 12)) / 4 + (367 * ((Month + 1) - 2 - 12 * (((Month + 1) - 14) / 12))) / 12 - (3 * ((Year + 4900 + ((Month + 1) - 14) / 12) / 100)) / 4 + Day - 32075 - 0.5 + (Hours + Minutes / 60) / 24.0;
        n = jd - 2451545.0;
        gmst = 6.6974243242 + 0.0657098283 * n + (Hours + Minutes / 60);

        OM = 2.1429 - 0.0010394594 * n;
        mean_Lon = 4.8950630 + 0.017202791698 * n;
        g = 6.2400600 + 0.0172019699 * n;
        Lon = mean_Lon + 0.03341607 * Math.sin(g) + 0.00034894 * Math.sin(2 * g) - 0.0001134 - 0.0000203 * Math.sin(OM);
        ep = 0.4090928-6.2140*0.000000001*n+0.0000396*Math.cos(OM);
	    Lat = Math.atan(Math.cos(ep)*Math.sin(Lon)/Math.cos(Lon));
 		if(Math.cos(Lon) < 0 ) Lat = Lat + Math.PI;
 		else if (Math.cos(Lon) >=0 & Math.cos(ep)*Math.sin(Lon) <0) Lat = Lat + 2* Math.PI;
        Dec = (Math.asin(Math.sin(ep)*Math.sin(Lon)));
        lmst = (gmst * 15 + (Longitude * Math.PI / 180)) * (Math.PI / 180);
        HRA = (lmst - Lat);
        HRA_ra=HRA*Math.PI/180;
        Ele_ra = Math.asin(Math.cos(Latitude * Math.PI / 180)*Math.cos(Dec)*Math.cos(HRA)+Math.sin(Latitude * Math.PI / 180)*Math.sin(Dec));
        pa = 6371.0/149597890.0 * Math.sin(Ele_ra);
        Ele = Ele_ra * 180/Math.PI + pa;
        Deg_ra = Math.asin(-Math.cos(Dec)*Math.sin(HRA)/Math.cos(Ele_ra));
 		if(Math.sin(Dec) - Math.sin(Ele_ra) *Math.sin(Latitude * Math.PI / 180) >= 0 & Math.sin(Deg_ra) <0) Deg_ra =Deg_ra + 2*Math.PI;
 		else if( Math.sin(Dec) - Math.sin(Ele_ra) * Math.sin(Latitude * Math.PI / 180) < 0) Deg_ra = Math.PI - Deg_ra;
 		Deg = Deg_ra *180/Math.PI;

        //오늘 만들거
        switch(Month){
            case 5:
                x = Deg.map(59.3, 301, -40.5, 40.5);
                y = Ele.map(0, 76, 0, 32.7);
                break;

            case 6:
            case 4:
                x = Deg.map(59.6, 300.4, -40.5, 40.5);
                y = Ele.map(0, 72.7, 0, 31.2);
                break;

            case 7:
            case 3:
                x = Deg.map(66.3, 294, -40.5, 40.5);
                y = Ele.map(0, 64, 0, 29.7);
                break;

            case 8:
            case 2:
                x = Deg.map(79, 281, -40.5, 40.5);
                y = Ele.map(0, 52.6, 0, 28.2);
                break;

            case 9:
            case 1:
                x = Deg.map(93, 267, -40.5, 40.5);
                y = Ele.map(0, 41, 0, 26.7);
                break;

            case 10:
            case 0:
                x = Deg.map(107.4, 252.4, -40.5, 40.5);
                y = Ele.map(0, 32.2, 0, 25.2);
                break;

            case 11:
                x = Deg.map(117, 243, -40.5, 40.5);
                y = Ele.map(0, 29.2, 0, 23.7);
                break;
        }

         light.position.x = -x;
         light.position.y = y;
         light.position.z = 60;

 		//위치를 X축 Y축을 변환
        //x = ((Deg - 59.3) * (47 + 47) / (301 - 59.3) - 47); // 59.3도에서 301도까지
        //y = ((Ele - 0) * (41.7 - 0) / (76 - 0) + 0); // 3 ~ 31.5 

        //var sep = SunExpectedPath();

       	//태양 위치를 변화
        sphere.position.x = -x; //-X인 이유는 왼쪽에서 오른쪽 기준인데 현실은 오른쪽에서 왼쪽으로 움직이기 때문에 -를 붙임
        sphere.position.y =  y;

        //console.log(Ele);

        if (Day != checkDay || Month != checkMonth) {
            scene.remove(group);
            group = new THREE.Group();
            scene.add(group);
            var sep = SunExpectedPath();
            checkDay = Day;
            checkMonth = Month;
        }
	};
}

//태양 예상 경로 만드는 부분
function SunExpectedPath(){
    var ExpectedPathGeometry = new THREE.SphereGeometry(0.1, 50, 50);
    var ExpectedPathMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

	//하루동안의 경로를 전부 표시를 해야하기때문에 24시간 전부 for문으로 돌린다.    
    for(var h = 0; h < 24; h++){
        for(var m = 0; m < 60; m++){

        var ExpectedPath = new THREE.Mesh(ExpectedPathGeometry, ExpectedPathMaterial);

        movejd = (1461.0 * (Year + 4800 + ((Month + 1) - 14) / 12)) / 4 + (367 * ((Month + 1) - 2 - 12 * (((Month + 1) - 14) / 12))) / 12 - (3 * ((Year + 4900 + ((Month + 1) - 14) / 12) / 100)) / 4 + Day - 32075 - 0.5 + (h + m / 60) / 24.0;
        moven = movejd - 2451545.0;
        movegmst = 6.6974243242 + 0.0657098283 * moven + (h + m / 60);

        moveOM = 2.1429 - 0.0010394594 * moven;
        movemean_Lon = 4.8950630 + 0.017202791698 * moven;
        moveg = 6.2400600 + 0.0172019699 * moven;
        moveLon = movemean_Lon + 0.03341607 * Math.sin(moveg) + 0.00034894 * Math.sin(2 * moveg) - 0.0001134 - 0.0000203 * Math.sin(moveOM);
        moveep = 0.4090928-6.2140*0.000000001*moven+0.0000396*Math.cos(moveOM);
        moveLat = Math.atan(Math.cos(moveep)*Math.sin(moveLon)/Math.cos(moveLon));
        if(Math.cos(moveLon) < 0 ) moveLat = moveLat + Math.PI;
        else if (Math.cos(moveLon) >=0 & Math.cos(moveep)*Math.sin(moveLon) <0) moveLat = moveLat + 2* Math.PI;
        moveDec = (Math.asin(Math.sin(moveep)*Math.sin(moveLon)));
        movelmst = (movegmst * 15 + (Longitude * Math.PI / 180)) * (Math.PI / 180);
        moveHRA = (movelmst - moveLat);
        moveHRA_ra=moveHRA*Math.PI/180;
        moveEle_ra = Math.asin(Math.cos(Latitude * Math.PI / 180)*Math.cos(moveDec)*Math.cos(moveHRA)+Math.sin(Latitude * Math.PI / 180)*Math.sin(moveDec));
        movepa = 6371.0/149597890.0 * Math.sin(moveEle_ra);
        moveEle = moveEle_ra * 180/Math.PI + movepa;
        moveDeg_ra = Math.asin(-Math.cos(moveDec)*Math.sin(moveHRA)/Math.cos(moveEle_ra));
        if(Math.sin(moveDec) - Math.sin(moveEle_ra) *Math.sin(Latitude * Math.PI / 180) >= 0 & Math.sin(moveDeg_ra) <0) moveDeg_ra =moveDeg_ra + 2*Math.PI;
        else if( Math.sin(moveDec) - Math.sin(moveEle_ra) * Math.sin(Latitude * Math.PI / 180) < 0) moveDeg_ra = Math.PI - moveDeg_ra;
        moveDeg = moveDeg_ra *180/Math.PI;

        switch(Month){
            case 5:
                movex = moveDeg.map(59.3, 301, -40.5, 40.5);
                movey = moveEle.map(0, 76, 0, 32.7);
                break;

            case 6:
            case 4:
                movex = moveDeg.map(59.6, 300.4, -40.5, 40.5);
                movey = moveEle.map(0, 72.7, 0, 31.2);
                break;

            case 7:
            case 3:
                movex = moveDeg.map(66.3, 294, -40.5, 40.5);
                movey = moveEle.map(0, 64, 0, 29.7);
                break;

            case 8:
            case 2:
                movex = moveDeg.map(79, 281, -40.5, 40.5);
                movey = moveEle.map(0, 52.6, 0, 28.2);
                break;

            case 9:
            case 1:
                movex = moveDeg.map(93, 267, -40.5, 40.5);
                movey = moveEle.map(0, 41, 0, 26.7);
                break;

            case 10:
            case 0:
                movex = moveDeg.map(107.4, 252.4, -40.5, 40.5);
                movey = moveEle.map(0, 32.2, 0, 25.2);
                break;

            case 11:
                movex = moveDeg.map(117, 243, -40.5, 40.5);
                movey = moveEle.map(0, 29.2, 0, 23.7);
                break;
        }

        ExpectedPath.position.x = -movex; //-X인 이유는 왼쪽에서 오른쪽 기준인데 현실은 오른쪽에서 왼쪽으로 움직이기 때문에 -를 붙임
        ExpectedPath.position.y = movey;
        ExpectedPath.position.z = 60;

        group.add(ExpectedPath);

        //점의 간격을 넓히기 위해 +5씩 더한다.
        m += 5;

        }
    }
}

//태양광 패널을 만드는 부분
function Panels(){
	var panelimage = new THREE.TextureLoader().load('image/solar-panel.jpg');
	var panelsGeometry = new THREE.BoxGeometry(8, 0.7, 10);

	for(var i = 0; i < panelsGeometry.faces.length; i++){
        //컬러설정 0x171944(진한 어두은 파랑색)
		if (i != 6 && i != 7) panelsGeometry.faces[i].color.setHex(0x171944);
	}

    //패널 만드는부분
	var panelsMaterial = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors, map: panelimage});

	var panel = new THREE.Mesh(panelsGeometry, panelsMaterial);

    //패널의 좌표설정
	panel.position.y = 11;
	panel.position.z = 60;
	panel.rotation.z = (-0.5 * Math.PI) * 2;
    panel.rotation.x = Math.PI / 9;

	scene.add(panel);

	if (Deg < Math.PI * 0.75) panel.rotation.z = -(Math.PI * 1.25);

	if (Deg > Math.PI * 1.25) panel.rotation.z = -(Math.PI * 0.75);

    //console.log(-(Math.PI * 0.75));
	var panels = new function panles(){
		requestAnimationFrame(panles);

		var panelMove = ((Deg - 0) * (0 - (Math.PI * 2)) / (360 - 0) + (Math.PI * 2));

		if(panelMove >= (Math.PI * 0.75) && panelMove <= (Math.PI * 1.25)) panel.rotation.z = -panelMove; 
		if (Ele < 0 && panel.rotation.z > -(Math.PI * 1.25)) panel.rotation.z -= (Math.PI / 1440);

        renderer.render(scene, camera);
	}
}

//태양광 패널 아래에 들어갈 부분
function Cylinder(){
	var cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4);
	var cylinderMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

    var MainSpaceGeometry = new THREE.CylinderGeometry(2, 2, 3);
    var MainSpaceMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

    var boxGeometry = new THREE.BoxGeometry(5, 5, 5);
    var boxMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

	var cylin = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    var MainSpace = new THREE.Mesh(MainSpaceGeometry, MainSpaceMaterial);
    var box = new THREE.Mesh(boxGeometry, boxMaterial);

	cylin.position.y = 9;
	cylin.position.z = 60;

    MainSpace.position.y = 7;
    MainSpace.position.z = 60;

    box.position.y = 5;
    box.position.z = 60;

	scene.add(cylin);
    scene.add(MainSpace);
    scene.add(box);

    renderer.render(scene, camera);
}

//특정 부분을 다른 특정 부분으로 변환하는 부분
Number.prototype.map = function(in_min, in_max, out_min, out_max){
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

//동작시 바로 실행이 되는 부분
window.onload = function(){
	var l = Location(elt);
	var n = now(watch);
    //시간과 위도 경도를 받아들이는데 시간이 조금 소요되기에 약간의 딜레이를 부여
    setTimeout(function(){
        var i = init();
    }, 2);
}

//버튼을 눌렀을 때 동작하는 부분
long.onclick = function(){

    if(dream_move == 0){
    Year = saveYear;
    Month = saveMonth;
    Day = saveDay;
    }

	times = 0;
    dream_move = 1;

    newHours = Hours;
    newMinutes = Minutes;
    newSeconds = Seconds;

    if(long_t == 0){
        Hours = long_time;
        long_t = 1;
    }
    Minutes = 0;
    Seconds = 0;
}
real.onclick = function(){

    if(long_t == 1){
        long_time = Hours;
        long_t = 0;
    }

    if (times == 0 || dream_move == 0 || dreamreals == 1) {
        if(dream_move == 0){
            Year = saveYear;
            Month = saveMonth;
            Day = saveDay;
        }

        Hours = newHours;
        Minutes = newMinutes;
        Seconds = newSeconds;

        times = 1;
        dream_move = 1;
        dreamreals = 0;
    }
}

dream.onclick = function(){
    //input 값에 있는 날짜를 가져와서 .으로 배열의 시작을 나눈다.
    material = document.getElementById("text_time").value;
    material = material.split(".");

    //배열을 date로 넣어서 값이 이상할 경우 값을 변경
    moveDay = new Date(material[1] + "/" + material[2] + "/" + material[0]);

    //값이 정상적인 값이 아닐경우 값이 이상하게 뜨는것을 방지하기위해 alert를 통해 완성시키라고 한다.
    if (!isNaN(moveDay)) {
        if(long_t == 1){
            long_time = Hours;
            long_t = 0;
        }

        if(times == 0){
            times = 1;

            saveYear = Year;
            saveMonth = Month;
            saveDay = Day;

            Hours = newHours;
            Minutes = newMinutes;
            Seconds = newSeconds;
        }

        if(times == 1){
            saveYear = Year;
            saveMonth = Month;
            saveDay = Day;

            newHours = Hours;
            newMinutes = Minutes;
            newSeconds = Seconds;
        }

        dream_move = 0;
    }else{
        alert("완성된 날짜를 입력하시오.");
    }
}

dreamreal.onclick = function(){
    times = 1;
    dream_move = 1;
    dreamreals = 1;
}

month_move.onclick = function(){
    Month++;

    if(Month == 12) Month = 0;
}
