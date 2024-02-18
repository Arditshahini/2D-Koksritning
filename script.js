let rectangleCounter = 0
let selectedRectangle = null
let offsetX = 0
let offsetY = 0
const rectangles = []
let lastRectangle = null // Variabel för att lagra den senast skapade rektangeln

// Hämta modalen, knappen för att öppna modalen och stängningsikonen
const modal = document.getElementById('myModal')
const btn = document.getElementById('myBtn')
const span = document.querySelector('#myModal .close')

// När användaren klickar på knappen, öppna modalen
btn.onclick = function () {
    modal.style.display = 'block'
}

// När användaren klickar på stängningsikonen, stäng modalen
span.onclick = function () {
    modal.style.display = 'none'
}

// När användaren klickar någonstans utanför modalen, stäng den
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none'
        popupOverlay.style.display = 'none'
    }
}

// Funktion för att lägga till rektangel med specifika mått

function addFront(width, height) {
    const canvas = document.getElementById('canvas')
    const rectangle = document.createElement('div')
    rectangle.className = 'rectangle'

    // Sätt storlek på rektangeln
    const widthPX = (width * 4) / 40 // Konvertera millimeter till pixlar
    const heightPX = (height * 4) / 40 // Konvertera millimeter till pixlar
    rectangle.style.width = widthPX + 'px'
    rectangle.style.height = heightPX + 'px'

    // Placera rektangeln i mitten 100px från vänster sida
    rectangle.style.top = '50%'
    rectangle.style.left = 'calc(50% - ' + widthPX / 2 + 'px - 100px)'

    // Om det finns en senast skapad rektangel, placera den bredvid till höger
    if (lastRectangle) {
        const lastRectLeft = parseInt(lastRectangle.style.left)
        const lastRectWidth = parseInt(lastRectangle.style.width)
        rectangle.style.left = lastRectLeft + lastRectWidth + 0 + 'px' // 10px avstånd mellan rektanglarna
    }

    rectangle.setAttribute('data-id', ++rectangleCounter) // Sätt ett unikt identifierare för rektangeln

    // Lägg till knappar för att ändra storlek och ta bort rektangeln
    const resizeButton = document.createElement('button')
    resizeButton.className = 'resizeButton'
    resizeButton.textContent = 'Resize'
    resizeButton.onclick = function () {
        const newWidth = prompt('Ange ny bredd (mm):') // Fråga användaren om ny bredd
        const newHeight = prompt('Ange ny höjd (mm):') // Fråga användaren om ny höjd

        // Kontrollera om användaren har angett värden och att de är giltiga
        if (
            newWidth &&
            newHeight &&
            !isNaN(newWidth) &&
            !isNaN(newHeight) &&
            newWidth > 0 &&
            newHeight > 0
        ) {
            // Ändra storleken på rektangeln
            rectangle.style.width = (newWidth * 4) / 40 + 'px' // Konvertera millimeter till pixlar och uppdatera bredden
            rectangle.style.height = (newHeight * 4) / 40 + 'px' // Konvertera millimeter till pixlar och uppdatera höjden
        } else {
            alert(
                'Felaktiga dimensioner. Vänligen ange giltiga nummer för bredd och höjd.'
            )
        }
    }
    rectangle.appendChild(resizeButton)

    const deleteButton = document.createElement('span')
    deleteButton.className = 'deleteButton'
    deleteButton.textContent = 'X'
    deleteButton.onclick = function (event) {
        event.stopPropagation()
        const rectangle = this.parentNode
        deleteRectangle(rectangle)
        updateRectangleList()
    }
    rectangle.appendChild(deleteButton)

    rectangle.addEventListener('mousedown', startDragging)

    canvas.appendChild(rectangle)

    // Uppdatera den senast skapade rektangeln
    lastRectangle = rectangle

    // Lägg till rektangelns information till arrayen rectangles
    rectangles.push({ widthMM: width, heightMM: height, count: 1 })

    updateRectangleList()

    const modal = document.getElementById('myModal')
    modal.style.display = 'none'
}

