describe("Parser service", function(){

  var itemSelector = '.post',
      nextSelector = '.pagination__next';

  var parse;


  function getPage() {
    return $.ajax({url: '/base/test/fixtures/page-2.html'});
  }


  beforeEach(function(){
    parse = parserService(itemSelector, nextSelector);
  });


  it("should return a parsing function", function(){
    expect(typeof parse).toBe('function');
  });


  it("should parse the response data", function(done){
    getPage().then(function(data){
      var parsedData = parse(data);

      expect(parsedData.items.length).toBe(4);
      expect(parsedData.nextUrl).toBe('/base/test/fixtures/page-3.html');

      done();
    });
  });

});
