/**
 * @name parser
 *
 * @param {string} itemSelector
 * @param {string} nextSelector
 *
 * @returns {function(data:string)}
 *
 */
function parserService(itemSelector, nextSelector) {
  return function(data) {
    data = $('<div>' + data + '</div>');

    return {
      items: data.find(itemSelector),
      nextUrl: data.find(nextSelector).attr('href')
    };
  };
}
