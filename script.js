document.addEventListener('DOMContentLoaded', () => {
    const addHotelButton = document.getElementById('addHotelButton');
    const hotelList = document.getElementById('hotelList');

    // Função para adicionar hotel
    addHotelButton.addEventListener('click', async () => {
        const name = document.getElementById('hotelName').value;
        const location = document.getElementById('hotelLocation').value;

        if (name && location) {
            try {
                const response = await fetch('http://localhost:3000/api/hotels', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, location })
                });

                if (response.ok) {
                    const newHotel = await response.json();
                    addHotelToList(newHotel);
                    document.getElementById('hotelName').value = '';
                    document.getElementById('hotelLocation').value = '';
                } else {
                    const error = await response.json();
                    alert(error.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Erro ao adicionar hotel.');
            }
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    // Função para listar hotéis
    async function listHotels() {
        try {
            const response = await fetch('http://localhost:3000/api/hotels');
            const hotels = await response.json();
            hotels.forEach(hotel => addHotelToList(hotel));
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Função para adicionar hotel à lista no HTML
    function addHotelToList(hotel) {
        const li = document.createElement('li');
        li.textContent = `${hotel.name} - ${hotel.location}`;
        hotelList.appendChild(li);
    }

    // Chama a função para listar hotéis ao carregar a página
    listHotels();
});
