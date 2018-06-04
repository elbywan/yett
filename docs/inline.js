(function(){
    const div = document.createElement('div')
    div.innerHTML = 'The inline script added via a &lt;script&gt; tag has been executed.'
    document.getElementById('content').appendChild(div)
})()