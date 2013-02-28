## What does this button do?
aside that my first repo, this is a js script loader,
that addresses some problems I came across using other script loaders

for example deeply nested dependencies.
some loader solves this by loading every script and figuring out the right order to execute

I find it counter intuitive. What's the point of having dynamically loading scripts if they
will execute sequentially anyway.
Others doesn't even care that you have nested dependencies, they will just load
async everything in order you required them.

With deepdep, you can build applications intuitively like in any environment that
supports native source inclusion.

## How does this work, then?

**Important Note:**
deepdep bundles includes, and you can execute a bundle by calling `.loaded()`
you have to call `.loaded()` if you want your scripts to be loaded

`.loaded()` returns the deepdep function, so you can start with a new loading session
right away

the api is very simple

you can `.include()` scripts like so

    deepdep.include("some.js", "/other.js", "../that-one.js").loaded(function(){
      // .. all of them loaded and executed
    })

or bundle includes

    deepdep
      .include("some.js", "/other.js", "../that-one.js")
      .include("yet.js", "another.js", "../script.js")
      .loaded(function(){
        // .. all of them loaded and executed
      })

this comes in handy when you want to tell the loader where to load `.from()`
different bundles
this way you can set an include path for that bundle

    deepdep
      // this/path/some.js
      // /other.js
      // this/that-one.js
      .include("some.js", "/other.js", "../that-one.js").from("this/path")
      .include("yet.js", "/another.js", "../script.js")
      .loaded(function(){
        // .. all of them loaded and executed
      })

and here comes the fun part
you can `.watch()` namespaces whether they are defined yet or not
and this will prevent the execution of the loader script if not all of them are defined

watched namespaces will be added to the loaders argument list so you can reference them

but this only works if those scripts really do create that namespace, otherwise the loader will
never execute

you don't have to write window, but it's the default namespace root as of now

    deepdep
      .include("some.js", "/other.js", "../that-one.js")
      .from("that/dir")
      .watch("window.some", "other", "thatOne")
      .loaded(function( some, other, thatOne){
        // .. all of them loaded and executed
      })

## The catch

The only catch is that you need to use global namespaces.

We all know that it's a no-no in javascript, but think about it this way.

This is global namespace pollution:

    function pollute( garbage ){
      i = garbage
      if( i < 0 ){
        return ++i
      }
      else return garbage
    }

and this, is namespacing:

    (function(){
      var module = {
        stuff: true,
        method: function(){}
      }
      window.module = module
    }())

so if you are concerned if setting a global value will result in not getting a gift from Santa,
I can assure you you can still be a good boy and use globals in javascript.

Just be sure you use them what they are for.