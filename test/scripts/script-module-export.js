export default function(id){
    const div = document.createElement('div')
    div.id = id
    document.getElementById('content').appendChild(div)
}