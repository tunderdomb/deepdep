
(function( win, doc ){
  var head = doc.getElementsByTagName("head")[0]
    , scripts = {}
    , waitingline = []

  function makePath( src, includePath ){
    return /^(?:\/|https?:\/\/)/.test(src) || !includePath
      ? src
      : includePath.replace(/\/$/, "") + "/" + src
  }

  function inject( src, notifyBundle, includePath ){
    var script
    src = makePath(src, includePath)

    if ( scripts[src] == 2 ) {
      notifyBundle()
      notifyWaitingLine()
      return
    }
    if ( scripts[src] == 1 ) return true
    scripts[src] = 1

    script = doc.createElement("script")
    script.onload = script.onerror = script.onreadystatechange = function(){
      if ( script.readyState && !(/^c|loade/.test(script.readyState) || scripts[src]) ) return;
      script.onload = script.onreadystatechange = null
      scripts[src] = 2
      notifyBundle()
      notifyWaitingLine()
      //        head.removeChild(script)
    }
    script.async = 1
    script.src = src
    head.insertBefore(script, head.childNodes[0])
  }

  function notifyWaitingLine(){
    var i = -1
    while ( ++i < waitingline.length ) {
      if ( waitingline[i]() ) {
        waitingline.splice(i, 1)
        i = -1
      }
    }
  }

  function isNamespaceDeclared( nsArray ){
    var ns = window
      , name
      , i = -1
    while ( name = nsArray[++i] ) {
      ns = ns[name]
      if ( ns === undefined ) return
    }
    return ns
  }

  function deepdep( includes, includePath, watchedGlobals, loaded ){
    var dep = new Dep(includes)
    if ( loaded ) {
      dep.from(includePath).watch(watchedGlobals).loaded(loaded)
    }
    else if ( watchedGlobals ) {
      typeof includePath == "string"
        ? dep.from(includePath).loaded(watchedGlobals)
        : dep.watch(includePath).loaded(watchedGlobals)
    }
    else {
      includePath && dep.loaded(includePath)
    }
    return dep
  }

  deepdep.include = function(){
    return deepdep(arguments, deepdep.includePath)
  }
  deepdep.setIncludePath = function( includePath ){
    deepdep.includePath = includePath
  }

  function Bundle( includes ){
    this.includes = includes
    this.length = includes.length
    this.includePath = ""
    this.watchedGlobals = []
    this.delayed = false
  }

  Bundle.prototype = {
    from: function( includePath ){
      this.includePath = includePath
    },
    watch: function( namespaces ){
      for ( var i = -1, l = namespaces.length; ++i < l; ) {
        this.watchedGlobals.push(namespaces[i].split("."))
      }
      return this
    },
    delay: function(){
      var bundle = this
      this.delayed || (this.delayed = waitingline.push(function(){
        return bundle.notify()
      }))
    },
    notify: function(){
      var loadedWatches = []
        , ns
      --this.length
      for ( var i = -1, l = this.watchedGlobals.length; ++i < l; ) {
        ns = isNamespaceDeclared(this.watchedGlobals[i])
        if ( !ns ) {
          this.delay()
          return
        }
        loadedWatches.push(ns)
      }
      return this.length < 1 && !this.notifier(loadedWatches)
    },
    inject: function( notifier ){
      var include
        , bundle = this
      this.notifier = notifier
      function notif(){
        return bundle.notify()
      }
      while ( include = this.includes.shift() ) {
        inject(include, notif, this.includePath)
      }
    }
  }

  function Dep( includes ){
    this.bundles = []
    this.length = 0
    this.include.apply(this, includes)
  }

  Dep.prototype = {
    from: function( includePath ){
      this.bundles[this.bundles.length - 1].from(includePath)
      return this
    },
    watch: function(){
      this.bundles[this.bundles.length - 1].watch(arguments)
      return this
    },
    loaded: function( callback ){
      var bundle
        , l = this.length
        , watches = []
      function notif(loadedWatches){
        watches = watches.concat(loadedWatches)
        --l < 1 && callback && callback.apply(null, watches)
      }
      while( bundle = this.bundles.shift() ){
        bundle.inject(notif)
      }
      return deepdep
    },
    include: function(){
      this.bundles.push(new Bundle([].slice.call(arguments)))
      ++this.length
      return this
    }
  }

  win.deepdep = deepdep
}(window, document))