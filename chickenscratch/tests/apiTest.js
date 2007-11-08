var Test = Chickenfoot.Test;

var prefix = "file://" + scriptDir.path + "/pages/";


///////////////////////////////////
// tests

var t = new Test();

var testName;  // name of current test, inferred from load() argument

// us-geocode api
include("us-geocoder.js");
t.test("us-geocode-address", function() {
  // TODO: test case where don't get result returned?
  
  //tests address lookup with one result
  var address_lookup = getGeocoderResults("77 Massachusetts Ave, Cambridge, MA 02139")
  var result1 = address_lookup[0]
  Test.assertEquals(result1["lat"], 42.359368)
  Test.assertEquals(result1["long"], -71.094208)
  Test.assertEquals(result1["zip"], "02139")
  Test.assertEquals(result1["state"], "MA")
  Test.assertEquals(result1["city"], "Cambridge")
  Test.assertEquals(result1["number"], 77)
  Test.assertEquals(result1["suffix"], null)
  Test.assertEquals(result1["prefix"], null)
  Test.assertEquals(result1["street"], "Massachusetts")
  Test.assertEquals(result1["type"], "Ave");
  // we don't test values for suffix1, etc since those values
  // are only guaranteed to make sense for intersection lookups
  });

  
t.test("us-geocode-intersection", function() {
  //tests intersection lookup with two results
  var intersection_lookup = getGeocoderResults("West 42nd & Broadway, New York NY")
  var result1 = intersection_lookup[0]
  Test.assertEquals(result1["lat"], 40.758224)
  Test.assertEquals(result1["long"], -73.917404)
  Test.assertEquals(result1["zip"], "11103")
  Test.assertEquals(result1["state"], "NY")
  Test.assertEquals(result1["city"], "New York")
  // We don't check number, suffix, prefix, street or type since 
  // that's only for address lookups.
  Test.assertEquals(result1["suffix1"], null)
  Test.assertEquals(result1["prefix1"], null)
  Test.assertEquals(result1["type1"], "St")
  Test.assertEquals(result1["street1"], "42nd")
  Test.assertEquals(result1["suffix2"], null)
  Test.assertEquals(result1["prefix2"], null)
  Test.assertEquals(result1["type2"], null)
  Test.assertEquals(result1["street2"], "Broadway")
  
  var result2 = intersection_lookup[1]
  Test.assertEquals(result2["lat"], 40.755932)
  Test.assertEquals(result2["long"], -73.986508)
  Test.assertEquals(result2["zip"], "10036")
  Test.assertEquals(result2["state"], "NY")
  Test.assertEquals(result2["city"], "New York")
  // We don't check number, suffix, prefix, street or type since 
  // that's only for address lookups.
  Test.assertEquals(result2["suffix1"], null)
  Test.assertEquals(result2["prefix1"], "W")
  Test.assertEquals(result2["type1"], "St")
  Test.assertEquals(result2["street1"], "42nd")
  Test.assertEquals(result2["suffix2"], null)
  Test.assertEquals(result2["prefix2"], null)
  Test.assertEquals(result2["type2"], null)
  Test.assertEquals(result2["street2"], "Broadway")
});


/******************
 These tests are currently broken.

// google SOAP search api
//load("google.html");
//load("google-advanced_search.html");
include("google-search.js");

getGoogleLicenseKey = function() {
  return "xoUEFDpQFHI7ZtNP7wRYTBnrBf61DJtK";
}
output(getGoogleLicenseKey());
t.test("google-search", function() {
  var results = getGoogleSearchResults("CSAIL");
  //verify overall results
  Test.assertEquals(results["documentFiltering"], true) 
  Test.assertEquals(results["searchComments"], null)
  Test.assertEquals(typeof results["estimatedTotalResultsCount"], 'number')
  Test.assertEquals(typeof results["estimateIsExact"], 'boolean')
  Test.assertEquals(results["searchQuery"], "CSAIL")
  Test.assertEquals(results["startIndex"], 1)
  Test.assertEquals(results["endIndex"], 10)
  Test.assertEquals(results["searchTips"], null)
  //Not testing directoryCategories since I'm not sure what they
  // are and they're not implemented yet.
  //Test.assertEquals(results["directoryCategories"])
  Test.assertEquals(typeof results["searchTime"], 'number')
  
  //verify first search result found
  var result1 = results["resultElements"][0];
  //Test.assertEquals(typeof result1["summary"], 'string', "Summary should be string. Was "+typeof result1["summary"])
  Test.assertEquals(typeof result1["URL"], 'string', "URL should be string. Was "+typeof result1["URL"] );
  Test.assertEquals(typeof result1["snippet"], 'string', "Snippet should be string. Was "+typeof result1["snippet"] );
  Test.assertEquals(typeof result1["title"], 'string', "Title should be string. Was "+typeof result1["title"] );
  //Test.assertEquals(result1["cachedSize"] );
  Test.assertEquals(typeof result1["relatedInformationPresent"], 'boolean', "relatedInformationPresent should be boolean. Was "+typeof result1["relatedInformationPresent"] );
  Test.assertEquals(typeof result1["hostName"], 'string',"HostName should be string. Was "+typeof result1["hostName"]  );
 //Test.assertEquals(result1["directoryCategory"] );
 //Test.assertEquals(result1["directoryTitle"] );
});

t.test("google-spelling", function() {
  var result = getGoogleSpellingSuggestion("aple")
  Test.assertEquals(result, "apple");
});

end of broken tests
*********************/

// Summarize testing
t.close();


///////////////
// internal methods
//

function load(file) {
  var url = prefix + file;
    go(url);
  
  // extract the basename of the filename and use
  // it as the test name
  testName = file.match(/^([^\.]*)(\.|$)/)[1]
}

