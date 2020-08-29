//chat.js would have access to functions in socket.io.js
//this will call up the new websocket in the client side
const socket = io()

//elements from html
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $shareLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')
const $scrollBottom = document.querySelector('#scroll-bottom')


//html templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $groupdataTemplate = document.querySelector('#groupdata-template').innerHTML

// When the user clicks on the button, scroll to the latest message
function godown ()
{ $messages.lastElementChild.scrollIntoView();
}

//Using qs(query string) lib to parse username and group
const { username, group } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //new message
    const $newMessage = $messages.lastElementChild

    //new msg height
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //message container height
    const containerHeight = $messages.scrollHeight

    //how far scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}



socket.on('message', (msg) => {
    console.log(msg)
    //render mustache lib to render the html template for instant messaging
    //2nd parameter in the render is the dynamic key (KEY:VALUE pair) mentioned in the template
    //calling moment lib to manipulate the time
    const html = Mustache.render($messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('ddd, h:mm a')
    })
    //adding the html to the message area
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
    const newScrollTopHeight = $messages.scrollTop
    $messages.onscroll = function() {
        scrollFunction()
    }
    function scrollFunction() {
        if (newScrollTopHeight - $messages.scrollTop > 250) {
          $scrollBottom.style.display = "block";
        } else {
            $scrollBottom.style.display = "none";
        }
      }
       
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render($locationTemplate, {
        username: location.username,
        location: location.location,
        createdAt: moment(location.createdAt).format('ddd, h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.emit('join', { username, group }, (error) => {
    if(error){
    alert(error)
    //redirect to home
    location.href = '/'
    }

})

socket.on('groupData', ({ group, users })=>{
    const html = Mustache.render($groupdataTemplate, {
        group: group,
        users : users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable the submit button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    //callback func can be included for acknowledgment receipt
    socket.emit('sendMessage', message, (error) => {
        //enable submit button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
        return alert(error)
        }
        
    })
})

$shareLocationButton.addEventListener('click', ()=> {
   
    //checking if browser has geocode support
    if(!navigator.geolocation){
        return alert('Geolocation is not supported in your browser!')
    }

    //disabling button
    $shareLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((location) => {

        //console.log(location)
        socket.emit('sendLocation', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        }, (message)=> {
            //enabling button
             $shareLocationButton.removeAttribute('disabled')
            //console.log(message)
        })
    })
})