function updateRectangleList() {
    // Uppdatera listan över rektanglar
    const rectangleList = document.getElementById('rectangleList')
    rectangleList.innerHTML = '' // Rensa listan först

    // Skapa en temporär karta för att räkna antalet rektanglar med samma mått
    const rectangleCountMap = new Map()
    rectangles.forEach((rect) => {
        const key = `${rect.widthMM}x${rect.heightMM}`
        if (rectangleCountMap.has(key)) {
            rectangleCountMap.set(key, rectangleCountMap.get(key) + 1)
        } else {
            rectangleCountMap.set(key, 1)
        }
    })

    // Uppdatera befintliga listelement eller lägg till nya
    rectangles.forEach((rect) => {
        const key = `${rect.widthMM}x${rect.heightMM}`
        const count = rectangleCountMap.get(key)
        let listItem = rectangleList.querySelector(`[data-dimensions="${key}"]`)
        if (!listItem) {
            listItem = document.createElement('div')
            listItem.setAttribute('data-dimensions', key)
            rectangleList.appendChild(listItem)
        }
        listItem.textContent = `Antal: ${count} Mått: ${rect.widthMM}x${rect.heightMM} Modell: - Pris: -`
    })
}

function deleteRectangle(rectangle) {
    const widthPX = parseFloat(rectangle.style.width)
    const heightPX = parseFloat(rectangle.style.height)
    const widthMM = (widthPX * 40) / 4 // Convert pixels to millimeters
    const heightMM = (heightPX * 40) / 4 // Convert pixels to millimeters

    const existingRectangleIndex = rectangles.findIndex(
        (rect) => rect.widthMM === widthMM && rect.heightMM === heightMM
    )
    if (existingRectangleIndex !== -1) {
        rectangles[existingRectangleIndex].count--
        if (rectangles[existingRectangleIndex].count === 0) {
            rectangles.splice(existingRectangleIndex, 1)
        }
    }

    rectangle.parentNode.removeChild(rectangle)
    updateRectangleList()
}

//Denna del är för Drag And Drop funktionen
function startDragging(e) {
    selectedRectangle = e.target
    const rect = selectedRectangle.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top

    window.addEventListener('mousemove', dragRectangle)
    window.addEventListener('mouseup', stopDragging)
}

function dragRectangle(e) {
    if (!selectedRectangle) return

    const canvas = document.getElementById('canvas')
    const canvasRect = canvas.getBoundingClientRect()

    const x = e.clientX - offsetX - canvasRect.left
    const y = e.clientY - offsetY - canvasRect.top

    selectedRectangle.style.left =
        Math.min(
            Math.max(x, 0),
            canvas.clientWidth - parseFloat(selectedRectangle.style.width)
        ) + 'px'
    selectedRectangle.style.top =
        Math.min(
            Math.max(y, 0),
            canvas.clientHeight - parseFloat(selectedRectangle.style.height)
        ) + 'px'

    // Loop through all existing rectangles and adjust the position of the dragging rectangle if it can connect to any of them
    const rectangles = document.querySelectorAll('.rectangle')
    rectangles.forEach((rectangle) => {
        if (rectangle !== selectedRectangle) {
            const rect = rectangle.getBoundingClientRect()
            const rectLeft = rect.left - canvasRect.left
            const rectTop = rect.top - canvasRect.top
            const rectRight =
                rect.left - canvasRect.left + parseFloat(rectangle.style.width)
            const rectBottom =
                rect.top - canvasRect.top + parseFloat(rectangle.style.height)

            const selectedRect = selectedRectangle.getBoundingClientRect()
            const selectedRectLeft = selectedRect.left - canvasRect.left
            const selectedRectTop = selectedRect.top - canvasRect.top
            const selectedRectRight =
                selectedRect.left -
                canvasRect.left +
                parseFloat(selectedRectangle.style.width)
            const selectedRectBottom =
                selectedRect.top -
                canvasRect.top +
                parseFloat(selectedRectangle.style.height)

            // Check if the dragging rectangle is near any of the existing rectangles horizontally
            if (
                ((selectedRectLeft >= rectRight &&
                    selectedRectLeft - rectRight <= 10) ||
                    (rectLeft >= selectedRectRight &&
                        rectLeft - selectedRectRight <= 10)) &&
                selectedRectBottom >= rectTop &&
                selectedRectTop <= rectBottom
            ) {
                // Adjust the position of the dragging rectangle to connect it horizontally
                if (selectedRectLeft >= rectRight) {
                    selectedRectangle.style.left = rectRight + 0 + 'px' // 5px gap + 2px border
                } else {
                    selectedRectangle.style.left =
                        rectLeft -
                        parseFloat(selectedRectangle.style.width) -
                        0 +
                        'px' // 5px gap + 2px border
                }
            }

            // Check if the dragging rectangle is near any of the existing rectangles vertically
            if (
                ((selectedRectTop >= rectBottom &&
                    selectedRectTop - rectBottom <= 5) ||
                    (rectTop >= selectedRectBottom &&
                        rectTop - selectedRectBottom <= 5)) &&
                selectedRectRight >= rectLeft &&
                selectedRectLeft <= rectRight
            ) {
                // Adjust the position of the dragging rectangle to connect it vertically
                if (selectedRectTop >= rectBottom) {
                    selectedRectangle.style.top = rectBottom + 0 + 'px' // 5px gap + 2px border
                } else {
                    selectedRectangle.style.top =
                        rectTop -
                        parseFloat(selectedRectangle.style.height) -
                        0 +
                        'px' // 5px gap + 2px border
                }
            }
        }
    })
}

