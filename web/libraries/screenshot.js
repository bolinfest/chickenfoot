/**
 *This is a library which provides functions to take screen shots of the webpage
 */


/**
 * Takes screenshot of the page and stores it in the file name given
 * @param fileName string filename
 * **To use pass in a full path to save to, or just a file name to save to desktop by default
 * **or a path of the form "subdir/image.png" to save it in a subdir on desktop
 */
function grabScreenshot(/*String*/ fileName) {
  include("fileio.js"); //for file I/O functions
	var wTotal = document.documentElement.clientWidth;
  var hTotal = document.documentElement.clientHeight;
  var wViewable = window.innerWidth;
  var hViewable = window.innerHeight;
  var width = Math.min(wTotal, wViewable); 
  var height = Math.min(hTotal, hViewable);
  var x = window.scrollX;
  var y = window.scrollY;
  
  var scale = 1.0;
  var canvas = document.createElement("canvas");
  canvas.width = width*scale;
  canvas.height = height*scale;

  var ctx = canvas.getContext("2d"); //context fetching
  ctx.clearRect(x, y, canvas.width, canvas.height);
  ctx.scale(scale, scale);

  ctx.drawWindow(window, x, y, width, height, "rgb(0,0,0)");
  sleep(0.2);
	
  var data = atob(canvas.toDataURL("image/png").toString().slice(22)); //decode the string
  
  writeBytes(fileName, data);
}

