!function( win, doc ){
  deepdep.include("some1.js").from("../test/some").loaded(function(  ){
    console.log("that is here")
    win.dat = "dat"
  })
}(window, document);