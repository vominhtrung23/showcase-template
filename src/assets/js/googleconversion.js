var googleConversionLabel = ''; 
var googleConversionId = '';
var googleConversionPhoneNo = "";
function loadGConversion() {
    if (typeof(SUPPLIER_PARAMS) != 'undefined' && typeof(cspConsumerInfo) != 'undefined') {
        googleConversionLabel = SUPPLIER_PARAMS.find(x => x.name == 'Google_Conversion_Label')?.value; 
        googleConversionId = SUPPLIER_PARAMS.find(x => x.name == 'Google_Conversion_ID')?.value;
        googleConversionPhoneNo = cspConsumerInfo["phoneNumber"];
    }
    if (typeof(googleTagId) != 'undefined' && googleTagId != '') {
        try {
            ga = gaData = gaGlobal = gaplugins = google_tag_manager = dataLayer = undefined;
            var gScriptTags = jQuery('script[src*="www.google"]');
            var gStaticScriptTags = jQuery('script[src*="www.gstatic.com"]');
            gScriptTags.remove();
            //gStaticScriptTags.remove();
        } catch (exc) {}
        (function(w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s),
                dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src =
                '//www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', googleTagId);
    }
    else if (typeof(googleConversionId) != 'undefined' && googleConversionId != '' && typeof(googleConversionLabel) != 'undefined' && googleConversionLabel != '') {
        if (typeof(gtag) == 'undefined') {
            (function(w, d, s, l, i) {
                w[l] = w[l] || [];
                w[l].push({
                    'gtm.start': new Date().getTime()
                });
                var f = d.getElementsByTagName(s)[0],
                    j = d.createElement(s),
                    dl = l != 'dataLayer' ? '&l=' + l : '';
                j.async = true;
                j.src =
                    '//www.googletagmanager.com/gtag/js?id=' + i + dl;
                f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', 'AW-' + googleConversionId);
        }
    }

    if (typeof(googleConversionId) != 'undefined' && googleConversionId != '' && typeof(googleConversionLabel) != 'undefined' && googleConversionLabel != '') {

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        //gtag('config', 'AW-' + googleConversionId);
        setTimeout(function() {
            var conversionPhoneNo = typeof(googleConversionPhoneNo) != 'undefined' ? googleConversionPhoneNo : '';
            //console.log(conversionPhoneNo);
            gtag('config', 'AW-' + googleConversionId + '/' + googleConversionLabel, {
                'phone_conversion_number': conversionPhoneNo,
                'phone_conversion_css_class': 'gconversion-trigger',
                'phone_conversion_callback': function(formatted_number, mobile_number) {
                    var x = document.getElementsByClassName("gconversion-trigger");
                    //console.log(x);
                    var i;
                    for (i = 0; i < x.length; i++) {
                        x[i].innerHTML = "";
                        x[i].appendChild(document.createTextNode(formatted_number));
                    }
                }
            });

            if (typeof(googleConversionPhoneNo) != 'undefined' && googleConversionPhoneNo != '')
                _googWcmGet('gforwarding-trigger', googleConversionPhoneNo);
        }, 200);
    }
}