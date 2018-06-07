(function(){
    var div = document.createElement('div')
    div.innerHTML = '<a href="https://github.com/snipsco/yett/blob/master/docs/dynamic.js" target="_blank">The script contained inside a dynamically added script tag has been executed.</a>'
    document.getElementById('content').appendChild(div)
})()