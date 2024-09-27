import express from 'express';
import { openDb } from './database.js';
import hotelManager from './HotelHub.js';

const app = express();
const PORT = 3000;

// Middleware para parsing de JSON
app.use(express.json());

// Rota para adicionar hotel
app.post('/api/hotels', async (req, res) => {
    const { name, location } = req.body;
    try {
        const newHotel = hotelManager.createHotel(name, location);
        await hotelManager.saveHotelsToDB(); // Salva no banco de dados
        res.status(201).json(newHotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rota para listar hotéis
app.get('/api/hotels', async (req, res) => {
    const hotels = hotelManager.listHotels();
    res.status(200).json(hotels);
});

// Rota para atualizar hotel
app.put('/api/hotels/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location } = req.body;
    try {
        const updatedHotel = hotelManager.updateHotel(Number(id), name, location);
        await hotelManager.saveHotelsToDB();
        res.status(200).json(updatedHotel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rota para deletar hotel
app.delete('/api/hotels/:id', async (req, res) => {
    const { id } = req.params;
    try {
        hotelManager.deleteHotel(Number(id));
        await hotelManager.saveHotelsToDB();
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rota para adicionar reserva
app.post('/api/reservations', async (req, res) => {
    const { hotelId, roomId, guestName } = req.body;
    try {
        const newReservation = hotelManager.createReservation(hotelId, roomId, guestName);
        await hotelManager.saveReservationsToDB();
        res.status(201).json(newReservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rota para listar reservas
app.get('/api/reservations', (req, res) => {
    const reservations = hotelManager.listReservations();
    res.status(200).json(reservations);
});

// Rota para atualizar reserva
app.put('/api/reservations/:id', async (req, res) => {
    const { id } = req.params;
    const { hotelId, roomId, guestName } = req.body;
    try {
        const updatedReservation = hotelManager.updateReservation(Number(id), hotelId, roomId, guestName);
        await hotelManager.saveReservationsToDB();
        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Rota para deletar reserva
app.delete('/api/reservations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        hotelManager.deleteReservation(Number(id));
        await hotelManager.saveReservationsToDB();
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