function stopDragging() {
    selectedRectangle = null
    window.removeEventListener('mousemove', dragRectangle)
    window.removeEventListener('mouseup', stopDragging)
}

//Denna del är för att kunna ändra färg på rektanglarna

const colors = [
    '#F9F8F7',
    '#F3F5F3',
    '#F9F6F0',
    '#F9F9F9',
    '#BFC3C7',
    '#555558',
    '#1A181C',
    '#B4C9BE',
    '#9D9582',
    '#C4CBB6',
    '#D3D7D1',
    '#5A544C',
    '#8E8D83',
    '#B7B1A3',
    '#C2B3AD',
    '#DFD6BD',
    '#D4CEC9',
    '#E3DBD1',
    '#7B7F79',
    '#E7C4B8',
    '#BE9C8A'
]

function addColorCircles() {
    const colorPalette = document.getElementById('colorPalette')

    colors.forEach((color) => {
        const circle = document.createElement('div')
        circle.className = 'colorCircle'
        circle.style.backgroundColor = color
        circle.onclick = function () {
            changeRectangleColor(color)
        }
        colorPalette.appendChild(circle)
    })
}

function changeRectangleColor(color) {
    const rectangles = document.querySelectorAll('.rectangle')
    rectangles.forEach((rectangle) => {
        rectangle.style.backgroundColor = color
    })
}

// Call addColorCircles to add color circles to the palette
addColorCircles()

// Uppdatera deleteButton.onclick-funktionen för att använda rektangelns data-id
deleteButton.onclick = function (event) {
    event.stopPropagation() // Stopp the event from bubbling up to the rectangle
    const rectangle = this.parentNode
    deleteRectangle(rectangle)
}

//Denna del är för att kunna förstora bilderna
function openImage(button) {
    const card = button.closest('.card')
    const image = card.querySelector('img')
    const popupOverlay = document.getElementById('popup-overlay')
    const popupImage = document.getElementById('popup-image')

    popupImage.src = image.src
    popupOverlay.style.display = 'block'
}

function closePopup() {
    const popupOverlay = document.getElementById('popup-overlay')
    popupOverlay.style.display = 'none'
}
// Lägg till en händelsehanterare för klick utanför bilden
document.addEventListener('click', function (event) {
    const popupOverlay = document.getElementById('popup-overlay')
    const popupImage = document.getElementById('popup-image')

    // Kontrollera om klicket inträffade utanför bilden
    if (!popupImage.contains(event.target)) {
        // Stäng ner popup-fönstret
        closePopup()
    }
})
