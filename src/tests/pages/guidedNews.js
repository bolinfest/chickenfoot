// Array that holds all the news categories for the drop-down box.

var newsTypeOptions = new Array(1);

function clearPubtitle(form) {
   
   form.pubtitle.value = "";
}

function clearArray(array) {
  
  var i;

  for (i = array.length-1; i >= 0; i--)  {
	if (array[i] != null)  {
	    if(navigator.appName=="Microsoft Internet Explorer" &&
		    navigator.appVersion.indexOf("MSIE 5")>-1 && 
		    navigator.appVersion.indexOf("Mac") < 0){
		//  IE5-only code
		array[i].text = "";
		array[i].value = "";
		array[i].removeNode();
	    }
            else {
		array[i].text = "";
		array[i].value = "";
		array[i] = null; 
	    }
	}
  }
  array.length = 0;
}

function loadArrays(key) {

  var genNewsSize           =  7;   
  var todaysNewsSize        =  1;   
  var usNewsSize            = 55;  
  var worldNewsSize         =  4; 
  var newsWiresSize         =  1;
  var newsTranscriptsSize   = 15;
  var artsAndSportsNewsSize =  3;
  var nonEnglishNewsSize    =  6;
  var businessNewsSize      =  4;
  var legalNewsSize         =  1;
  var universityNewsSize    =  2;
  var medicalNewsSize       =  1;

  switch (key) {
      case "General News":
        loadGenNews(genNewsSize, newsTypeOptions);
        break;

      case "Today's News":
        loadTodaysNews(todaysNewsSize, newsTypeOptions);
        break;

      case "U.S. News":  
        loadUsNews(usNewsSize, newsTypeOptions);
        break;
 
      case "World News":
        loadWorldNews(worldNewsSize, newsTypeOptions);
        break;

      case "News Wires":
        loadNewsWires(newsWiresSize, newsTypeOptions);
        break;

      case "News Transcripts":
        loadNewsTranscripts(newsTranscriptsSize, newsTypeOptions);
        break;

      case "Arts & Sports News":  
        loadArtsAndSportsNews(artsAndSportsNewsSize, newsTypeOptions);
        break;

      case "Non-English Language News":  
        loadNonEnglishNews(nonEnglishNewsSize, newsTypeOptions);
        break;

      case "Business News":  
        loadBusinessNews(businessNewsSize,  newsTypeOptions);
        break;
    
      case "Legal News":
        loadLegalNews(legalNewsSize,  newsTypeOptions);
        break;
   
      case "University News":  
        loadUniversityNews(universityNewsSize, newsTypeOptions);
        break;
  
      case "Medical News":
        loadMedicalNews(medicalNewsSize,  newsTypeOptions);
        break;
   
      default:
        newsTypeOptions[0] = "";
        break;
   } 

}

