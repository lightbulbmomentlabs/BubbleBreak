// CSS Loader - Fallback for deferred CSS loading
(function() {
    'use strict';

    // Function to load CSS if preload fails
    function loadCSS(href, before, media) {
        var doc = window.document;
        var ss = doc.createElement("link");
        var ref;
        if (before) {
            ref = before;
        } else {
            var refs = (doc.body || doc.getElementsByTagName("head")[0]).childNodes;
            ref = refs[refs.length - 1];
        }

        var sheets = doc.styleSheets;
        ss.rel = "stylesheet";
        ss.href = href;
        ss.media = "only x";

        function ready(cb) {
            if (doc.body) {
                return cb();
            }
            setTimeout(function() {
                ready(cb);
            });
        }

        ready(function() {
            ref.parentNode.insertBefore(ss, (before ? ref : ref.nextSibling));
        });

        var onloadcssdefined = function(cb) {
            var resolvedHref = ss.href;
            var i = sheets.length;
            while (i--) {
                if (sheets[i].href === resolvedHref) {
                    return cb();
                }
            }
            setTimeout(function() {
                onloadcssdefined(cb);
            });
        };

        function loadCB() {
            if (ss.addEventListener) {
                ss.removeEventListener("load", loadCB);
            }
            ss.media = media || "all";
        }

        if (ss.addEventListener) {
            ss.addEventListener("load", loadCB);
        }
        ss.onloadcssdefined = onloadcssdefined;
        onloadcssdefined(loadCB);
        return ss;
    }

    // Load critical stylesheets if they haven't loaded after 100ms
    setTimeout(function() {
        var stylesheets = [
            'styles.css?v=2024.1',
            'article-styles.css?v=2024.1'
        ];

        stylesheets.forEach(function(href) {
            var loaded = false;
            var sheets = document.styleSheets;

            // Check if stylesheet is already loaded
            for (var i = 0; i < sheets.length; i++) {
                if (sheets[i].href && sheets[i].href.indexOf(href) !== -1) {
                    loaded = true;
                    break;
                }
            }

            // Load if not found
            if (!loaded) {
                console.log('Loading fallback CSS:', href);
                loadCSS(href);
            }
        });
    }, 100);
})();