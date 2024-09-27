import { openDb } from './database.js'; // Certifique-se de que o caminho está correto e que a extensão ".js" é incluída.
const db = openDb();

class HotelHub {
    constructor() {
        this.hotels = [];
        this.reservations = [];
        this.nextHotelId = 1;
        this.nextReservationId = 1;
        this.nextRoomId = 1;
        this.db = db;
    }

    createHotel(name, location) {
        if (!name) throw new Error("Nome do hotel inválido.");
        if (!location) throw new Error("Localização do hotel inválida.");
        if (this.hotels.find(h => h.name === name)) throw new Error("Hotel com este nome já existe.");
        
        const newHotel = { id: this.hotels.length + 1, name, location, rooms: [] }; 
        this.hotels.push(newHotel);
        return newHotel;
    }
    
    listHotels() {
        return this.hotels;
    }

    updateHotel(id, name, location) {
        const hotel = this.hotels.find(h => h.id === id);
        if (!hotel) throw new Error("Hotel not found.");
        if (!name) throw new Error("Nome do hotel inválido.");
        if (!location) throw new Error("Localização do hotel inválida.");

        hotel.name = name;
        hotel.location = location;
        return hotel;
    }

    deleteHotel(id) {
        const index = this.hotels.findIndex(h => h.id === id);
        if (index === -1) throw new Error("Hotel not found.");

        // Remover todas as reservas associadas ao hotel
        this.reservations = this.reservations.filter(r => r.hotelId !== id);

        this.hotels.splice(index, 1);
    }
    
    addRoomToHotel(hotelId, roomNumber) {
        const hotel = this.hotels.find(h => h.id === hotelId);
        if (!hotel) throw new Error("Hotel not found.");
        const newRoom = { id: hotel.rooms.length + 1, roomNumber, isBooked: false };
        hotel.rooms.push(newRoom);
        return newRoom;
    }

    listRooms(hotelId) {
        const hotel = this.hotels.find(h => h.id === hotelId);
        if (!hotel) throw new Error("Hotel not found.");
        return hotel.rooms;
    }

    createReservation(hotelId, roomId, guestName) {
        if (!guestName) throw new Error("Nome do hóspede inválido.");

        const hotel = this.hotels.find(h => h.id === hotelId);
        if (!hotel) throw new Error("Hotel not found.");

        const room = hotel.rooms.find(r => r.id === roomId);
        if (!room) throw new Error("Room not found.");
        if (room.isBooked) throw new Error("Room is already booked.");

        room.isBooked = true;

        const newReservation = { 
            id: this.reservations.length + 1, 
            hotelId, 
            roomId, 
            guestName,
            checkIn: null,  
            checkOut: null 
        };
        this.reservations.push(newReservation);
        return newReservation;
    }

    listReservations() {
        return this.reservations;
    }

    updateReservation(id, hotelId, roomId, guestName) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) throw new Error("Reservation not found.");

        const hotel = this.hotels.find(h => h.id === hotelId);
        if (!hotel) throw new Error("Hotel not found.");

        const room = hotel.rooms.find(r => r.id === roomId);
        if (!room) throw new Error("Room not found.");

        reservation.hotelId = hotelId;
        reservation.roomId = roomId;
        reservation.guestName = guestName;
        return reservation;
    }

    deleteReservation(id) {
        const index = this.reservations.findIndex(r => r.id === id);
        if (index === -1) throw new Error("Reservation not found.");

        const reservation = this.reservations[index];
        const hotel = this.hotels.find(h => h.id === reservation.hotelId);
        const room = hotel.rooms.find(r => r.id === reservation.roomId);

        room.isBooked = false;

        this.reservations.splice(index, 1);
    }

    checkIn(id) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) throw new Error("Reservation not found.");
        if (reservation.checkIn) throw new Error("Guest has already checked in.");
        reservation.checkIn = new Date(); 
        return reservation;
    }

    checkOut(id) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) throw new Error("Reservation not found.");
        if (!reservation.checkIn) throw new Error("Guest hasn't checked in yet.");
        if (reservation.checkOut) throw new Error("Guest has already checked out.");
        reservation.checkOut = new Date();

        const hotel = this.hotels.find(h => h.id === reservation.hotelId);
        const room = hotel.rooms.find(r => r.id === reservation.roomId);
        room.isBooked = false;

        return reservation;
    }

    clearHotels() {
        this.hotels = [];
    }

    clearReservations() {
        this.reservations = [];
    }

    async saveHotelsToDB() {
        const db = await openDb();
        await db.exec(`CREATE TABLE IF NOT EXISTS hotels (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            location TEXT NOT NULL
        )`);

        const promises = this.hotels.map(hotel => {
            return db.run(`INSERT INTO hotels (id, name, location) VALUES (?, ?, ?)`, 
                [hotel.id, hotel.name, hotel.location]);
        });

        await Promise.all(promises);
        await db.close();
    }

    async saveReservationsToDB() {
        const db = await openDb();
        await db.exec(`CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY,
            hotelId INTEGER NOT NULL,
            roomId INTEGER NOT NULL,
            guestName TEXT NOT NULL,
            checkIn TEXT,
            checkOut TEXT,
            FOREIGN KEY (hotelId) REFERENCES hotels(id)
        )`);

        const promises = this.reservations.map(reservation => {
            return db.run(`INSERT INTO reservations (id, hotelId, roomId, guestName, checkIn, checkOut) VALUES (?, ?, ?, ?, ?, ?)`, 
                [reservation.id, reservation.hotelId, reservation.roomId, reservation.guestName, reservation.checkIn, reservation.checkOut]);
        });

        await Promise.all(promises);
        await db.close();
    }
}

const hotelManager = new HotelHub();

export default hotelManager;
