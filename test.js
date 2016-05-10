var toolFlag = false;
var leftPercent = 0.5;
var rightPercent = 0.5;
var dragOrclick = true;
var draggedElement;
$(document).ready(function() {
	var item = 0;
	var item2 = 0;
	// this is the mouse position within the drag element
	var startOffsetX, startOffsetY;
	
	$("#leftButton").click(function() {
		if (item == 0) {
			item2 = 1; item = 2;
			rightPercent = 0.8; leftPercent = 0.2;
		} else if (item == 1) {
			item2 = 0; item = 0;
			rightPercent = 0.5; leftPercent = 0.5;
		}
		dragOrclick = false;
		$(window).trigger('resize');
	});
	$("#rightButton").click(function() {
		if (item2 == 0) {
			item = 1;item2 = 2;
			rightPercent = 0.2; leftPercent = 0.8;
		} else if (item2 == 1) {
			item = 0; item2 = 0;
			rightPercent = 0.5; leftPercent = 0.5;
		}
		dragOrclick = false;
		$(window).trigger('resize');
	});
	$("#toolButton").click(function() {
		toolFlag = true;
		$(this).fadeOut();
		$("#content").stop().animate({paddingLeft: 60},
			{step: function() {
				$(window).trigger('resize');
			}
		})
		.promise().done(function() {
			$("#toolBar").slideDown();
		});
	});
	$("#hideToolButton").click(function() {
		toolFlag = false;
		$("#toolBar").slideUp( function() {
			$("#toolButton").fadeIn();
			$("#content").stop().animate({paddingLeft: 0},
				{step: function() {
					$(window).trigger('resize');
				}
			});
		});
		
	});
	$("#Element1, #Element2, #Element3, #Element4, #Element5").hover(function() {
			$(this.id).css({borderColor:"#0000ff"});
		}, function() {
			$(this.id).css({borderColor:"#000000"});
	});
	
	$("#tool1").click(function() {
		$('#uploadedImage').imgAreaSelect({onSelectChange: preview });
		$("#previewCanvas").attr("draggable", "true");
	});
	$("#tool2").click(function() {
		$('#uploadedImage').imgAreaSelect({remove:true});
		$("#previewCanvas").attr("draggable", "false");
	});

	$(".dragSource").each(function() {
		this.onmousedown = mousedown;
		this.ondragstart = dragstart;
	});
	  
	$(".dragDest").each(function() {
		this.ondrop = drop;
		this.ondragover = allowDrop;
	});

	//draw selection on a canvas
	function preview(img, selection) {
		var canvas = $('#previewCanvas')[0];
		var selectionSource = $('#uploadedImage')[0];
		var ctx = canvas.getContext("2d");  
		var maxSize = 200;
		var destX = 0;
		var destY = 0;
		var longestSide = Math.max(selection.width, selection.height);
		var scale = maxSize / longestSide;
		canvas.width =  selection.width * scale;
		canvas.height =  selection.height * scale;
		  
		ctx.drawImage(img,
				selection.x1 * (img.naturalHeight / img.height),
				selection.y1 * (img.naturalHeight / img.height),
				selection.width * (img.naturalHeight / img.height),
				selection.height * (img.naturalHeight / img.height),
				destX,
				destY, 
				selection.width * scale,
				selection.height * scale
				);               
	}
	
	$("#imgInp").change(function(){ readURL(this); });
});

$(window).resize(function() {
	var Size = parseFloat($("#content").width());
	if (dragOrclick) {
		$("#rightSection").stop().css({width:(Size * rightPercent) - 50.1});
		$("#leftSection").stop().css({width:(Size * leftPercent) - 50});
	} else {
		$("#rightSection").stop().animate({width:(Size * rightPercent) - 50.1});
		$("#leftSection").stop().animate({width:(Size * leftPercent) - 50});
		dragOrclick = true;
	}
});
	
function setToBlack() {
	$("#Element1").css({borderColor:"#000000"});
	$("#Element2").css({borderColor:"#000000"});
	$("#Element3").css({borderColor:"#000000"});
	$("#Element4").css({borderColor:"#000000"});
	$("#Element5").css({borderColor:"#000000"});
}

  //uploading image function
function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		reader.onload = function (e) {
			$('#uploadedImage').attr('src', e.target.result);
		}           
		reader.readAsDataURL(input.files[0]);          
	}
}

function allowDrop(ev) {
	ev.preventDefault();
}

function mousedown(ev) {
	startOffsetX = ev.offsetX;
	startOffsetY = ev.offsetY;
}

function dragstart(ev) {

	ev.dataTransfer.setData("Text", ev.target.id);
	draggedElement = ev.target;
}

function drop(ev) {
	ev.preventDefault();
	  
	var canvas = ev.target;

	var canvasId = $(canvas).id;
	console.log(canvas);
	drawCopiedImage(canvas, ev); 
	//loops through multipaste elements and draws image on all of them
	var multiPasteClasses = ["multiPaste1", "multiPaste2"];
	for (var i = 0; i < multiPasteClasses.length; i++) {
	   
		if($(canvas).hasClass(multiPasteClasses[i])){
			$("." + multiPasteClasses[i]).each(function() {
				drawCopiedImage(this, ev);
			});
		}  
	}
}
//draws copied image on the canvas
function drawCopiedImage(canvas, ev){
	var ctx = canvas.getContext("2d");
	ctx.drawImage(draggedElement, 0, 0, canvas.width, canvas.height);
}