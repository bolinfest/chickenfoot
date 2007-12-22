/**
 * us-geocoder.js
 *
 * Allows people to get latitude/longitude numbers for a given
 * address or intersection in the United States.
 *
 * This should only be used for non-commercial purposes. For commercial
 * purposes, one must sign up for a commercial license. More info
 * on their website at http://geocoder.us/
 * 
 * Code partially generated with wsdl2js
 *
 * Wrappers:
 * <ul>
 *   <li>getGeocoderResults()<br/>
 *       sample call: <br/><pre>
 *       var result = getGeocoderResults("77 Massachusetts Ave, Cambridge, MA 02139")[0]
 *       output ("latitude is: "+result["lat"])
 *       output ("longitude is: "+result["long"])
 *       </pre></li>
 * </ul>
 */
 
/**
* Takes in a address/intersection query string.
* Returns an array of GeocoderResultObjects that each have the fields for
* either an addressResultObject or an intersectionResultObject filled in.
*/
function getGeocoderResults(/*string*/ query){
  var params = new geocodeRequestObj();
  params["location"] = query;
  return geocode(params);
}

function geocodeRequestObj() {
   /*string*/ this["location"] = null;
}

function GeocoderResultObj() {
   /*string*/ this["zip"] = null; //stored as string so as not to truncate leading zeros
   /*string*/ this["state"] = null;
   /*string*/ this["city"] = null;
   /*int*/ this["lat"] = null;
   /*int*/ this["long"] = null;
   /*int*/ this["number"] = null;
   /*string*/ this["suffix"] = null;
   /*string*/ this["prefix"] = null;
   /*string*/ this["type"] = null;
   /*string*/ this["street"] = null;
   /*string*/ this["suffix1"] = null;
   /*string*/ this["prefix1"] = null;
   /*string*/ this["type1"] = null;
   /*string*/ this["street1"] = null;
   /*string*/ this["suffix2"] = null;
   /*string*/ this["prefix2"] = null;
   /*string*/ this["type2"] = null;
   /*string*/ this["street2"] = null;
}

// TODO: add an appropriate toString() method to GeocoderResultObj
// The toString() below is reasonable if the obj is an address,
// but it isn't so great if it is an intersection.
// 
//GeocoderResultObj.prototype.toString = function() {
//  return this.number + " " + this.street + " " + this.type
//         + ", " + this.city + ", " + this.state + " " + this.zip
//         + " :: (lat:" + this.lat + ", long:" + this["long"] + ')';
//}


function geocodeResponseObj() {
   /*GeocoderResultObj[]*/ this["results"] = null;
}

/**
 * @param geocodeRequest of type geocodeRequestObj
 * @return geocodeResponse
 */
function geocode(geocodeRequest) {
  var call = new window.SOAPCall();
  call.transportURI = "http://rpc.geocoder.us/service/soap/";

  var param0 = new window.SOAPParameter();
  param0.name = "location";
  param0.value = geocodeRequest["location"];

  var myParamArray = [param0];
  call.encode(0, "geocode", "http://rpc.geocoder.us/Geo/Coder/US/", 0, null, myParamArray.length, myParamArray);
  var translation = call.invoke();

  if (translation.fault) {
    // error returned from the web service
    throw translation.fault;
  } else {
    var temp;
    var obj0 = new geocodeResponseObj();  
 
    var node0 = (translation.body.getElementsByTagName('geocodeResponse'))[0];
    //output(domToString(node0.childNodes[0]))  
    var obj1 = [];
    // Know only child node of geocodeResponse is geo:s-genxym###
    // this will be an array of items
    var node1 = node0.childNodes[0];
    // code for results
    items1 = node1.getElementsByTagName('item');
    for (var i = 0; i < items1.length; i++) {
      var obj2 = new GeocoderResultObj();
      var node2 = items1[i];
        try{temp = node2.getElementsByTagName('zip')[0].firstChild;} catch (e) {}        
        obj2['zip'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('state')[0].firstChild;} catch (e) {}
        obj2['state'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('city')[0].firstChild;} catch (e) {}   
        obj2['city'] = (temp == null) ? null : temp.nodeValue;    
        try{temp = node2.getElementsByTagName('lat')[0].firstChild;} catch (e) {}        
        obj2['lat'] = (temp == null) ? null : parseFloat(temp.nodeValue, 10);
        try{temp = node2.getElementsByTagName('long')[0].firstChild;} catch (e) {}        
        obj2['long'] = (temp == null) ? null : parseFloat(temp.nodeValue, 10);
        try{temp = node2.getElementsByTagName('number')[0].firstChild;} catch (e) {}        
        obj2['number'] = (temp == null) ? null : parseInt(temp.nodeValue, 10);
        try{temp = node2.getElementsByTagName('suffix')[0].firstChild;} catch (e) {}        
        obj2['suffix'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('prefix')[0].firstChild;} catch (e) {}        
        obj2['prefix'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('type')[0].firstChild;} catch (e) {}        
        obj2['type'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('street')[0].firstChild;} catch (e) {}
        obj2['street'] = (temp == null) ? null : temp.nodeValue;
	    try{temp = node2.getElementsByTagName('suffix1')[0].firstChild;} catch (e) {}
	    obj2['suffix1'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('prefix1')[0].firstChild;} catch (e) {}   
	    obj2['prefix1'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('type1')[0].firstChild;} catch (e) {}
	    obj2['type1'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('street1')[0].firstChild;} catch (e) {}
        obj2['street1'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('suffix2')[0].firstChild;} catch (e) {}
        obj2['suffix2'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('prefix2')[0].firstChild;} catch (e) {}
        obj2['prefix2'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('type2')[0].firstChild;} catch (e) {}
        obj2['type2'] = (temp == null) ? null : temp.nodeValue;
        try{temp = node2.getElementsByTagName('street2')[0].firstChild;} catch (e) {}
        obj2['street2'] = (temp == null) ? null : temp.nodeValue;
      obj1.push(obj2);
    }
    obj0['results'] = obj1;
    return obj0['results'];
  }
}