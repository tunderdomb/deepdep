!function( win, doc ){
  console.log("entry waiting for dummy1 and dummy2")

  deepdep([
    "dummy1",
    "dummy4"
  ], function(  ){
    console.log("entry is here")
  })

}(window, document);