
/**
 * Creates a new, random GUID
 *
 * NOTE: Found this code on the web at http://note19.com/2007/05/27/javascript-guid-generator/
 */
function generateRandomGuid() {
  function randNum() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
  return "" + (randNum()+randNum()+"-"+randNum()+"-"+randNum()+"-"+randNum()+"-"+randNum()+randNum()+randNum());
}