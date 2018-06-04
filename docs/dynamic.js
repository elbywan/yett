(function(){
    var div = document.createElement('div')
    div.innerHTML = 'The script contained inside a dynamically added script tag has been executed.'
    document.getElementById('content').appendChild(div)
})()