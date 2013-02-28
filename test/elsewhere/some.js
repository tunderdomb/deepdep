!function( win, doc ){
  deepdep.include("elsewhere/dependonme.js").loaded(function(  ){
    console.log("some is here")
    win.some = "some"
  })
}(window, document);