import hotelManager from "./HotelHub";

describe("Testes para o gerenciamento de hotéis com quartos", () => {
    beforeEach(() => {
        hotelManager.clearHotels();
        hotelManager.clearReservations();
    });

    test("Teste para criar um hotel", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        expect(hotel).toEqual({ id: 1, name: "Hotel Teste", location: "Localização Teste", rooms: [] });
    });

    test("Teste para listar hotéis", () => {
        hotelManager.createHotel("Hotel A", "Localização A");
        hotelManager.createHotel("Hotel B", "Localização B");
        expect(hotelManager.listHotels()).toHaveLength(2);
    });

    test("Teste para adicionar quarto ao hotel", () => {
        const hotel = hotelManager.createHotel("Hotel A", "Localização A");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        expect(room).toEqual({ id: 1, roomNumber: 101, isBooked: false });
        expect(hotelManager.listRooms(hotel.id)).toHaveLength(1);
    });

    test("Teste para limpar hotéis", () => {
        hotelManager.createHotel("Hotel A", "Localização A");
        hotelManager.clearHotels();
        expect(hotelManager.listHotels()).toHaveLength(0);
    });

    test("Teste para criar uma reserva com quarto disponível", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        const reservation = hotelManager.createReservation(hotel.id, room.id, "João Silva");
        expect(reservation).toEqual({
            id: 1,
            hotelId: hotel.id,
            roomId: room.id,
            guestName: "João Silva",
            checkIn: null,
            checkOut: null,
        });
    });

    test("Teste para erro ao criar reserva em quarto que já está reservado", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        hotelManager.createReservation(hotel.id, room.id, "João Silva");

        expect(() => {
            hotelManager.createReservation(hotel.id, room.id, "Maria Silva");
        }).toThrowError("Room is already booked.");
    });

    test("Teste para criar e listar reservas", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        const room1 = hotelManager.addRoomToHotel(hotel.id, 101);
        const room2 = hotelManager.addRoomToHotel(hotel.id, 102);

        hotelManager.createReservation(hotel.id, room1.id, "João Silva");
        hotelManager.createReservation(hotel.id, room2.id, "Maria Silva");

        expect(hotelManager.listReservations()).toHaveLength(2);
    });

    test("Teste para deletar uma reserva e liberar o quarto", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        const reservation = hotelManager.createReservation(hotel.id, room.id, "João Silva");

        hotelManager.deleteReservation(reservation.id);
        expect(hotelManager.listReservations()).toHaveLength(0);
        expect(hotelManager.listRooms(hotel.id).find(r => r.id === room.id).isBooked).toBe(false);
    });

    test("Teste para erro ao criar reserva em hotel que não existe", () => {
        expect(() => {
            hotelManager.createReservation(999, 1, "Cliente");
        }).toThrowError("Hotel not found.");
    });

    test("Erro ao criar hotel sem nome ou localização", () => {
        expect(() => hotelManager.createHotel("", "Localização Teste")).toThrowError("Nome do hotel inválido.");
        expect(() => hotelManager.createHotel("Hotel Teste", "")).toThrowError("Localização do hotel inválida.");
    });
    
    test("Erro ao criar hotel com nome duplicado", () => {
        hotelManager.createHotel("Hotel Duplicado", "Localização A");
        expect(() => hotelManager.createHotel("Hotel Duplicado", "Localização B")).toThrowError("Hotel com este nome já existe.");
    });
    
    test("Erro ao atualizar hotel com nome ou localização vazios", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        expect(() => hotelManager.updateHotel(hotel.id, "", "Nova Localização")).toThrowError("Nome do hotel inválido.");
        expect(() => hotelManager.updateHotel(hotel.id, "Novo Hotel", "")).toThrowError("Localização do hotel inválida.");
    });
    
    test("Deletar hotel deve deletar reservas associadas", () => {
        const hotel = hotelManager.createHotel("Hotel A", "Localização A");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        hotelManager.createReservation(hotel.id, room.id, "Cliente 1");
    
        hotelManager.deleteHotel(hotel.id);
        expect(hotelManager.listReservations()).toHaveLength(0);
    });

    test("Teste para atualizar uma reserva", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        const reservation = hotelManager.createReservation(hotel.id, room.id, "João Silva");
    
        const updatedReservation = hotelManager.updateReservation(reservation.id, hotel.id, room.id, "Maria Silva");
        expect(updatedReservation.guestName).toBe("Maria Silva");
    });

    test("Erro ao criar reserva sem nome de hóspede", () => {
        const hotel = hotelManager.createHotel("Hotel Reserva", "Localização");
        expect(() => hotelManager.createReservation(hotel.id, "")).toThrowError("Nome do hóspede inválido.");
    });
        
    test("Teste para erro ao criar reserva em quarto inexistente", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        expect(() => {
            hotelManager.createReservation(hotel.id, 999, "Cliente");
        }).toThrowError("Room not found.");
    });
    
    test("Teste para fazer check-in", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        const reservation = hotelManager.createReservation(hotel.id, room.id, "João Silva");
    
        const checkedInReservation = hotelManager.checkIn(reservation.id);
        expect(checkedInReservation.checkIn).not.toBeNull();
    });
    
    test("Teste para fazer check-out e liberar o quarto", () => {
        const hotel = hotelManager.createHotel("Hotel Teste", "Localização Teste");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        const reservation = hotelManager.createReservation(hotel.id, room.id, "João Silva");
    
        hotelManager.checkIn(reservation.id);
        hotelManager.checkOut(reservation.id);
    
        const updatedRoom = hotelManager.listRooms(hotel.id).find(r => r.id === room.id);
        expect(updatedRoom.isBooked).toBe(false);
    });
    
    test("Teste para limpar hotéis", () => {
        hotelManager.createHotel("Hotel A", "Localização A");
        hotelManager.clearHotels();
        expect(hotelManager.listHotels()).toHaveLength(0);
    });
    
    test("Teste para limpar reservas", () => {
        const hotel = hotelManager.createHotel("Hotel A", "Localização A");
        const room = hotelManager.addRoomToHotel(hotel.id, 101);
        hotelManager.createReservation(hotel.id, room.id, "João Silva");
        hotelManager.clearReservations();
        expect(hotelManager.listReservations()).toHaveLength(0);
    });



});
