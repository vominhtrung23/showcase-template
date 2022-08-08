//iframed
(function($, $$) {
    if (typeof ($$.log) == "undefined") {
        $$.log = function(obj) {
            if (typeof (console) != "undefined")
                console.log(obj);
        };
    }

    var attached = false;
    var clientFrameId;
    var parentUrl;
    var intervalId;
    var legacy = (typeof (window.postMessage) == "undefined");
    //legacy = true;

    var obj2str = function(obj) {
        try {
            var str = "";
            for (var key in obj) {
                str += key + "=" + obj[key] + "&";
            }
            return str.substring(0, str.length - 1);
        } catch (ex) { }
    };

    var str2obj = function(str) {
        try {
            var obj = {};
            var arr = str.split("&");
            for (var i = 0; i < arr.length; i++) {
                var pair = arr[i].split("=");
                obj[pair[0]] = pair[1];
            }
            return obj;
        } catch (ex) {
            return null;
        }
    };

    //default size function, can be over written;
	/*
    var size_function = function() {
        return { x: $("body", document).width(), y: $("body", document).height() };
    }
	*/
    var size_function = function() {
        var MAX_HEIGHT = null, MAX_WIDTH = null;
        if (window.innerHeight) {
            MAX_HEIGHT = window.innerHeight;
            MAX_WIDTH = window.innerWidth;
        } else if (document.documentElement.clientHeight == 0) {
            MAX_HEIGHT = document.body.clientHeight;
            MAX_WIDTH = document.body.clientWidth;
        } else {
            MAX_HEIGHT = document.documentElement.clientHeight;
            MAX_WIDTH = document.documentElement.clientWidth;
        }

        /*
        if(window.innerWidth)
        MAX_WIDTH = window.innerWidth;
        else if(document.documentElement.clientWidth == 0)
        MAX_WIDTH = document.body.clientWidth;
        else
        MAX_WIDTH = document.documentElement.clientWidth;
        */

        //TODO: force it until we find a solution. This might inaccurate in other pages
        if (MAX_WIDTH == 300) MAX_WIDTH = 730;

        return { x: MAX_WIDTH, y: MAX_HEIGHT };
    };
	

    var listener = function(e) {
		/*
        $$.log("message recived:" + e.data);
        var data = str2obj(e.data);

        if (data && data.id) {
            $("#" + data.id).trigger("resize", [parseInt(data.x), parseInt(data.y)]);
        }
		*/
        $$.log("message recived:" + e.data);
        var data = str2obj(e.data);

        if (data && data.id) {
            // $("#" + data.id).trigger("resize", [parseInt(data.x), parseInt(data.y)]);
            if (data.id == "TB_iframeContent") {
                var MAX_HEIGHT = null;
                if (window.innerHeight)
                    MAX_HEIGHT = window.innerHeight;
                else if (document.documentElement.clientHeight == 0)
                    MAX_HEIGHT = document.body.clientHeight;
                else
                    MAX_HEIGHT = document.documentElement.clientHeight;

                //var o = document.getElementById(data.id); 
				//if a campaign is loaded onto the same page then it also has opt 1 as it's id
				//var o = $("iframe#" + data.id)[0]; didn't work properly in IE 7
				var o = $("iframe[id="+data.id+"]")[0];
				
                if (data.y == 0 || data.y > MAX_HEIGHT && MAX_HEIGHT > 0) {
                    data.y = MAX_HEIGHT - 50; // 50 pixels margin for the lightbox shadow 
                }

                var MAX_WIDTH = document.getElementById("TB_window").offsetWidth;
                if (data.x == 0 || data.x > MAX_WIDTH && MAX_WIDTH > 0) {
                    data.x = MAX_WIDTH - 50;  // 50 pixels margin for the lightbox shadow
                }
                if (data.x == 0) { //set a default width
                    data.x = 700;
                }
				if(typeof (o) != 'undefined')
					{
					o.style.height = parseInt(data.y) + "px";
					o.style.width = parseInt(data.x) + "px";
					}
            } else {
                //var o = document.getElementById(data.id);
				//if a campaign is loaded onto the same page then it also has opt 1 as it's id
				//var o = $("iframe#" + data.id)[0];//document.getElementById(data.id);
				var o = $("iframe[id="+data.id+"]")[0];
                var mf = document.getElementById("mainFlyout");
                if(typeof (o) != 'undefined')
					{
					o.style.height = parseInt(data.y) + "px";
					o.style.width = parseInt(data.x) + "px";
					}
                if (mf) {
                    mf.style.height = parseInt(data.y) + "px";
                    mf.style.width = parseInt(data.x) + "px";
                }
            }
            //$("#" + data.id).trigger("resize", [parseInt(data.x), parseInt(data.y)]);
        }
		
    };

    var listener_legacy = function() {
        var msg;
        var href = window.location.href;
        var index = null;
        try {
            index = href.indexOf("#");
            if (index != -1) {
                msg = href.substring(index + 1);
                if (msg) {
                    try {
                        listener({ data: msg });
                    } catch (Error) { }
                    window.location = href.substring(0, index + 1);
                }
            }
        } catch (Error) {
            //do nothing
        }
    };


    var methods = {
        //turns normal iframe to dynamic iframe
        constructor: function() {
            return $(this)
				.bind({
				    resize: function(event, x, y) {
				        $(this).width(x);
				        $(this).height(y);
				    }
				});
        }
		, startHost: function() {
		    if (!attached) {
		        if (typeof (window.addEventListener) != 'undefined')
		            window.addEventListener('message', listener, false);
		        else
		            window.attachEvent('onmessage', listener);
		        attached = true;
		    }
		}
		, startClient: function(elementId, parent_url, custom_size) {
		    if (window != window.top) {
		        if (custom_size) size_function = custom_size;
		        clientFrameId = elementId;
		        parentUrl = parent_url;

		        $(document).click(function() {
		            methods.sendTop(size_function());
		        });

		        $(document).ready(function() {
		            methods.sendTop(size_function());
                });
                
                $(window).on('load', function(){
                    setTimeout(function(){
						methods.sendTop(size_function());
					},50);
                });

                $(window).on('load', function(){
                    setTimeout(function(){
						methods.sendTop(size_function());
					},2000); // do it again 2 seconds later JIC
                });
				/*
				$(window).load(function() {
					setTimeout(function(){
						methods.sendTop(size_function());
					},50);
		        });
				$(window).load(function() {
					setTimeout(function(){
						methods.sendTop(size_function());
					},2000); // do it again 2 seconds later JIC
                });
                */
		    }
		}
		, sendTop: function(msg) {
            msg.id = clientFrameId;
		    window.top.postMessage(obj2str(msg), "*");
		}
    };

    var methods_legacy = {
        constructor: methods.constructor //same as normal constructor
		, startHost: function() {
		    if (!attached) {
		        intervalId = setInterval(listener_legacy, 25);
		        attached = true;
		        setTimeout(function() {
		            clearInterval(intervalId);
		            intervalId = setInterval(listener_legacy, 200);
		        }, 5000);
		    }
		}
		, startClient: function(elementId, parent_url, custom_size) {
		    if (window != window.top) {
		        if (custom_size) size_function = custom_size;
		        clientFrameId = elementId;
		        var index = parent_url.indexOf("#");
		        if (index == -1) {
		            parentUrl = parent_url;
		        } else {
		            parentUrl = parent_url.substring(0, index);
		            $$.log(parentUrl);
		        }

		        $(document).click(function() {
		            methods_legacy.sendTop(size_function());
		        });

		        $(document).ready(function() {
		            methods_legacy.sendTop(size_function());
		        });
				
				$(window).load(function() {
					setTimeout(function(){
						methods_legacy.sendTop(size_function());
					},50);
		        });
		    }
		}
		, sendTop: function(msg) {
		    msg.id = clientFrameId;
		    if (parentUrl) {
		        var url = parentUrl + "#" + obj2str(msg);
		        //alert(url);
		        window.top.location = url;
		    }
		}
    };

    $.fn.iframed = function(method) {
        // Method calling logic
        if (legacy) {
            if (methods_legacy[method]) {
                return methods_legacy[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods_legacy.constructor.apply(this, arguments);
            } else {
                $.error('Method (legacy) ' + method + ' does not exist on jQuery.iframed');
            }
        } else {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.constructor.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.iframed');
            }
        }
    };

})((typeof (CSP_GLOBAL) != "undefined" ? CSP_GLOBAL.jQuery : jQuery),
   (typeof (CSP_GLOBAL) != "undefined" ? CSP_GLOBAL : {}));
/*
if (typeof (CSP_GLOBAL) != "undefined") {
    (function($$) {
        try {
            var scriptname = "iframed.js";
            $$.scriptMap[scriptname].ready = true;
            $$.processQueue(scriptname);
        } catch (ex) {
            $$.log(ex);
        };
    })(CSP_GLOBAL);
}
*/