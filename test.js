// Onload function for adding button listener
// for uploading file via JS
window.onload = function() {
	var input = document.getElementById('input');
	input.addEventListener('change', handleFiles);
}

// Function gets uploaded image and converts it to CMYK and displays it
function handleFiles(e) {
    var ctx = document.getElementById('canvas').getContext('2d');
    var img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = function() {
    	ctx.clearRect(0,0,1600, 1200);
    	var height = img.height;
    	var width = img.width;
        ctx.drawImage(img, 0,0);

        //get image data and create image data for CMYK convertion
        var imageData = ctx.getImageData(0,0, width, height);
        var convert = ctx.createImageData(width, height);

        // For each pixel convert to CMYK
        for(i = 0; i < imageData.data.length; i++) {
	    	var index = i * 4;

	    	// RGB to CMYK convertion
		    var temp = toCMYK(imageData.data[index],
		                      imageData.data[index + 1],
		                      imageData.data[index + 2]);

		    // back to RGB for displaying
		    var pixel = toRGB(temp);
		    imageData.data[index] = pixel.r;
		    imageData.data[index+1] = pixel.g;
		    imageData.data[index+2] = pixel.b;
		    imageData.data[index+3] = 255; // A channel of the image

        }

        // Display converted image
        ctx.putImageData(imageData, 0, 0);
    }
}

// Constructor function for an RGB pixel object
function RGB(r, g, b) {
	if (r <= 0) { r = 0; }
	if (g <= 0) { g = 0; }
	if (b <= 0) { b = 0; }
 
	if (r > 255) { r = 255; }
	if (g > 255) { g = 255; }
	if (b > 255) { b = 255; }
 
	this.r = r;
	this.g = g;
	this.b = b;
}
 
 // Constructor function for an CMYK pixel object
function CMYK(c, m, y, k) {
	if (c <= 0) { c = 0; }
	if (m <= 0) { m = 0; }
	if (y <= 0) { y = 0; }
	if (k <= 0) { k = 0; }
 
	if (c > 100) { c = 100; }
	if (m > 100) { m = 100; }
	if (y > 100) { y = 100; }
	if (k > 100) { k = 100; }
 
	this.c = c;
	this.m = m;
	this.y = y;
	this.k = k;
}

// Function converts RGB to CMYK
function toCMYK(R, G, B) {
  var result = new CMYK(0, 0, 0, 0);
 
		r = R / 255;
		g = G / 255;
		b = B / 255;
 
		result.k = Math.min( 1 - r, 1 - g, 1 - b );
		result.c = ( 1 - r - result.k ) / ( 1 - result.k );
		result.m = ( 1 - g - result.k ) / ( 1 - result.k );
		result.y = ( 1 - b - result.k ) / ( 1 - result.k );
 
		result.c = Math.round( result.c * 100 );
		result.m = Math.round( result.m * 100 );
		result.y = Math.round( result.y * 100 );
		result.k = Math.round( result.k * 100 );
 
		return result;
}

// Converts CMYK to RGB. Note: this is intended to emulate
// a printed image, and therefore is washed out.
function toRGB(CMYK) {
	var result = new RGB(0,0,0);
  
  CMYK.c = Math.min(255, CMYK.c + CMYK.k);
  CMYK.m = Math.min(255, CMYK.m + CMYK.k);
  CMYK.y = Math.min(255, CMYK.y + CMYK.k);

  result.r = 255 - CMYK.c;
  result.g = 255 - CMYK.m;
  result.b = 255 - CMYK.y;
  
  return result;
}