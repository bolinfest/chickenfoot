//resizable-text-boxes allows the user to resize objects of type text, password, file, or textarea on most websites.
//It puts a small .png image in the bottom right corner of the text box to show that it is resizable
//The .png image will appear in the corner of the textbox which is currently in focus
//To resize, click the .png image and drag in the direction you want to resize (up, down, left, right)

resizeTextBoxes()

//The resizeTextBoxes function gathers all of the elements on the page which are of type text, password, file, or textarea
//For each of these elements, it creates an eventListener which calls to makeCornerImage on focus.


 function resizeTextBoxes(){      
   url = "chrome://chickenfoot/skin/corner-image.png"
        for(i=0;i<document.forms.length;i++){
          for(j=0;j<document.forms[i].elements.length;j++){
            var formObj = document.forms[i].elements[j]
            if(formObj.type.toLowerCase() == "text" || formObj.type.toLowerCase() == "password" || formObj.type.toLowerCase() == "file" || formObj.type.toLowerCase() == "textarea"){
        formObj.addEventListener("focus", makeCornerImage, false)            
           }//closes if body
          } // closes inner for loop
        } //closes outer for loop
      } //closes resizeTextBoxes function


//makeCornerImage first checks to see if there is already an image present in the corner of a text box
//If there is, it removes this image
//It then creates a new image, which involves setting properties for the .png image and placing it in the appropriate location, at the bottom right corner of the textbox 
//It then creates a mask that is fully transparent and placed on top of the image. This is to bypass an issue firefox has with dragging images.
//It then makes a call to attachMouseHandlers with argument of the image, the mask, and the textbox
function makeCornerImage(event) {
        cornerIconElement = document.getElementById("cornerIcon")
        cornerMaskElement = document.getElementById("cornerMask")
        if (cornerIconElement != null) {
        remove(cornerIconElement)
        }
        if (cornerMaskElement != null) {
        remove(cornerMaskElement)
        }
        var textBoxObj = event.target;
        var doc = textBoxObj.ownerDocument
        var box = Chickenfoot.Box.forNode(textBoxObj);
        var icon = doc.createElement("img");
        var mask = doc.createElement("div")
        icon.setAttribute("src", url)
        icon.id = "cornerIcon"
        icon.style.position="absolute";
        icon.style.width = 15 + "px";
        icon.style.height = 15 + "px";
        icon.style.left = box.x+box.w-15 + "px";
        icon.style.top = box.y+box.h-15 + "px";
        icon.style.opacity = .4;
        icon.style.cursor = "nw-resize"
        var body = doc.getElementsByTagName("body")[0];
        body.appendChild(icon);      

        mask.id = "cornerMask"
        mask.style.position="absolute";
        mask.style.width = 15 + "px";
        mask.style.height = 15 + "px";
        mask.style.left = box.x+box.w-15 + "px";
        mask.style.top = box.y+box.h-15 + "px";
        mask.style.cursor = "nw-resize"
        var body = doc.getElementsByTagName("body")[0];
        body.appendChild(mask); 
       attachMouseHandlers(icon, mask, textBoxObj)
}


