//JOIN: removes the enters("\n") from the text
//in the text area that is in focus when ctrl-shift-j is pressed.
//If there is more than one enter in a row, it will
//remove only one of them each time the keypress is activated.

//keypress activation for ctrl-shift-j JOIN
function joinCommand(event) {
  if (event.ctrlKey && event.shiftKey && event.which == 74) 
    event.target.value = removeLineBreaks(event.target.value)}
document.addEventListener("keypress", joinCommand, false)

function removeLineBreaks(text) {
 var oldText = "" + text
 var newText = ""
 for(var place=0; place<text.length; place++) {
   if ((oldText.substring(place, place+1) == "\n")
       //checks to make sure next character isn't also "\n"
       &&(oldText.substring(place+1, place+2) != "\n"))
     if (oldText.substring(place-1, place) == "\n")
        {newText = newText}
     //replaces "\n" with a space
     else {newText += " "}
   //if next character is also an "\n" then continues down the string
   //without changing anything
   else {newText += oldText.substring(place, place+1)}}
  //return modified text
  return newText;}

//------------------------------------------
//SPLIT: inserts enters("\n") at the current line breaks in
//the text area that is in focus when ctrl-shift-s is pressed.
//If there is more than one paragraph, the split text in the
//text area may appear differently on the actual webpage,
//but when viewed in a text editor, it will appear the same.

//keypress activation for ctrl-shift-s SPLIT
function splitCommand(event) {
  if (event.ctrlKey && event.shiftKey && event.which == 83) 
    {event.target.value = insertLineBreaks(event.target.value, event.target.cols)}}
document.addEventListener("keypress", splitCommand, false)

function insertLineBreaks(text, cols) {
var oldText = text + " "
var newText = ""
var x = cols+3
for(var place = 0; place<text.length; place+=x){
   //set x, the place to cut the line off, to the position of the space nearest
   //the end of the line(determined by the width in columns of the text area).
   //(call findNearestSpace)
   x = findNearestSpace(oldText.substring(place, place+cols+3));
   
   //if the entire line is one string of characters, then look for
   //the next space in the text to break the line, and change x to
   //this new value. (call findNextSpace)
   if ((x == oldText.substring(place, place+cols+3).length)
       && (oldText.substring(place+cols+2, place+cols+3) != " ")
       && (x>=(cols+3)))
     {x += findNextSpace(oldText.substring(place+cols+3, oldText.length));}
     
   //check if at end of text, if yes then don't add enter
   if (oldText.substring(0, place+x) == oldText)
     {newText += oldText.substring(place, oldText.length-1); break;}
     
   //check if last character on line is a space, if yes, don't include it
   if (oldText.substring(place+x-1, place+x) == " ")
     {newText+= oldText.substring(place, place+x-1) + "\n"}
   else {newText += oldText.substring(place, place+x) + "\n"}}
//return modified text
return newText;}

//searches for the place to break nearest the end of the line
//passed one line of text at a time
//returns a number of the place in the line to break at
function findNearestSpace(text){
//check if there are any enters, if yes then break there
 for(var j=0; j<text.length; j++){
  if (text.substring(j, j+1) == "\n") 
    {return j+1; break;}}
//otherwise find space nearest the end of the line
//if no spaces in line, then return the end of the line
 for(var i = text.length; i>0; i--){
  if (i == 1) {return text.length}
  if (text.substring(i-1, i) == " ")
    {return i; break;}}}

//searches for the place to break nearest the beginning of the text
//passed more than one line of text
//returns a number of the place in the text to break at
function findNextSpace(text){
  for(var b=0; b<text.length; b++){
  if (text.substring(b, b+1) == " ") 
    {return b+1; break;}}}
