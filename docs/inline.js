(function(){
    var div = document.createElement('div')
    div.innerHTML = '<a href="https://github.com/snipsco/yett/blob/master/docs/inline.js" target="_blank">The inlined &lt;script&gt; tag has been executed.</a>'
    document.getElementById('content').appendChild(div)
})()