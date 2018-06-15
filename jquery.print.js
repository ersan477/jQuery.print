/* @license 
 * jQuery.print, version 1.5.1 -- Forked By Sean Thompson
 *  (c) Sathvik Ponangi, Doers' Guild
 * Licence: CC-By (http://creativecommons.org/licenses/by/3.0/)
 *--------------------------------------------------------------------------*/

// -- MDN Polyfill - https://stackoverflow.com/questions/20428877/javascript-remove-doesnt-work-in-ie -- //
(function (arr) {
    arr.forEach(function (item) {
        if (item.hasOwnProperty('remove')) {
            return;
        }
        Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
            this.parentNode.removeChild(this);
        }
        });
});
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
  
(function($){
    "use strict";
  
    function createIframe(htmlContent){
        var deferred = $.Deferred();
        var printIframe = $('<iframe id="printableIframe" style="top: -999px; left: -999px; position: absolute; height: 0; width: 0; border: 0;">', {
            doctype: '<!doctype html>',
        }).prependTo('body');

        printIframe.load(deferred.resolve);
        
        var iframeContent = document.getElementById('printableIframe');
        var iframeWindow = iframeContent.contentWindow || iframeContent.contentDocument || iframeContent;
        var writeIframe = iframeWindow.document || iframeWindow.contentDocument || iframeWindow;
        writeIframe.open();
        writeIframe.write(htmlContent);
        writeIframe.close();

        return deferred.promise();
    }

    // -- Dom Node Object Test; Encountered This Issue With I.E. -- //
    function isNode(o) {
        /* http://stackoverflow.com/a/384380/937891 */
        return !!(typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
    }
  
    $.selectHtmlPrint = $.fn.selectHtmlPrint = function() {
        var selectHtmlPrintPromise = $.Deferred();
        var self = this;
        var $this;

        if (self instanceof $){
            self = self.get(0);
        }

        if (isNode(self)){
            $this = $(self);
        } else {
        $this = $("html");
        }
  
        var htmlContentCopy = $this.clone();
        var $styles = $('');
        $styles = $("style, link, meta, base, title");
        htmlContentCopy = $('<span/>').append(htmlContentCopy);
        htmlContentCopy.append($styles.clone());
        htmlContentCopy.find('.no-print').remove();
  
        var htmlContentCopyIframe = htmlContentCopy.html();
        if(!document.getElementById("printableIframe")){
            $.when(createIframe(htmlContentCopyIframe)).then(function(){
                setTimeout(function(){
                    document.getElementById("printableIframe").contentWindow.focus();
                    document.getElementById("printableIframe").contentWindow.print();
                    document.getElementsByTagName('body')[0].focus();
                    selectHtmlPrintPromise.resolve(document.getElementById("printableIframe").remove());
                }, 500);
            }, function(){
                //Fail 
                console.log('Failed to print from the iframe.');
            });
        }
        
        htmlContentCopy.remove();
        return selectHtmlPrintPromise.promise();
    }
  
}(jQuery));