window.onload = function() {
    blurRadius = 5;
    simplifyTolerant = 0;
    simplifyCount = 30;
    hatchLength = 4;
    hatchOffset = 0;

    imageInfo = null;
    cacheInd = null;
    mask = null;
    downPoint = null;
    img = null;
    allowDraw = false;

    slider = document.getElementById("thresSlider");

    slider.addEventListener("change", function() {
    	currentThreshold = slider.value;
    	showThreshold();
    })
    colorThreshold = slider.value = 50;
    currentThreshold = colorThreshold;
    showThreshold();
    //document.getElementById("blurRadius").value = blurRadius;
    setInterval(function () { hatchTick(); }, 300);
};
window.onclick = function(e) {
	if(e.target.id != "resultCanvas") {
		mask = null;
		var ctx = document.getElementById("resultCanvas").getContext('2d');
		if(imageInfo != null) {
			ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
			ctx.putImageData(imageInfo.data, 0, 0);
		}
	}
};
function uploadClick() {
    document.getElementById("file-upload").click();
};
function onRadiusChange(e) {
    blurRadius = e.target.value;
};
function imgChange (inp) {
    if (inp.files && inp.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            //var img = document.getElementById("test-picture");
            //img.setAttribute('src', e.target.result);
            var ctx = document.getElementById("resultCanvas").getContext('2d');
            img = new Image;
            img.src = URL.createObjectURL(inp.files[0]);
            //console.log(img);
            img.onload = function() {
                window.initCanvas(img);
                ctx.drawImage(img, 0, 0);
            };
        }
        reader.readAsDataURL(inp.files[0]);
    }
};
function initCanvas(img) {
    var cvs = document.getElementById("resultCanvas");
    cvs.width = img.width;
    cvs.height = img.height;
    //console.log(img);
    imageInfo = {
        width: img.width,
        height: img.height,
        context: cvs.getContext("2d")
    };
    mask = null;
    
    var tempCtx = document.createElement("canvas").getContext("2d");
    tempCtx.canvas.width = imageInfo.width;
    tempCtx.canvas.height = imageInfo.height;
    tempCtx.drawImage(img, 0, 0);
    imageInfo.data = tempCtx.getImageData(0, 0, imageInfo.width, imageInfo.height);
};
function getMousePosition(e) { // NOTE*: These may need tweeking to work properly
    var p = $(e.target).offset(),
        x = Math.round((e.clientX || e.pageX) - p.left),
        y = Math.round((e.clientY || e.pageY) - p.top);
    return { x: x, y: y };
};
function onMouseDown(e) {
    if (e.button == 0) {
        allowDraw = true;
        downPoint = getMousePosition(e);
        drawMask(downPoint.x, downPoint.y);
        //console.log(mask);
        //console.log(mask.data.length);
    }
    else allowDraw = false;
};
function onMouseMove(e) {
    if (allowDraw) {
        var p = getMousePosition(e);
        if (p.x != downPoint.x || p.y != downPoint.y) {
            var dx = p.x - downPoint.x,
                dy = p.y - downPoint.y,
                len = Math.sqrt(dx * dx + dy * dy),
                adx = Math.abs(dx),
                ady = Math.abs(dy),
                sign = adx > ady ? dx / adx : dy / ady;
            sign = sign < 0 ? sign / 5 : sign / 3;
            //var thres = Math.min(Math.max(colorThreshold + Math.floor(sign * len), 1), 255);
            //var thres = Math.min(colorThreshold + Math.floor(len / 3), 255);
            /*if (thres != currentThreshold) {
                currentThreshold = thres;
                drawMask(downPoint.x, downPoint.y);
            }*/
        }
    }
};
function onMouseUp(e) {
    allowDraw = false;
    //currentThreshold = colorThreshold;
};
function showThreshold() {
    document.getElementById("threshold").innerHTML = "Threshold: " + currentThreshold;
};
function drawMask(x, y) {
    if (!imageInfo) return;
    
    showThreshold();
    
    var image = {
        data: imageInfo.data.data,
        width: imageInfo.width,
        height: imageInfo.height,
        bytes: 4
    };

    mask = MagicWand.floodFill(image, x, y, currentThreshold);
    mask = MagicWand.gaussBlurOnlyBorder(mask, blurRadius);
    drawBorder();
};
function hatchTick() {
    hatchOffset = (hatchOffset + 1) % (hatchLength * 2);
    drawBorder(true);
};
function drawBorder(noBorder) {
    if (!mask) return;
    
    var x,y,i,j,
        w = imageInfo.width,
        h = imageInfo.height,
        ctx = imageInfo.context,
        imgData = ctx.createImageData(w, h);
    imgData.data.set(new Uint8ClampedArray(imageInfo.data.data));
    var res = imgData.data;
    
    if (!noBorder) cacheInd = MagicWand.getBorderIndices(mask);
    
    ctx.clearRect(0, 0, w, h);
    //ctx.drawImage(img, 0, 0);
    var len = cacheInd.length;
    for (j = 0; j < len; j++) {
        i = cacheInd[j];
        x = i % w; // calc x by index
        y = (i - x) / w; // calc y by index
        k = (y * w + x) * 4; 
        if ((x + y + hatchOffset) % (hatchLength * 2) < hatchLength) { // detect hatch color 
            res[k + 3] = 255; // black, change only alpha
        } else {
            res[k] = 255; // white
            res[k + 1] = 255;
            res[k + 2] = 255;
            res[k + 3] = 255;
        }
    }

    ctx.putImageData(imgData, 0, 0);
};
/*function trace() {
    var cs = MagicWand.traceContours(mask);
    cs = MagicWand.simplifyContours(cs, simplifyTolerant, simplifyCount);

    mask = null;

    // draw contours
    var ctx = imageInfo.context;
    ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
    //ctx.draw(img, 0, 0);
    //inner
    ctx.beginPath();
    for (var i = 0; i < cs.length; i++) {
        if (!cs[i].inner) continue;
        var ps = cs[i].points;
        ctx.moveTo(ps[0].x, ps[0].y);
        for (var j = 1; j < ps.length; j++) {
            ctx.lineTo(ps[j].x, ps[j].y);
        }
    }
    ctx.strokeStyle = "red";
    ctx.stroke();    
    //outer
    ctx.beginPath();
    for (var i = 0; i < cs.length; i++) {
        if (cs[i].inner) continue;
        var ps = cs[i].points;
        ctx.moveTo(ps[0].x, ps[0].y);
        for (var j = 1; j < ps.length; j++) {
            ctx.lineTo(ps[j].x, ps[j].y);
        }
    }
    ctx.strokeStyle = "blue";
    ctx.stroke();    
};*/
function cropOut() {
	if(mask == null) return;
	
	for(i = 0; i < mask.data.length; i++) {
		if(mask.data[i] != 0) {
			var tmp = i * 4;
			imageInfo.data.data[tmp] = 0;
			imageInfo.data.data[tmp + 1] = 0;
			imageInfo.data.data[tmp + 2] = 0;
			imageInfo.data.data[tmp + 3] = 0;
		}
	}
	mask = null;
	var ctx = document.getElementById("resultCanvas").getContext('2d');
	ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
	ctx.putImageData(imageInfo.data, 0, 0);
};