function loadGenNews(arraySize, newsTypeOptions) {

  var generalNewsOptions = new Array (arraySize);
  var generalNews = new Array(arraySize);

  for (var j = 0; j < generalNewsOptions.length; j++)  {
	generalNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   generalNewsOptions[0][0] = "Major Papers";
   generalNewsOptions[0][1] = "NEWS;MAJPAP";

   generalNewsOptions[1][0] = "Magazines and Journals";
   generalNewsOptions[1][1] = "NEWS;MAGS";

   generalNewsOptions[2][0] = "Newsletters";
   generalNewsOptions[2][1] = "NEWS;NWLTRS";

   generalNewsOptions[3][0] = "Abstracts";
   generalNewsOptions[3][1] = "NEWS;ALLABS";

   generalNewsOptions[4][0] = "Policy Papers";
   generalNewsOptions[4][1] = "NEWS;PLCYPA";

   generalNewsOptions[5][0] = "Time Incorporated Publications";
   generalNewsOptions[5][1] = "NEWS;TIMESL";

   generalNewsOptions[6][0] = "Ethnic News";
   generalNewsOptions[6][1] = "NEWS;ETHNLN";


   for (var i = 0; i < generalNews.length; i++)  {
     generalNews[i] = new Option (generalNewsOptions[i][0], generalNewsOptions[i][1]);
   }

    newsTypeOptions[0] =  generalNews; 
}

function loadTodaysNews(arraySize, newsTypeOptions) {

  var todaysNewsOptions = new Array (arraySize);
  var todaysNews = new Array(arraySize);

  for (var j = 0; j < todaysNewsOptions.length; j++)  {
	todaysNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   todaysNewsOptions[0][0] = "Today's Selected News Sources";
   todaysNewsOptions[0][1] = "TOPNWS;TODAY";

   for (var i = 0; i < todaysNews.length; i++)  {
     todaysNews[i] = new Option (todaysNewsOptions[i][0], todaysNewsOptions[i][1]);
   }

   newsTypeOptions[0] =  todaysNews;
}

function loadUsNews(arraySize, newsTypeOptions) {

  var usNewsOptions = new Array (arraySize);
  var usNews = new Array(arraySize);

  for (var j = 0; j < usNewsOptions.length; j++)  {
	usNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
    usNewsOptions[0][0] = "Midwest Regional Sources";
    usNewsOptions[0][1] = "NEWS;MWEST";

    usNewsOptions[1][0] = "Northeast Regional Sources";
    usNewsOptions[1][1] = "NEWS;NEAST";

    usNewsOptions[2][0] = "Southeast Regional Sources";
    usNewsOptions[2][1] = "NEWS;SEAST";

    usNewsOptions[3][0] = "Western Regional Sources";
    usNewsOptions[3][1] = "NEWS;WEST";

    usNewsOptions[4][0] = "Alabama News Sources";
    usNewsOptions[4][1] = "REGNWS;ALNWS";

    usNewsOptions[5][0] = "Alaska News Sources";
    usNewsOptions[5][1] = "REGNWS;AKNWS";

    usNewsOptions[6][0] = "Arizona News Sources";
    usNewsOptions[6][1] = "REGNWS;AZNWS";

    usNewsOptions[7][0] = "Arkansas News Sources";
    usNewsOptions[7][1] = "REGNWS;ARNWS";

    usNewsOptions[8][0] = "California News Sources";
    usNewsOptions[8][1] = "REGNWS;CANWS";

    usNewsOptions[9][0] = "Colorado News Sources";
    usNewsOptions[9][1] = "REGNWS;CONWS";

    usNewsOptions[10][0] = "Connecticut News Sources";
    usNewsOptions[10][1] = "REGNWS;CTNWS";

    usNewsOptions[11][0] = "Delaware News Sources";
    usNewsOptions[11][1] = "REGNWS;DENWS";

    usNewsOptions[12][0] = "District of Columbia News Sources";
    usNewsOptions[12][1] = "REGNWS;DCNWS";

    usNewsOptions[13][0] = "Florida News Sources";
    usNewsOptions[13][1] = "REGNWS;FLNWS";

    usNewsOptions[14][0] = "Georgia News Sources";
    usNewsOptions[14][1] = "REGNWS;GANWS";

    usNewsOptions[15][0] = "Hawaii News Sources";
    usNewsOptions[15][1] = "REGNWS;HINWS";

    usNewsOptions[16][0] = "Idaho News Sources";
    usNewsOptions[16][1] = "REGNWS;IDNWS";

    usNewsOptions[17][0] = "Illinois News Sources";
    usNewsOptions[17][1] = "REGNWS;ILNWS";

    usNewsOptions[18][0] = "Indiana News Sources";
    usNewsOptions[18][1] = "REGNWS;INNWS";

    usNewsOptions[19][0] = "Iowa News Sources";
    usNewsOptions[19][1] = "REGNWS;IANWS";

    usNewsOptions[20][0] = "Kansas News Sources";
    usNewsOptions[20][1] = "REGNWS;KSNWS";

    usNewsOptions[21][0] = "Kentucky News Sources";
    usNewsOptions[21][1] = "REGNWS;KYNWS";

    usNewsOptions[22][0] = "Louisiana News Sources";
    usNewsOptions[22][1] = "REGNWS;LANWS";

    usNewsOptions[23][0] = "Maine News Sources";
    usNewsOptions[23][1] = "REGNWS;MENWS";

    usNewsOptions[24][0] = "Maryland News Sources";
    usNewsOptions[24][1] = "REGNWS;MDNWS";

    usNewsOptions[25][0] = "Massachusetts News Sources";
    usNewsOptions[25][1] = "REGNWS;MANWS";

    usNewsOptions[26][0] = "Michigan News Sources";
    usNewsOptions[26][1] = "REGNWS;MINWS";

    usNewsOptions[27][0] = "Minnesota News Sources";
    usNewsOptions[27][1] = "REGNWS;MNNWS";

    usNewsOptions[28][0] = "Mississippi News Sources";
    usNewsOptions[28][1] = "REGNWS;MSNWS";

    usNewsOptions[29][0] = "Missouri News Sources";
    usNewsOptions[29][1] = "REGNWS;MONWS";

    usNewsOptions[30][0] = "Montana News Sources";
    usNewsOptions[30][1] = "REGNWS;MTNWS";

    usNewsOptions[31][0] = "Nebraska News Sources";
    usNewsOptions[31][1] = "REGNWS;NENWS";

    usNewsOptions[32][0] = "Nevada News Sources";
    usNewsOptions[32][1] = "REGNWS;NVNWS";

    usNewsOptions[33][0] = "New Hampshire News Sources";
    usNewsOptions[33][1] = "REGNWS;NHNWS";

    usNewsOptions[34][0] = "New Jersey News Sources";
    usNewsOptions[34][1] = "REGNWS;NJNWS";

    usNewsOptions[35][0] = "New Mexico News Sources";
    usNewsOptions[35][1] = "REGNWS;NMNWS";

    usNewsOptions[36][0] = "New York News Sources";
    usNewsOptions[36][1] = "REGNWS;NYNWS";

    usNewsOptions[37][0] = "North Carolina News Sources";
    usNewsOptions[37][1] = "REGNWS;NCNWS";

    usNewsOptions[38][0] = "North Dakota News Sources";
    usNewsOptions[38][1] = "REGNWS;NDNWS";

    usNewsOptions[39][0] = "Ohio News Sources";
    usNewsOptions[39][1] = "REGNWS;OHNWS";

    usNewsOptions[40][0] = "Oklahoma News Sources";
    usNewsOptions[40][1] = "REGNWS;OKNWS";

    usNewsOptions[41][0] = "Oregon News Sources";
    usNewsOptions[41][1] = "REGNWS;ORNWS";

    usNewsOptions[42][0] = "Pennsylvania News Sources";
    usNewsOptions[42][1] = "REGNWS;PANWS";

    usNewsOptions[43][0] = "Rhode Island News Sources";
    usNewsOptions[43][1] = "REGNWS;RINWS";

    usNewsOptions[44][0] = "South Carolina News Sources";
    usNewsOptions[44][1] = "REGNWS;SCNWS";

    usNewsOptions[45][0] = "South Dakota News Sources";
    usNewsOptions[45][1] = "REGNWS;SDNWS";

    usNewsOptions[46][0] = "Tennessee News Sources";
    usNewsOptions[46][1] = "REGNWS;TNNWS";

    usNewsOptions[47][0] = "Texas News Sources";
    usNewsOptions[47][1] = "REGNWS;TXNWS";

    usNewsOptions[48][0] = "Utah News Sources";
    usNewsOptions[48][1] = "REGNWS;UTNWS";

    usNewsOptions[49][0] = "Vermont News Sources";
    usNewsOptions[49][1] = "REGNWS;VTNWS";

    usNewsOptions[50][0] = "Virginia News Sources";
    usNewsOptions[50][1] = "REGNWS;VANWS";

    usNewsOptions[51][0] = "Washington News Sources";
    usNewsOptions[51][1] = "REGNWS;WANWS";

    usNewsOptions[52][0] = "West Virginia News Sources";
    usNewsOptions[52][1] = "REGNWS;WVNWS";

    usNewsOptions[53][0] = "Wisconsin News Sources";
    usNewsOptions[53][1] = "REGNWS;WINWS";

    usNewsOptions[54][0] = "Wyoming News Sources";
    usNewsOptions[54][1] = "REGNWS;WYNWS";


   for (var i = 0; i < usNews.length; i++)  {
     usNews[i] = new Option (usNewsOptions[i][0], usNewsOptions[i][1]);
   }

    newsTypeOptions[0] =  usNews; 

}

function loadWorldNews(arraySize, newsTypeOptions) {

  var worldNewsOptions = new Array (arraySize);
  var worldNews = new Array(arraySize);

  for (var j = 0; j < worldNewsOptions.length; j++)  {
	worldNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   worldNewsOptions[0][0] = "North/South America News Sources";
   worldNewsOptions[0][1] = "NSAMER;ALLNWS,CBCA";

   worldNewsOptions[1][0] = "European News Sources";
   worldNewsOptions[1][1] = "EUROPE;ALLNWS,BUSANL";

   worldNewsOptions[2][0] = "Asia/Pacific News Sources";
   worldNewsOptions[2][1] = "ASIAPC;ALLNWS";

   worldNewsOptions[3][0] = "Middle East/Africa Sources";
   worldNewsOptions[3][1] = "MDEAFR;ALLNWS,BUSANL";

   for (var i = 0; i < worldNews.length; i++)  {
     worldNews[i] = new Option (worldNewsOptions[i][0], worldNewsOptions[i][1]);
   }

    newsTypeOptions[0] =  worldNews; 

}

function loadNewsWires(arraySize, newsTypeOptions) {

  var newsWiresOptions = new Array (arraySize);
  var newsWires = new Array(arraySize);

  for (var j = 0; j < newsWiresOptions.length; j++)  {
	newsWiresOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   newsWiresOptions[0][0] = "All available wire reports";
   newsWiresOptions[0][1] = "NEWS;WIRES";

   for (var i = 0; i < newsWires.length; i++)  {
     newsWires[i] = new Option (newsWiresOptions[i][0], newsWiresOptions[i][1]);
   }

   newsTypeOptions[0] =  newsWires;
}

function loadNewsTranscripts(arraySize, newsTypeOptions) {

  var newsTranscriptsOptions = new Array (arraySize);
  var newsTranscripts = new Array(arraySize);

  for (var j = 0; j < newsTranscriptsOptions.length; j++)  {
	newsTranscriptsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   newsTranscriptsOptions[0][0] = "All Transcripts";
   newsTranscriptsOptions[0][1] = "NEWS;SCRIPT";

   newsTranscriptsOptions[1][0] = "ABC News Transcripts";
   newsTranscriptsOptions[1][1] = "NEWS;ABCNEW";

   newsTranscriptsOptions[2][0] = "Burrelle's";
   newsTranscriptsOptions[2][1] = "NEWS;BURTRN";

   newsTranscriptsOptions[3][0] = "CBS News Transcripts";
   newsTranscriptsOptions[3][1] = "NEWS;CBSNEW";

   newsTranscriptsOptions[4][0] = "CNBC News";
   newsTranscriptsOptions[4][1] = "NEWS;CNBC";

   newsTranscriptsOptions[5][0] = "CNBC/Dow Jones Business Video";
   newsTranscriptsOptions[5][1] = "NEWS;CNBCDJ";

   newsTranscriptsOptions[6][0] = "CNN Transcripts";
   newsTranscriptsOptions[6][1] = "NEWS;CNN";

   newsTranscriptsOptions[7][0] = "CNNFn Transcripts";
   newsTranscriptsOptions[7][1] = "NEWS;CNNFN";

   newsTranscriptsOptions[8][0] = "Fox News Network Transcripts";
   newsTranscriptsOptions[8][1] = "NEWS;FOXNWS";

   newsTranscriptsOptions[9][0] = "National Public Radio Transcripts";
   newsTranscriptsOptions[9][1] = "NEWS;NPR";

   newsTranscriptsOptions[10][0] = "NBC News Transcripts";
   newsTranscriptsOptions[10][1] = "NEWS;NBCNEW";

   newsTranscriptsOptions[11][0] = "Newshour with Jim Lehrer";
   newsTranscriptsOptions[11][1] = "NEWS;NEWSHR";

   newsTranscriptsOptions[12][0] = "Nightly Business Report";
   newsTranscriptsOptions[12][1] = "NEWS;NBR";

   newsTranscriptsOptions[13][0] = "Official Kremlin Intnl News Broadcast";
   newsTranscriptsOptions[13][1] = "NEWS;SOVNWS";

   newsTranscriptsOptions[14][0] = "Political Transcripts";
   newsTranscriptsOptions[14][1] = "NEWS;ELCTPR,POLSUM,POLTRN,CNGTST,FEDNEW,NNNTRN";


   for (var i = 0; i < newsTranscripts.length; i++)  {
     newsTranscripts[i] = new Option (newsTranscriptsOptions[i][0], newsTranscriptsOptions[i][1]);
   }

   newsTypeOptions[0] =  newsTranscripts; 

}

function loadArtsAndSportsNews(arraySize, newsTypeOptions) {

  var artsAndSportsNewsOptions = new Array (arraySize);
  var artsAndSportsNews = new Array(arraySize);

  for (var j = 0; j < artsAndSportsNewsOptions.length; j++)  {
	artsAndSportsNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   artsAndSportsNewsOptions[0][0] = "Book, movie, music, & play reviews";
   artsAndSportsNewsOptions[0][1] = "ENTERT;REVIEW";

   artsAndSportsNewsOptions[1][0] = "Entertainment news";
   artsAndSportsNewsOptions[1][1] = "ENTERT;ALLNWS";

   artsAndSportsNewsOptions[2][0] = "Sports News";
   artsAndSportsNewsOptions[2][1] = "SPORTS;ALLNWS";

   for (var i = 0; i < artsAndSportsNews.length; i++)  {
     artsAndSportsNews[i] = new Option (artsAndSportsNewsOptions[i][0], artsAndSportsNewsOptions[i][1]);
   }

    newsTypeOptions[0] =  artsAndSportsNews; 

}

function loadNonEnglishNews(arraySize, newsTypeOptions) {

  var nonEnglishNewsOptions = new Array (arraySize);
  var nonEnglishNews = new Array(arraySize);

  for (var j = 0; j < nonEnglishNewsOptions.length; j++)  {
	nonEnglishNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   nonEnglishNewsOptions[0][0] = "Dutch Language News";
   nonEnglishNewsOptions[0][1] = "NEWS;NIEUWS";

   nonEnglishNewsOptions[1][0] = "French Language News";
   nonEnglishNewsOptions[1][1] = "NEWS;PRESSE";

   nonEnglishNewsOptions[2][0] = "German Language News";
   nonEnglishNewsOptions[2][1] = "NEWS;ZEITNG";

   nonEnglishNewsOptions[3][0] = "Italian Language News";
   nonEnglishNewsOptions[3][1] = "NEWS;STAMPA";

   nonEnglishNewsOptions[4][0] = "Portuguese Language News";
   nonEnglishNewsOptions[4][1] = "NSAMER;NOTIS";

   nonEnglishNewsOptions[5][0] = "Spanish Language News";
   nonEnglishNewsOptions[5][1] = "NEWS;NOTCIA";


   for (var i = 0; i < nonEnglishNews.length; i++)  {
     nonEnglishNews[i] = new Option (nonEnglishNewsOptions[i][0], nonEnglishNewsOptions[i][1]);
   }

    newsTypeOptions[0] =  nonEnglishNews; 

}

function loadBusinessNews(arraySize, newsTypeOptions) {

  var businessNewsOptions = new Array (arraySize);
  var businessNews = new Array(arraySize);

  for (var j = 0; j < businessNewsOptions.length; j++)  {
	businessNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   businessNewsOptions[0][0] = "Business & Finance";
   businessNewsOptions[0][1] = "BUSFIN;ALLNWS,B&ISEL";

   businessNewsOptions[1][0] = "Industry News";
   businessNewsOptions[1][1] = "MARKET;INDNWS,BMPSEL,CWISEL";

   businessNewsOptions[2][0] = "Mergers & Acquisitions";
   businessNewsOptions[2][1] = "COMPNY;M&ANWS";

   businessNewsOptions[3][0] = "Knight Ridder/Tribune Business News";
   businessNewsOptions[3][1] = "NEWS;KRTBUS";

   for (var i = 0; i < businessNews.length; i++)  {
     businessNews[i] = new Option (businessNewsOptions[i][0], businessNewsOptions[i][1]);
   }

    newsTypeOptions[0] =  businessNews; 

}

function loadLegalNews(arraySize, newsTypeOptions) {

  var legalNewsOptions = new Array (arraySize);
  var legalNews = new Array(arraySize);

  for (var j = 0; j < legalNewsOptions.length; j++)  {
	legalNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   legalNewsOptions[0][0] = "Legal News";
   legalNewsOptions[0][1] = "LEGNEW;ALLNWS";

   for (var i = 0; i < legalNews.length; i++)  {
     legalNews[i] = new Option (legalNewsOptions[i][0], legalNewsOptions[i][1]);
   }

   newsTypeOptions[0] =  legalNews;
}

function loadUniversityNews(arraySize, newsTypeOptions) {

  var universityNewsOptions = new Array (arraySize);
  var universityNews = new Array(arraySize);

  for (var j = 0; j < universityNewsOptions.length; j++)  {
	universityNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   universityNewsOptions[0][0] = "The Chronicle of Higher Education";
   universityNewsOptions[0][1] = "NEWS;CHEDUC";

   universityNewsOptions[1][0] = "University Wire";
   universityNewsOptions[1][1] = "NEWS;UWIRE";

   for (var i = 0; i < universityNews.length; i++)  {
     universityNews[i] = new Option (universityNewsOptions[i][0], universityNewsOptions[i][1]);
   }

    newsTypeOptions[0] =  universityNews; 

}

function loadMedicalNews(arraySize, newsTypeOptions) {

  var medNewsOptions = new Array (arraySize);
  var medNews = new Array(arraySize);

  for (var j = 0; j < medNewsOptions.length; j++)  {
	medNewsOptions[j] = new Array(2);
  }

   // These values for the option objects are static and can change.
   medNewsOptions[0][0] = "Medical & Health News";
   medNewsOptions[0][1] = "GENMED;ALLNWS";

   for (var i = 0; i < medNews.length; i++)  {
     medNews[i] = new Option (medNewsOptions[i][0], medNewsOptions[i][1]);
   }

   newsTypeOptions[0] =  medNews;
}



function assignSrcCatOptValues(form, newsType) {
  
  var i = 0;

  clearArray(form.srccat.options);  

  form.srccat.options[0] = new Option ("Please select from list below                       ", "");


  for (var j = 0; j < newsTypeOptions[0].length; j++) {
     form.srccat.options[j+1] = newsTypeOptions[0][j];
  }
  // Need to explicitly set the selectedIndex to the first item in the
  // list for Netscape 4.x browsers. But if there's only one real item
  // in the list, make it the default.
  if (newsTypeOptions[0].length > 1)
    form.srccat.selectedIndex = 0;
  else
    form.srccat.selectedIndex = 1;
  form.srccat.options.length = newsTypeOptions[0].length + 1;

}

function loadStdSegments(arraySize, thisForm, idx1, idx3, idx5) {

   var i;
   var stdSegments = new Array(arraySize);

   clearArray(thisForm.S1.options);
   clearArray(thisForm.S3.options);
   clearArray(thisForm.S5.options);


   for (i = 0; i < stdSegments.length; i++) {
      stdSegments[i] = new Array(2);
   }

   stdSegments[0][0] = "Headline, Lead Paragraph(s), Terms";
   stdSegments[0][1] = "HLEAD";

   stdSegments[1][0] = "Headline";
   stdSegments[1][1] = "Headline";
    
   stdSegments[2][0] = "Full Text";
   stdSegments[2][1] = "NoSeGmEnT";

   stdSegments[3][0] = "Caption";
   stdSegments[3][1] = "graphic";

   stdSegments[4][0] = "Author";
   stdSegments[4][1] = "byline";
    
   for (i = 0; i < stdSegments.length; i++) {
     thisForm.S1.options[i] = new Option(stdSegments[i][0], stdSegments[i][1]); 
     thisForm.S3.options[i] = new Option(stdSegments[i][0], stdSegments[i][1]); 
     thisForm.S5.options[i] = new Option(stdSegments[i][0], stdSegments[i][1]); 
   }
   thisForm.S1.selectedIndex = idx1;
   thisForm.S3.selectedIndex = idx3;
   thisForm.S5.selectedIndex = idx5;
   thisForm.S1.options.length = stdSegments.length;
   thisForm.S3.options.length = stdSegments.length;
   thisForm.S5.options.length = stdSegments.length;
    
} 

function loadTranscriptSegments(arraySize, thisForm) {

   var i;
   var segments = new Array(arraySize);

   clearArray(thisForm.S1.options);
   clearArray(thisForm.S3.options);
   clearArray(thisForm.S5.options);

   for (i = 0; i < segments.length; i++) {
      segments[i] = new Array(2);
   }

   segments[0][0] = "Headline, Lead Paragraph(s), Terms";
   segments[0][1] = "HLEAD";

   segments[1][0] = "Headline";
   segments[1][1] = "Headline";
    
   segments[2][0] = "Full Text";
   segments[2][1] = "NoSeGmEnT";

   segments[3][0] = "Location";
   segments[3][1] = "geographic";

   segments[4][0] = "Show";
   segments[4][1] = "Show";
    
    
   for (i = 0; i < segments.length; i++) {
     thisForm.S1.options[i] = new Option(segments[i][0], segments[i][1]); 
     thisForm.S3.options[i] = new Option(segments[i][0], segments[i][1]); 
     thisForm.S5.options[i] = new Option(segments[i][0], segments[i][1]); 
   }
   // Need to explicitly set the selectedIndex to the first item in the
   // list for Netscape 4.x browsers. 
   thisForm.S1.selectedIndex = 0;
   thisForm.S3.selectedIndex = 0; 
   thisForm.S5.selectedIndex = 0; 
   thisForm.S1.options.length = segments.length;
   thisForm.S3.options.length = segments.length;
   thisForm.S5.options.length = segments.length;
    
} 

function loadBusinessSegments(arraySize, thisForm) {

   var i;
   var segments = new Array(arraySize);

   clearArray(thisForm.S1.options);
   clearArray(thisForm.S3.options);
   clearArray(thisForm.S5.options);

   for (i = 0; i < segments.length; i++) {
      segments[i] = new Array(2);
   }

   segments[0][0] = "Headline, Lead Paragraph(s), Terms";
   segments[0][1] = "HLEAD";

   segments[1][0] = "Headline";
   segments[1][1] = "Headline";
    
   segments[2][0] = "Full Text";
   segments[2][1] = "NoSeGmEnT";

   segments[3][0] = "Caption";
   segments[3][1] = "graphic";

   segments[4][0] = "Author";
   segments[4][1] = "byline";
    
   segments[5][0] = "Company Name";
   segments[5][1] = "Company";

   segments[6][0] = "Location";
   segments[6][1] = "geographic";
    
   segments[7][0] = "Ticker Symbol";
   segments[7][1] = "Ticker";

   for (i = 0; i < segments.length; i++) {
     thisForm.S1.options[i] = new Option(segments[i][0], segments[i][1]); 
     thisForm.S3.options[i] = new Option(segments[i][0], segments[i][1]); 
     thisForm.S5.options[i] = new Option(segments[i][0], segments[i][1]); 
   }
   // Need to explicitly set the selectedIndex to the first item in the
   // list for Netscape 4.x browsers. 
   thisForm.S1.selectedIndex = 0;
   thisForm.S3.selectedIndex = 0; 
   thisForm.S5.selectedIndex = 0; 
   thisForm.S1.options.length = segments.length;
   thisForm.S3.options.length = segments.length;
   thisForm.S5.options.length = segments.length;
} 

function loadNonEnglishSegments(arraySize, thisForm) {

   var i;
   var segments = new Array(arraySize);

   clearArray(thisForm.S1.options);
   clearArray(thisForm.S3.options);
   clearArray(thisForm.S5.options);


   for (i = 0; i < segments.length; i++) {
      segments[i] = new Array(2);
   }

   segments[0][0] = "Headline                                           ";
   segments[0][1] = "Headline";
    
   segments[1][0] = "Full Text";
   segments[1][1] = "NoSeGmEnT";

   segments[2][0] = "Caption";
   segments[2][1] = "graphic";

   segments[3][0] = "Author";
   segments[3][1] = "byline";
    
   for (i = 0; i < segments.length; i++) {
     thisForm.S1.options[i] = new Option(segments[i][0], segments[i][1]); 
     thisForm.S3.options[i] = new Option(segments[i][0], segments[i][1]); 
     thisForm.S5.options[i] = new Option(segments[i][0], segments[i][1]); 
   }
   // Need to explicitly set the selectedIndex to the first item in the
   // list for Netscape 4.x browsers. 
   thisForm.S1.selectedIndex = 0;
   thisForm.S3.selectedIndex = 0; 
   thisForm.S5.selectedIndex = 0; 
   thisForm.S1.options.length = segments.length;
   thisForm.S3.options.length = segments.length;
   thisForm.S5.options.length = segments.length;
    
} 

function assignSegmentValues(form) {

  var i = 0;
 
  var newsType = "";
  var seg1SelectedIndex = 0;
  var seg3SelectedIndex = 0;
  var seg5SelectedIndex = 0;

  if (form.prevNewsType.value != "Business News"             &&
      form.prevNewsType.value != "Non-English Language News" &&
      form.prevNewsType.value != "News Transcripts")    {
       seg1SelectedIndex = form.S1.selectedIndex; 
       seg3SelectedIndex = form.S3.selectedIndex; 
       seg5SelectedIndex = form.S5.selectedIndex; 
  }
  
  for (i = 0; i < form.newscat.length; i++)  {
     if (form.newscat.options[i].selected){
            newsType = form.newscat.options[i].value;
         break;
     }
  } 

  form.prevNewsType.value = newsType;

  switch (newsType) {
    
     case "Business News":
       loadBusinessSegments(8, form);
       break;

     case "Non-English Language News":
       loadNonEnglishSegments(4, form);
       break;

     case "News Transcripts":
       loadTranscriptSegments(5, form);
       break;

     default:
       loadStdSegments(5, form, seg1SelectedIndex,
                       seg3SelectedIndex, seg5SelectedIndex);
       break;
  }
}

function setSrccatSelected(form) {
  
  var i = 0;
  var newsType = "";
  var gnalias = String(form.gnalias.value);

  if (form.newscat.options[0].selected) {
    newsType = form.newscat.options[0].value;
    if (gnalias.search(/biznews\.html$/) >= 0) {
       form.newscat.options[9].selected = true;
       newsType = form.newscat.options[9].value;
    } else if (gnalias.search(/legnews\.html$/) >= 0) {
       form.newscat.options[10].selected = true;
       newsType = form.newscat.options[10].value;
    } else if (gnalias.search(/mednews\.html$/) >= 0) {
       form.newscat.options[12].selected = true;
       newsType = form.newscat.options[12].value;
    }
  } else {
    for (i = 1; i < form.newscat.length; i++)  {
       if (form.newscat.options[i].selected) {
           newsType = form.newscat.options[i].value;
           break;
       }
    } 
  }

  if (newsType.length > 0 ) {
     loadArrays(newsType);
     form.srccat.options[0] = new Option ("Please select from list below                       ");

      for (var j = 0; j < newsTypeOptions[0].length; j++) {
            form.srccat.options[j+1] =  newsTypeOptions[0][j];
            if (form.srccat.options[j+1].value == form.srcSelected.value) {
               // Interesting note, Netscape 6.1 didn't "select" the 
               // option when this was used, but it did in IE6.026:
               // form.srccat.options[j+1].selected = true;
               // the selectedIndex below worked in both IE and Netscape 6.1
                form.srccat.selectedIndex = j+1;
            } else if (newsTypeOptions[0].length == 1) {
                form.srccat.selectedIndex = 1;
            }
     }
  // Need do to this since we had to place 15 (arbitrary number, but enough to
  // look "good") blank option values in the srccat drop-down for Netscape 4.x.
  // Without this code, srccats with < 15 options would have blanks at the end
  // of the drop-down.         
  form.srccat.options.length = newsTypeOptions[0].length + 1;
  }
}

function setSegmentSelected(form) {
  
   assignSegmentValues(form);
   for (var j = 0; j < form.S1.options.length; j++) {
         if (form.S1.options[j].value == form.seg1Selected.value) {
             // Interesting note, Netscape 6.1 didn't "select" the 
             // option when this was used, but it did in IE6.026:
             // form.srccat.options[j+1].selected = true;
             // the selectedIndex below worked in both IE and Netscape 6.1
              form.S1.selectedIndex = j;
          }
   }
   for (var j = 0; j < form.S3.options.length; j++) {
         if (form.S3.options[j].value == form.seg3Selected.value) {
              form.S3.selectedIndex = j;
          }
   }
   for (var j = 0; j < form.S5.options.length; j++) {
         if (form.S5.options[j].value == form.seg5Selected.value) {
              form.S5.selectedIndex = j;
          }
   }
}



function submitForm(theForm, theAction) {

      var srcIndex = theForm.srccat.selectedIndex;
      var newsIndex = theForm.newscat.selectedIndex;
      var seg1Index = theForm.S1.selectedIndex;
      var seg3Index = theForm.S3.selectedIndex;
      var seg5Index = theForm.S5.selectedIndex;
      var nonRdsSrc = "COMPNY;M&ANWS";

      if ((theForm.newscat.options[newsIndex].value == ""  ||
           theForm.srccat.options[srcIndex].value == "" )  &&
           theAction != 'Clear Form'){
         alert("You must choose a News Category and a News Source before submitting your search or selecting from the source list.");
         return false;
      }
     
      if (!chkSeg(theForm.S1.options[seg1Index].value,
                  theForm.S3.options[seg3Index].value,
                  theForm.S5.options[seg5Index].value,
                  theForm.srccat.options[srcIndex].value)) {
          return false;
      }
 
      if (theAction == 'List Sources') {
         theForm.imageSubmit.value = "listsources.x";
         theForm.formSubmit.value = "";
      }
      else {
         theForm.formSubmit.value = theAction;
         theForm.imageSubmit.value = "";
      }
      if (theForm.newscat.options[newsIndex].value == 'Business News' &&
          theForm.srccat.options[srcIndex].value != nonRdsSrc) 
         theForm.rds.value = "1";

      setsBeforeSubmit(theForm);
      theForm.submit();
      return false;
}
 
function chkSeg(S1, S3, S5, srccat) {

    var loc = "geographic";
    var source = "NEWS;CBSNEW";
    var rc = true;

    if (srccat == source && (S1 == loc  || S3 == loc  || S5 == loc)) {
             alert("Location is not a valid segment for this source. Please choose another segment and try your search again.");
             rc = false;
    }
    return rc;
}

function enterKeySubmit(form) {
   form.imageSubmit.value = "";
   setsBeforeSubmit(form);
}

function setsBeforeSubmit(theForm) {

   var srcIndex = theForm.srccat.selectedIndex;
   var newsIndex = theForm.newscat.selectedIndex;
   var seg1Index = theForm.S1.selectedIndex;
   var seg3Index = theForm.S3.selectedIndex;
   var seg5Index = theForm.S5.selectedIndex;

   theForm.srcSelected.value = theForm.srccat.options[srcIndex].value
   theForm.seg1Selected.value = theForm.S1.options[seg1Index].value
   theForm.seg3Selected.value = theForm.S3.options[seg3Index].value
   theForm.seg5Selected.value = theForm.S5.options[seg5Index].value
}
