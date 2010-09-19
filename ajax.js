/*
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var AJAX = {};

AJAX.get = function(url, callback, postdata, cfg) {
  var item = window.jsconsole.createItem();
  item.addText("loading " + url);
	
	window.jsconsole.addItem(item);
	
	var cb = function(data) {
	  item.remove();
	  callback(data);
	}
	
	AJAX._getData(url, cb, postdata, "text", cfg);
}

AJAX._parseData = function(response, type, cfg) {
	if (type == "text") {
		return "" + response.responseText;;
	}
}

AJAX._getData = function(url, callback, postdata, type, cfg) {
    /*
     * This is a mind-warping function to load a string indexed array of data urls, and
     * only do callback when everthing is done  
     */
  if (typeof(url) != "string") {
		var results = {};
		var wrapper = function(nindex) {
		    return function(data) {
				results[nindex] = data;
				var alldone = true;
				for (var i in url) {
			      if (url[i]) {
					if (!results[i]) { alldone = false; };
				  }
				}
				if (alldone) {
					callback(results);
				}
			};
		}
    var num = 0;
		for (var i in url) {
			if (url[i]) {
			    AJAX._getSingleData(url[i] + "", wrapper(i + ""), postdata, type, cfg);
			}
      num++;
		}
	} else {
		return AJAX._getSingleData(url, callback, postdata, type, cfg);
	}
}

AJAX.xmlhttprequestpool = [];
AJAX._getSingleData = function(url, callback, postdata, type, cfg) {
    var listener = function(response) {
       callback(AJAX._parseData(response, type, cfg));
    }
    var request = AJAX.getXMLHttpRequest();
    var query = "";
    if (postdata) {
      request.open("POST", url, true);
      if (typeof(postdata) == "string") {
         query = postdata;
      } else {
        for (var i in postdata) {
          query += i + "=" + escape(postdata[i]) + "&";
        }
      }
    } else {
      request.open("GET", url, true);
    }
    
    try {
      request.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    } catch(er) {
        // nothing
    }
    var funk = function() {
        var status;
        try { status = request.status; } catch (er) { status = 404; }
        if(status==200) {
          listener(request);
          request.abort();
        } else {
          request.abort();
          listener(false);
        }
        AJAX.xmlhttprequestpool.push(request);
        request = null;
    }
    
    if (window.navigator && window.navigator.userAgent && window.navigator.userAgent.indexOf("Firefox/3.5") > -1){ // working aroung errors in firefox 3.5 + firebug > 1.4 combination  
      request.onload = request.onerror = function(){
        funk();
      };
    } else {
      request.onreadystatechange = function() {
        if(request && request.readyState==4) {
          funk();
        }
      }
    }    
    request.send(query);
}


AJAX.progID = null;
AJAX.progID_checked = false;


AJAX.getXMLHttpRequest = function() {
    if (window) {
      if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
      }
      if (!AJAX.progID) {
        if (!AJAX.progID_checked) {
          // MS recommends using only versions 3 & 6. Other major versions have problems.
          var list = [
          "Msxml2.XMLHTTP.6.0", 
          "MSXML2.XMLHTTP.3.0", 
          "MSXML2.XMLHTTP", 
          "Microsoft.XMLHTTP", 
          "XMLHTTP", 
          new Array("XMLHTTP", 4)
          ];
          var found = false;
          for (var i = 0; i < list.length && !found; i++) {
            try {
              var test = new ActiveXObject(list[i]);
              AJAX.progID = list[i];
              found = true;
            } catch(er) {
              // TODO: error handling, could not init MS XML
            }
          }
          AJAX.progID_checked = true;
        }
      }
      if (AJAX.progID) {
        return new ActiveXObject(AJAX.progID);
      }
      return null;
    }
}


