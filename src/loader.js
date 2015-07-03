/**
 * @name loader
 *
 * @param {function(data:string)} parse
 * @param {boolean} waitForImages
 *
 * @returns {{load: Function}}
 *
 */
function loaderService(parse, waitForImages) {
  return {

    /**
     * @param {string} url
     * @returns {Promise}
     */
    load : function(url) {
      return $.ajax({url: url}).then(function(data){
        var parsedData = parse(data);

        if (waitForImages) {
          return parsedData.items.imagesReady().then(function(){
            return parsedData;
          });
        }
        else {
          return parsedData;
        }
      });
    }

  };
}