//attachMouseHandlers adds an eventListener to the mask which calls mouseDown on a mousedown event
function attachMouseHandlers(img, mask, textbox) {  

//mouseDown checks the current x,y coordinates of the mouse and decides what each of these would have
//to become (due to movement of the mouse) in order to justify expanding (or shrinking) the textbox.
//It then adds two eventListeners to the document. It adds one which calls expandTextBox on mousemove,
//and another which removes that mousemove eventListener on mouseup.
function mouseDown(event) {
     var targetTextBox = textbox
     var targetTextBoxWidth = targetTextBox.offsetWidth
     var targetTextBoxHeight = targetTextBox.offsetHeight
     var mousePageX = event.pageX
     var mousePageY = event.pageY
     var rightX = mousePageX + 7
     var leftX = mousePageX - 7
     var upY = mousePageY + 16
     var downY = mousePageY - 16

//expandTextBoxes checks to see if the mouse has been moved enough
//to allow the textbox to expand/contract.
//If so, the textbox is expanded/contracted in the appropriate direction and
//it's accompanying .png image and mask move to the new location of the bottom right corner of the textbox.
function expandTextBox(event)
{
if (event.pageX >= rightX)
{
if(targetTextBox.type.toLowerCase() == "text" || targetTextBox.type.toLowerCase() == "password" || targetTextBox.type.toLowerCase() == "file"){
targetTextBox.size = targetTextBox.size + 1;
        var doc = targetTextBox.ownerDocument
        var box = Chickenfoot.Box.forNode(targetTextBox);
        img.style.left = box.x+box.w-15 + "px"
        img.style.top = box.y+box.h-15 + "px"
        mask.style.left = box.x+box.w-15 + "px"
        mask.style.top = box.y+box.h-15 + "px"
rightX = rightX + 6
leftX = leftX + 6
} else if(targetTextBox.type.toLowerCase() == "textarea"){
targetTextBox.cols = targetTextBox.cols + 1
        var doc = targetTextBox.ownerDocument
        var box = Chickenfoot.Box.forNode(targetTextBox);
        img.style.left = box.x+box.w-15 + "px"
        img.style.top = box.y+box.h-15 + "px"
        mask.style.left = box.x+box.w-15 + "px"
        mask.style.top = box.y+box.h-15 + "px"
rightX = rightX + 8
leftX = leftX + 8
}
}
if (event.pageX <= leftX)
{
if(targetTextBox.type.toLowerCase() == "text" || targetTextBox.type.toLowerCase() == "password" || targetTextBox.type.toLowerCase() == "file"){
targetTextBox.size = targetTextBox.size - 1;
        var doc = targetTextBox.ownerDocument
        var box = Chickenfoot.Box.forNode(targetTextBox);
        img.style.left = box.x+box.w-15 + "px"
        img.style.top = box.y+box.h-15 + "px"
        mask.style.left = box.x+box.w-15 + "px"
        mask.style.top = box.y+box.h-15 + "px"
rightX = rightX - 6
leftX = leftX - 6
} else if(targetTextBox.type.toLowerCase() == "textarea"){
targetTextBox.cols = targetTextBox.cols - 1
        var doc = targetTextBox.ownerDocument
        var box = Chickenfoot.Box.forNode(targetTextBox);
        img.style.left = box.x+box.w-15 + "px"
        img.style.top = box.y+box.h-15 + "px"
        mask.style.left = box.x+box.w-15 + "px"
        mask.style.top = box.y+box.h-15 + "px"
rightX = rightX - 8
leftX = leftX - 8
}
}
if (event.pageY <= upY)
{
if(targetTextBox.type.toLowerCase() == "textarea"){
targetTextBox.rows = targetTextBox.rows - 1
        var doc = targetTextBox.ownerDocument
        var box = Chickenfoot.Box.forNode(targetTextBox);
        img.style.left = box.x+box.w-15 + "px"
        img.style.top = box.y+box.h-15 + "px"
        mask.style.left = box.x+box.w-15 + "px"
        mask.style.top = box.y+box.h-15 + "px"
upY = upY - 16
downY = downY - 16
}
}
if (event.pageY >= downY)
{
if(targetTextBox.type.toLowerCase() == "textarea"){
targetTextBox.rows = targetTextBox.rows + 1
        var doc = targetTextBox.ownerDocument
        var box = Chickenfoot.Box.forNode(targetTextBox);
        img.style.left = box.x+box.w-15 + "px"
        img.style.top = box.y+box.h-15 + "px"
        mask.style.left = box.x+box.w-15 + "px"
        mask.style.top = box.y+box.h-15 + "px"
upY = upY + 16
downY = downY + 16
}
}
}

document.addEventListener("mousemove",expandTextBox,false)
document.addEventListener("mouseup", function (event) {document.removeEventListener("mousemove", expandTextBox, false)}, false)
}
  mask.addEventListener("mousedown", mouseDown, false)
}

